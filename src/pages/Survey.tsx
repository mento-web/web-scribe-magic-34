import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BmiAnalysis from "@/components/BmiAnalysis";
import { createLead, type Gender } from "@/lib/leads";
import { EVENTS, track, upsertSurveyResponse } from "@/lib/tracking";

// Reusable email validator — matches the schema used in Anmelden.tsx so error
// behavior across the site stays consistent.
const emailSchema = z.string().email();

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: "radio" | "number-pair" | "checkbox";
  options?: { value: string; label: string }[];
  fields?: { id: string; label: string; placeholder: string; suffix?: string }[];
}

const sharedQuestions: Question[] = [
  {
    id: "goal",
    title: "Was ist Ihr Hauptziel?",
    subtitle: "Wählen Sie das Ziel, das am besten zu Ihnen passt.",
    type: "radio",
    options: [
      { value: "lose-weight", label: "Gewicht verlieren" },
      { value: "maintain", label: "Gewicht halten" },
      { value: "health", label: "Gesundheit verbessern" },
      { value: "energy", label: "Mehr Energie im Alltag" },
    ],
  },
  {
    id: "bmi",
    title: "Grösse und Gewicht",
    subtitle: "Diese Angaben helfen uns, Ihren BMI zu berechnen.",
    type: "number-pair",
    fields: [
      { id: "height", label: "Grösse", placeholder: "175", suffix: "cm" },
      { id: "weight", label: "Gewicht", placeholder: "90", suffix: "kg" },
    ],
  },
  {
    id: "tried",
    title: "Haben Sie bereits Diäten oder Programme versucht?",
    type: "radio",
    options: [
      { value: "yes-multiple", label: "Ja, mehrere" },
      { value: "yes-one", label: "Ja, eines" },
      { value: "no", label: "Nein, noch nicht" },
    ],
  },
  {
    id: "conditions",
    title: "Bestehende Vorerkrankungen",
    subtitle: "Wählen Sie alle zutreffenden Optionen.",
    type: "checkbox",
    options: [
      { value: "diabetes-2", label: "Diabetes Typ 2" },
      { value: "hypertension", label: "Bluthochdruck" },
      { value: "cholesterol", label: "Hoher Cholesterinspiegel" },
      { value: "thyroid", label: "Schilddrüsenerkrankung" },
      { value: "none", label: "Keine der genannten" },
    ],
  },
  {
    id: "medications",
    title: "Nehmen Sie derzeit Medikamente ein?",
    type: "radio",
    options: [
      { value: "yes", label: "Ja" },
      { value: "no", label: "Nein" },
    ],
  },
];

type Answers = Record<string, string | string[] | Record<string, string>>;

const SURVEY_STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes checkPop { 0%{transform:scale(0.5);opacity:0;} 70%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }
  @keyframes questionIn { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  .anim-0  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .anim-1  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) .08s both; }
  .anim-2  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) .16s both; }
  .question-enter { animation: questionIn .35s cubic-bezier(.16,1,.3,1) both; }
  .check-pop { animation: checkPop .25s cubic-bezier(.34,1.56,.64,1) both; }
`;

const Survey = () => {
  const { gender } = useParams<{ gender: string }>();
  const navigate = useNavigate();
  const questions = sharedQuestions;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [showBmiCard, setShowBmiCard] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Email capture shown on the `eligible` result screen. Only relevant when
  // the user qualifies — borderline / low-bmi paths skip this entirely.
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const emailValid = emailSchema.safeParse(email).success;

  // Submission state for the "Behandlung buchen" CTA. We INSERT a leads row
  // before navigating to /termin; while that's in flight the button shows a
  // spinner. Failures surface inline and DON'T block navigation — the user
  // can still book even if our lead capture had a hiccup.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const progress = (step / questions.length) * 100;
  const current = questions[step];

  // Fire survey_started once per mount. gender comes from the route param so
  // we can split the funnel by entry path.
  useEffect(() => {
    void track(EVENTS.survey_started, { gender: gender ?? null });
  }, [gender]);

  // Fire eligibility_result the moment we transition into the result screen.
  // Computing result inline here (vs only inside the result branch below)
  // keeps the hook at the top of the component — rules-of-hooks compliant.
  useEffect(() => {
    if (!showResult) return;
    const bmiData = answers["bmi"] as Record<string, string> | undefined;
    let result: "eligible" | "borderline" | "low-bmi" = "borderline";
    if (bmiData) {
      const h = Number(bmiData.height) / 100;
      const w = Number(bmiData.weight);
      if (h > 0 && w > 0) {
        const bmi = w / (h * h);
        if (bmi < 25) result = "low-bmi";
        else if (bmi >= 30) result = "eligible";
        else result = "borderline";
      }
    }
    void track(EVENTS.eligibility_result, { result, gender: gender ?? null });
  }, [showResult, answers, gender]);

  // Persist the current question's answer to survey_responses AND fire a
  // survey_question_answered event. Called from handleRadio (radio auto-
  // advances on click) and from advance() (number-pair + checkbox advance
  // via the Weiter button).
  const persistAnswer = (questionKey: string, answer: unknown) => {
    void upsertSurveyResponse(questionKey, answer);
    void track(EVENTS.survey_question_answered, { question_key: questionKey });
  };

  const canProceed = useMemo(() => {
    const ans = answers[current.id];
    if (current.type === "number-pair") {
      const obj = ans as Record<string, string> | undefined;
      return !!(obj && current.fields!.every((f) => obj[f.id] && Number(obj[f.id]) > 0));
    }
    if (current.type === "checkbox") return Array.isArray(ans) && ans.length > 0;
    return !!ans;
  }, [answers, current]);

  const doAdvance = () => {
    setAnimKey((k) => k + 1);
    setTimeout(() => {
      if (step < questions.length - 1) setStep((s) => s + 1);
      else setShowResult(true);
    }, 180);
  };

  const advance = () => {
    // Persist this question's answer just before leaving it. Reads from
    // `answers` because the Weiter button is only reachable after the user
    // has finished editing this step (number-pair, checkbox).
    persistAnswer(current.id, answers[current.id]);
    if (current.id === "bmi") { setShowBmiCard(true); return; }
    doAdvance();
  };

  const handleRadio = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    // Persist the new answer immediately — `value` is reliable here because
    // we pass it through; reading from `answers` would still be stale.
    persistAnswer(current.id, value);
    setTimeout(() => {
      if (current.id === "bmi") { setShowBmiCard(true); return; }
      doAdvance();
    }, 380);
  };

  const handleNumberField = (fieldId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { ...(prev[current.id] as Record<string, string> || {}), [fieldId]: value },
    }));
  };

  const handleCheckbox = (value: string, checked: boolean) => {
    setAnswers((prev) => {
      const existing = (prev[current.id] as string[]) || [];
      if (value === "none") return { ...prev, [current.id]: checked ? ["none"] : [] };
      const filtered = existing.filter((v) => v !== "none");
      return {
        ...prev,
        [current.id]: checked ? [...filtered, value] : filtered.filter((v) => v !== value),
      };
    });
  };

  const prevStep = () => {
    if (showBmiCard) { setShowBmiCard(false); return; }
    if (step > 0) {
      setAnimKey((k) => k + 1);
      setTimeout(() => setStep((s) => s - 1), 180);
    }
  };

  const getResult = () => {
    const bmiData = answers["bmi"] as Record<string, string> | undefined;
    if (bmiData) {
      const h = Number(bmiData.height) / 100;
      const w = Number(bmiData.weight);
      if (h > 0 && w > 0) {
        const bmi = w / (h * h);
        if (bmi < 25) return "low-bmi";
        if (bmi >= 30) return "eligible";
        return "borderline";
      }
    }
    return "borderline";
  };

  const resetSurvey = () => {
    setStep(0); setAnswers({}); setShowResult(false); setShowBmiCard(false); setAnimKey(0);
    setEmail(""); setEmailTouched(false);
    setIsSubmitting(false); setSubmitError(null);
  };

  /* === handleBookingClick ==================================================
     Survey eligible CTA — INSERTs a leads row, then forwards id + token via
     router state to /termin so the booking page can later UPDATE that row
     with the chosen slot. Inline error on failure; lead persistence is best
     effort, so we still navigate even if Supabase fails (rare). */
  const handleBookingClick = async () => {
    if (!emailValid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Pull the height/weight the user typed in the BMI step. They're guaranteed
    // to be present when eligibility === "eligible" (the calc itself depends
    // on them), but we still guard for the missing case.
    const bmiData = answers["bmi"] as Record<string, string> | undefined;
    const heightCm = bmiData?.height ? Number(bmiData.height) : null;
    const weightKg = bmiData?.weight ? Number(bmiData.weight) : null;
    const bmi =
      heightCm && weightKg
        ? Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(2))
        : null;

    try {
      const { id, leadToken } = await createLead({
        email,
        gender: (gender === "men" ? "men" : "women") as Gender,
        eligibility: "eligible",
        heightCm,
        weightKg,
        bmi,
      });
      void track(EVENTS.lead_created, {
        lead_id: id,
        gender: gender ?? null,
        bmi,
      });
      navigate("/termin", {
        state: { email, leadId: id, leadToken, eligibility: "eligible" },
      });
    } catch (err) {
      // Don't block the funnel — surface the error but still let the user
      // continue without lead persistence by navigating without a leadId.
      console.warn("createLead failed", err);
      setSubmitError("Wir konnten Ihre Anfrage nicht speichern. Sie können trotzdem fortfahren.");
      setIsSubmitting(false);
    }
  };

  // ── BMI interstitial ──
  if (showBmiCard) {
    const bmiData = answers["bmi"] as Record<string, string> | undefined;
    return (
      <BmiAnalysis
        height={Number(bmiData?.height) || 0}
        weight={Number(bmiData?.weight) || 0}
        gender={gender ?? "women"}
        onContinue={() => { setShowBmiCard(false); doAdvance(); }}
        onBack={() => setShowBmiCard(false)}
      />
    );
  }

  // ── Result screen ──
  if (showResult) {
    const result = getResult();
    const cfg = {
      eligible: {
        icon: <CheckCircle className="h-8 w-8" strokeWidth={1.5} />,
        iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500",
        badge: "Geeignet", badgeBg: "bg-emerald-500/10 text-emerald-600",
        title: "Sie sind für eine Behandlung geeignet!",
        body: "Basierend auf Ihren Angaben kommen Sie für eine ärztlich begleitete GLP-1 Therapie in Frage. Buchen Sie jetzt Ihren Termin — ein Schweizer Arzt prüft Ihre Angaben im Gespräch.",
      },
      borderline: {
        icon: <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />,
        iconBg: "bg-amber-500/10", iconColor: "text-amber-500",
        badge: "Beratung empfohlen", badgeBg: "bg-amber-500/10 text-amber-600",
        title: "Ärztliche Beratung empfohlen.",
        body: "Basierend auf Ihren Angaben empfehlen wir ein persönliches Gespräch mit einem unserer Ärzte, um die beste Behandlung für Sie zu bestimmen.",
      },
      "low-bmi": {
        icon: <Shield className="h-8 w-8" strokeWidth={1.5} />,
        iconBg: "bg-muted", iconColor: "text-muted-foreground",
        badge: "Nicht empfohlen", badgeBg: "bg-muted text-muted-foreground",
        title: "Aktuell nicht empfohlen.",
        body: "Ihr BMI liegt im Normalbereich. Eine GLP-1 Therapie wird in der Regel erst ab einem BMI von 27+ empfohlen. Sprechen Sie mit Ihrem Hausarzt über Ihre Möglichkeiten.",
      },
    }[result];

    return (
      <>
        <style>{SURVEY_STYLES}</style>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="anim-0">
              <div className={`w-16 h-16 rounded-2xl ${cfg.iconBg} flex items-center justify-center mx-auto mb-6`}>
                <span className={cfg.iconColor}>{cfg.icon}</span>
              </div>
              <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6 ${cfg.badgeBg}`}>
                {cfg.badge}
              </span>
            </div>
            {/* Editorial serif title — matches the landing-page typography contrast */}
            <h1 className="anim-1 font-editorial text-5xl md:text-6xl leading-[0.95] tracking-tight mb-5">{cfg.title}</h1>
            <p className="anim-1 text-base text-muted-foreground leading-relaxed mb-10">{cfg.body}</p>

            {/* Eligible-only pricing teaser — off-white card with serif price for editorial weight */}
            {result === "eligible" && (
              <div className="anim-1 bg-muted rounded-[14px] p-6 mb-8 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-1">Behandlungskosten</p>
                    <p className="font-editorial text-4xl leading-none">ab CHF 149</p>
                    <p className="text-xs text-muted-foreground mt-2">pro Monat · inkl. ärztlicher Betreuung</p>
                  </div>
                  <Link to="/pricing">
                    <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                      Preise <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* === Primary CTA block ===
                Eligible users get an email-capture card + "Behandlung buchen"
                pill that forwards the email to /termin via router state.
                Borderline / low-bmi keep the original "Zur Startseite" exit. */}
            <div className="anim-2 flex flex-col gap-3">
              {result === "eligible" ? (
                <>
                  {/* Email input — matches the Anmelden.tsx pattern (uppercase
                      mini-label, bg-muted rounded-2xl card, borderless input). */}
                  <div className="bg-muted rounded-2xl p-4 text-left">
                    <label
                      htmlFor="booking-email"
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground block mb-2"
                    >
                      E-Mail
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="name@beispiel.ch"
                      className="w-full h-10 text-base bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/30"
                    />
                    {emailTouched && !emailValid && email.length > 0 && (
                      <p className="text-xs text-destructive mt-1">
                        Bitte geben Sie eine gültige E-Mail-Adresse ein.
                      </p>
                    )}
                  </div>

                  {/* Primary CTA — disabled until the email validates, spinner
                      while the leads INSERT is in flight. Inline error below
                      if Supabase rejects but does NOT block the next step. */}
                  <Button
                    size="lg"
                    disabled={!emailValid || isSubmitting}
                    onClick={handleBookingClick}
                    className="w-full rounded-full text-base font-medium gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Behandlung buchen <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {submitError && (
                    <p className="text-xs text-destructive text-center" role="alert">
                      {submitError}
                    </p>
                  )}
                </>
              ) : (
                <Link to="/">
                  <Button size="lg" className="w-full rounded-full text-base font-medium gap-2">
                    Zur Startseite <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <button onClick={resetSurvey} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fragebogen wiederholen
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-10 max-w-sm mx-auto leading-relaxed">
              Diese Einschätzung ersetzt keine ärztliche Diagnose. Alle Behandlungen erfolgen gemäss Schweizer Heilmittelgesetz (HMG) und unter ärztlicher Aufsicht.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Question screen ──
  const showCta = current.type !== "radio";

  return (
    <>
      <style>{SURVEY_STYLES}</style>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="container mx-auto flex items-center justify-between h-14 px-5 max-w-xl">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Zurück</span>
            </button>

            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step ? "w-5 h-1.5 bg-foreground" : i < step ? "w-1.5 h-1.5 bg-foreground/40" : "w-1.5 h-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Abbrechen
            </Link>
          </div>
          <div className="h-px bg-border/40 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-foreground transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <main className="flex-1 flex items-start md:items-center">
          <div className="container mx-auto px-5 pt-10 pb-6 max-w-xl w-full">
            <div key={animKey} className="question-enter">
              {/* Editorial serif question title — keeps the calm, confident tone */}
              <div className="mb-8">
                <h2 className="font-editorial text-4xl md:text-5xl leading-[1] tracking-tight mb-3">{current.title}</h2>
                {current.subtitle && <p className="text-sm text-muted-foreground leading-relaxed">{current.subtitle}</p>}
              </div>

              {/* Radio */}
              {current.type === "radio" && (
                <div className="space-y-2.5">
                  {current.options!.map((opt) => {
                    const selected = answers[current.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleRadio(opt.value)}
                        className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 ${
                          selected ? "bg-foreground text-background scale-[1.01]" : "bg-muted hover:scale-[1.005] active:scale-[0.998]"
                        }`}
                      >
                        <span className="flex-1 font-medium text-base">{opt.label}</span>
                        <span className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${selected ? "border-background bg-background" : "border-border/60 group-hover:border-foreground/30"}`}>
                          {selected && <span className="check-pop"><Check className="h-3 w-3 text-foreground" strokeWidth={3} /></span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Number pair (height + weight) */}
              {current.type === "number-pair" && (
                <div className="grid grid-cols-2 gap-3">
                  {current.fields!.map((field) => (
                    <div key={field.id} className="bg-muted rounded-2xl p-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">{field.label}</label>
                      <div className="flex items-end gap-1.5">
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder={field.placeholder}
                          value={(answers[current.id] as Record<string, string>)?.[field.id] || ""}
                          onChange={(e) => handleNumberField(field.id, e.target.value)}
                          className="h-12 text-2xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {field.suffix && <span className="text-sm font-medium text-muted-foreground pb-2 shrink-0">{field.suffix}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {current.type === "checkbox" && (
                <div className="space-y-2.5">
                  {current.options!.map((opt) => {
                    const checked = ((answers[current.id] as string[]) || []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleCheckbox(opt.value, !checked)}
                        className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 ${
                          checked ? "bg-foreground text-background scale-[1.01]" : "bg-muted hover:scale-[1.005] active:scale-[0.998]"
                        }`}
                      >
                        <span className="flex-1 font-medium text-base">{opt.label}</span>
                        <span className={`shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${checked ? "border-background bg-background" : "border-border/60 group-hover:border-foreground/30"}`}>
                          {checked && <span className="check-pop"><Check className="h-3 w-3 text-foreground" strokeWidth={3} /></span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {showCta && (
          <div className="sticky bottom-0 px-5 pb-6 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="container mx-auto max-w-xl">
              {/* Pill CTA — full width, pill shape per DESIGN.md §17 */}
              <Button
                onClick={advance}
                disabled={!canProceed}
                size="lg"
                className="w-full h-14 rounded-full text-base font-medium gap-2 disabled:opacity-20"
              >
                {current.id === "bmi" ? "Analyse anzeigen" : step === questions.length - 1 ? "Ergebnis anzeigen" : "Weiter"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Survey;

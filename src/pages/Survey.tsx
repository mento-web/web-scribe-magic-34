import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    id: "age",
    title: "Wie alt sind Sie?",
    type: "radio",
    options: [
      { value: "18-29", label: "18–29 Jahre" },
      { value: "30-44", label: "30–44 Jahre" },
      { value: "45-59", label: "45–59 Jahre" },
      { value: "60+", label: "60+ Jahre" },
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

const menQuestions: Question[] = [
  ...sharedQuestions.slice(0, 3),
  {
    id: "men-specific",
    title: "Beeinträchtigt Ihr Gewicht Ihre Leistungsfähigkeit?",
    type: "radio",
    options: [
      { value: "yes-significantly", label: "Ja, stark" },
      { value: "yes-somewhat", label: "Ja, etwas" },
      { value: "no", label: "Nein" },
    ],
  },
  ...sharedQuestions.slice(3),
];

const womenQuestions: Question[] = [
  ...sharedQuestions.slice(0, 3),
  {
    id: "women-specific",
    title: "Sind Sie schwanger oder planen Sie eine Schwangerschaft?",
    subtitle: "GLP-1 Medikamente sind während der Schwangerschaft nicht geeignet.",
    type: "radio",
    options: [
      { value: "pregnant", label: "Ja, ich bin schwanger" },
      { value: "planning", label: "Ja, ich plane eine Schwangerschaft" },
      { value: "no", label: "Nein" },
    ],
  },
  ...sharedQuestions.slice(3),
];

type Answers = Record<string, string | string[] | Record<string, string>>;

const Survey = () => {
  const { gender } = useParams<{ gender: string }>();
  const questions = gender === "men" ? menQuestions : womenQuestions;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const progress = (step / questions.length) * 100;
  const current = questions[step];

  const canProceed = useMemo(() => {
    const ans = answers[current.id];
    if (current.type === "number-pair") {
      const obj = ans as Record<string, string> | undefined;
      return obj && current.fields!.every((f) => obj[f.id] && Number(obj[f.id]) > 0);
    }
    if (current.type === "checkbox") return Array.isArray(ans) && ans.length > 0;
    return !!ans;
  }, [answers, current]);

  const advance = () => {
    setAnimKey((k) => k + 1);
    setTimeout(() => {
      if (step < questions.length - 1) setStep((s) => s + 1);
      else setShowResult(true);
    }, 180);
  };

  const handleRadio = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setTimeout(advance, 380);
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
    if (step > 0) {
      setAnimKey((k) => k + 1);
      setTimeout(() => setStep((s) => s - 1), 180);
    }
  };

  const getResult = () => {
    const bmiData = answers["bmi"] as Record<string, string> | undefined;
    const pregnancyAnswer = answers["women-specific"];
    if (pregnancyAnswer === "pregnant" || pregnancyAnswer === "planning") return "not-eligible";
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

  if (showResult) {
    const result = getResult();
    const resultConfig = {
      eligible: {
        icon: <CheckCircle className="h-8 w-8" strokeWidth={1.5} />,
        bg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
        badge: "Geeignet",
        badgeBg: "bg-emerald-500/10 text-emerald-600",
        title: "Sie könnten geeignet sein.",
        body: "Basierend auf Ihren Angaben könnten Sie für eine ärztlich begleitete GLP-1 Therapie in Frage kommen. Ein Schweizer Arzt prüft Ihre Angaben und meldet sich bei Ihnen.",
      },
      borderline: {
        icon: <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />,
        bg: "bg-amber-500/10",
        iconColor: "text-amber-500",
        badge: "Beratung empfohlen",
        badgeBg: "bg-amber-500/10 text-amber-600",
        title: "Ärztliche Beratung empfohlen.",
        body: "Basierend auf Ihren Angaben empfehlen wir ein persönliches Gespräch mit einem unserer Ärzte, um die beste Behandlung für Sie zu bestimmen.",
      },
      "low-bmi": {
        icon: <Shield className="h-8 w-8" strokeWidth={1.5} />,
        bg: "bg-muted",
        iconColor: "text-muted-foreground",
        badge: "Nicht empfohlen",
        badgeBg: "bg-muted text-muted-foreground",
        title: "Aktuell nicht empfohlen.",
        body: "Ihr BMI liegt im Normalbereich. Eine GLP-1 Therapie wird in der Regel erst ab einem BMI von 27+ empfohlen. Sprechen Sie mit Ihrem Hausarzt über Ihre Möglichkeiten.",
      },
      "not-eligible": {
        icon: <X className="h-8 w-8" strokeWidth={1.5} />,
        bg: "bg-destructive/10",
        iconColor: "text-destructive",
        badge: "Nicht geeignet",
        badgeBg: "bg-destructive/10 text-destructive",
        title: "Nicht geeignet.",
        body: "GLP-1 Medikamente sind während der Schwangerschaft oder bei Schwangerschaftsplanung nicht geeignet. Bitte konsultieren Sie Ihren Arzt für alternative Möglichkeiten.",
      },
    }[result];

    return (
      <>
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .anim-result { animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .anim-result-delay { animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
          .anim-result-delay2 { animation: fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        `}</style>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="anim-result">
              <div className={`w-16 h-16 rounded-2xl ${resultConfig.bg} flex items-center justify-center mx-auto mb-6`}>
                <span className={resultConfig.iconColor}>{resultConfig.icon}</span>
              </div>
              <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6 ${resultConfig.badgeBg}`}>
                {resultConfig.badge}
              </span>
            </div>

            <h1 className="anim-result-delay text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
              {resultConfig.title}
            </h1>
            <p className="anim-result-delay text-base text-muted-foreground leading-relaxed mb-10">
              {resultConfig.body}
            </p>

            {result === "eligible" && (
              <div className="anim-result-delay bg-card rounded-2xl p-6 mb-8 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Behandlungskosten</p>
                    <p className="text-3xl font-bold">ab CHF 149</p>
                    <p className="text-xs text-muted-foreground mt-1">pro Monat · inkl. ärztlicher Betreuung</p>
                  </div>
                  <Link to="/pricing">
                    <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                      Preise <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="anim-result-delay2 flex flex-col gap-3">
              <Link to="/">
                <Button size="lg" className="w-full h-13 rounded-full text-base font-semibold gap-2">
                  Zur Startseite <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <button
                onClick={() => { setStep(0); setAnswers({}); setShowResult(false); setAnimKey(0); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
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

  const showCta = current.type !== "radio";

  return (
    <>
      <style>{`
        @keyframes questionIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes questionOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-12px); }
        }
        .question-enter { animation: questionIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes checkPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-pop { animation: checkPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes barFill {
          from { width: 0%; }
        }
      `}</style>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
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

            {/* Step dots */}
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-5 h-1.5 bg-foreground"
                      : i < step
                      ? "w-1.5 h-1.5 bg-foreground/40"
                      : "w-1.5 h-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Abbrechen
            </Link>
          </div>

          {/* Progress bar */}
          <div className="h-px bg-border/40 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <main className="flex-1 flex items-start md:items-center">
          <div className="container mx-auto px-5 pt-10 pb-6 max-w-xl w-full">
            {/* Question */}
            <div key={animKey} className="question-enter">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-2">
                  {current.title}
                </h2>
                {current.subtitle && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{current.subtitle}</p>
                )}
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
                          selected
                            ? "bg-foreground text-background scale-[1.01]"
                            : "bg-card hover:bg-card/80 hover:scale-[1.005] active:scale-[0.998]"
                        }`}
                      >
                        <span className="flex-1 font-medium text-base">{opt.label}</span>
                        <span
                          className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selected
                              ? "border-background bg-background"
                              : "border-border/60 group-hover:border-foreground/30"
                          }`}
                        >
                          {selected && (
                            <span className="check-pop">
                              <Check className="h-3 w-3 text-foreground" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Number pair */}
              {current.type === "number-pair" && (
                <div className="grid grid-cols-2 gap-3">
                  {current.fields!.map((field) => (
                    <div key={field.id} className="bg-card rounded-2xl p-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                        {field.label}
                      </label>
                      <div className="flex items-end gap-1.5">
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder={field.placeholder}
                          value={(answers[current.id] as Record<string, string>)?.[field.id] || ""}
                          onChange={(e) => handleNumberField(field.id, e.target.value)}
                          className="h-12 text-2xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {field.suffix && (
                          <span className="text-sm font-medium text-muted-foreground pb-2 shrink-0">{field.suffix}</span>
                        )}
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
                          checked
                            ? "bg-foreground text-background scale-[1.01]"
                            : "bg-card hover:bg-card/80 hover:scale-[1.005] active:scale-[0.998]"
                        }`}
                      >
                        <span className="flex-1 font-medium text-base">{opt.label}</span>
                        <span
                          className={`shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            checked
                              ? "border-background bg-background"
                              : "border-border/60 group-hover:border-foreground/30"
                          }`}
                        >
                          {checked && (
                            <span className="check-pop">
                              <Check className="h-3 w-3 text-foreground" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sticky CTA — shown for non-radio questions */}
        {showCta && (
          <div className="sticky bottom-0 px-5 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="container mx-auto max-w-xl">
              <Button
                onClick={advance}
                disabled={!canProceed}
                size="lg"
                className="w-full h-13 rounded-full text-base font-semibold gap-2 transition-all duration-200 disabled:opacity-20"
              >
                {step === questions.length - 1 ? "Ergebnis anzeigen" : "Weiter"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Survey;

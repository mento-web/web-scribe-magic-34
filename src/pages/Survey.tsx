import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, Check } from "lucide-react";
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
  const genderLabel = gender === "men" ? "Männer" : "Frauen";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  const progress = ((step + 1) / questions.length) * 100;
  const current = questions[step];

  const canProceed = useMemo(() => {
    const ans = answers[current.id];
    if (current.type === "number-pair") {
      const obj = ans as Record<string, string> | undefined;
      return obj && current.fields!.every((f) => obj[f.id] && Number(obj[f.id]) > 0);
    }
    if (current.type === "checkbox") {
      return Array.isArray(ans) && ans.length > 0;
    }
    return !!ans;
  }, [answers, current, step]);

  const handleRadio = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
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

  const next = () => {
    if (step < questions.length - 1) setStep((s) => s + 1);
    else setShowResult(true);
  };

  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const getResult = () => {
    const bmiData = answers["bmi"] as Record<string, string> | undefined;
    const pregnancyAnswer = answers["women-specific"];

    if (pregnancyAnswer === "pregnant" || pregnancyAnswer === "planning") {
      return "not-eligible";
    }

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center">
          {result === "eligible" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="h-10 w-10 text-accent" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Sie könnten geeignet sein.</h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Basierend auf Ihren Angaben könnten Sie für eine ärztlich begleitete GLP-1 Therapie in Frage kommen. Ein Schweizer Arzt wird Ihre Angaben prüfen und sich bei Ihnen melden.
              </p>
              <div className="bg-card rounded-2xl p-6 mb-8">
                <p className="text-sm text-muted-foreground">Behandlungskosten</p>
                <p className="text-2xl font-bold">ab CHF 299/Monat</p>
                <p className="text-xs text-muted-foreground mt-1">inkl. ärztlicher Betreuung</p>
              </div>
            </>
          ) : result === "borderline" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="h-10 w-10 text-warning" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Ärztliche Beratung empfohlen.</h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Basierend auf Ihren Angaben empfehlen wir ein persönliches Gespräch mit einem unserer Ärzte, um die beste Behandlung für Sie zu bestimmen.
              </p>
            </>
          ) : result === "low-bmi" ? (
            <>
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-8">
                <Shield className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Aktuell nicht empfohlen.</h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Ihr BMI liegt im Normalbereich. Eine GLP-1 Therapie wird in der Regel erst ab einem BMI von 27+ empfohlen. Sprechen Sie mit Ihrem Hausarzt über Ihre Möglichkeiten.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={1.5} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Nicht geeignet.</h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                GLP-1 Medikamente sind während der Schwangerschaft oder bei Schwangerschaftsplanung nicht geeignet. Bitte konsultieren Sie Ihren Arzt für alternative Möglichkeiten.
              </p>
            </>
          )}
          <Link to="/">
            <Button size="lg" className="gap-2 rounded-full px-8 h-12">
              Zurück zur Startseite
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-10 max-w-md mx-auto">
            Diese Einschätzung ersetzt keine ärztliche Diagnose. Alle Behandlungen erfolgen gemäss Schweizer Heilmittelgesetz (HMG) und unter ärztlicher Aufsicht.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-6 max-w-2xl">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </button>
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{genderLabel} · {step + 1} / {questions.length}</span>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Abbrechen
          </Link>
        </div>
        {/* Slim progress bar */}
        <div className="h-0.5 bg-border/60">
          <div
            className="h-full bg-foreground transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-start md:items-center">
        <div className="container mx-auto px-6 py-10 md:py-16 max-w-2xl w-full">
          <div className="mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-3">{current.title}</h2>
            {current.subtitle && (
              <p className="text-base text-muted-foreground leading-relaxed">{current.subtitle}</p>
            )}
          </div>

          {/* Radio */}
          {current.type === "radio" && (
            <div className="space-y-3">
              {current.options!.map((opt) => {
                const selected = answers[current.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleRadio(opt.value)}
                    className={`w-full flex items-center justify-between gap-4 px-5 py-5 rounded-2xl border-2 text-left transition-all ${
                      selected
                        ? "border-foreground bg-card"
                        : "border-border hover:border-foreground/40 bg-background"
                    }`}
                  >
                    <span className="font-medium text-base">{opt.label}</span>
                    <span
                      className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? "border-foreground bg-foreground" : "border-border"
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Number pair */}
          {current.type === "number-pair" && (
            <div className="grid grid-cols-2 gap-4">
              {current.fields!.map((field) => (
                <div key={field.id}>
                  <label className="text-sm font-medium mb-2 block text-muted-foreground">{field.label}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={field.placeholder}
                      value={(answers[current.id] as Record<string, string>)?.[field.id] || ""}
                      onChange={(e) => handleNumberField(field.id, e.target.value)}
                      className="h-14 text-lg font-medium pr-12 rounded-2xl border-2 focus-visible:ring-0 focus-visible:border-foreground"
                    />
                    {field.suffix && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">{field.suffix}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {current.type === "checkbox" && (
            <div className="space-y-3">
              {current.options!.map((opt) => {
                const checked = ((answers[current.id] as string[]) || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleCheckbox(opt.value, !checked)}
                    className={`w-full flex items-center justify-between gap-4 px-5 py-5 rounded-2xl border-2 text-left transition-all ${
                      checked
                        ? "border-foreground bg-card"
                        : "border-border hover:border-foreground/40 bg-background"
                    }`}
                  >
                    <span className="font-medium text-base">{opt.label}</span>
                    <span
                      className={`flex-shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        checked ? "border-foreground bg-foreground" : "border-border"
                      }`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-background/0 pt-6 pb-6">
        <div className="container mx-auto px-6 max-w-2xl">
          <Button
            onClick={next}
            disabled={!canProceed}
            size="lg"
            className="w-full h-14 rounded-full text-base font-semibold gap-2 disabled:opacity-30"
          >
            {step === questions.length - 1 ? "Ergebnis anzeigen" : "Weiter"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Survey;

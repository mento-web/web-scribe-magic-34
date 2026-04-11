import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  // Determine result
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {result === "eligible" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Sie könnten geeignet sein!</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Basierend auf Ihren Angaben könnten Sie für eine ärztlich begleitete GLP-1 Therapie in Frage kommen. Ein Schweizer Arzt wird Ihre Angaben prüfen und sich bei Ihnen melden.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Behandlungskosten ab CHF 299/Monat inkl. ärztlicher Betreuung.
              </p>
            </>
          ) : result === "borderline" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Ärztliche Beratung empfohlen</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Basierend auf Ihren Angaben empfehlen wir ein persönliches Gespräch mit einem unserer Ärzte, um die beste Behandlung für Sie zu bestimmen.
              </p>
            </>
          ) : result === "low-bmi" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Aktuell nicht empfohlen</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Ihr BMI liegt im Normalbereich. Eine GLP-1 Therapie wird in der Regel erst ab einem BMI von 27+ empfohlen. Sprechen Sie mit Ihrem Hausarzt über Ihre Möglichkeiten.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold mb-3">Nicht geeignet</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                GLP-1 Medikamente sind während der Schwangerschaft oder bei Schwangerschaftsplanung nicht geeignet. Bitte konsultieren Sie Ihren Arzt für alternative Möglichkeiten.
              </p>
            </>
          )}
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-8">
            Hinweis: Diese Einschätzung ersetzt keine ärztliche Diagnose. Alle Behandlungen erfolgen gemäss Schweizer Heilmittelgesetz (HMG) und unter ärztlicher Aufsicht.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Abbrechen
          </Link>
          <span className="text-sm font-medium">Fragebogen — {genderLabel}</span>
          <span className="text-sm text-muted-foreground">{step + 1}/{questions.length}</span>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <main className="container mx-auto px-4 py-12 max-w-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">{current.title}</h2>
          {current.subtitle && (
            <p className="text-sm text-muted-foreground">{current.subtitle}</p>
          )}
        </div>

        {/* Radio */}
        {current.type === "radio" && (
          <RadioGroup value={answers[current.id] as string || ""} onValueChange={handleRadio} className="space-y-3">
            {current.options!.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  answers[current.id] === opt.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40"
                }`}
              >
                <RadioGroupItem value={opt.value} id={opt.value} />
                <Label htmlFor={opt.value} className="cursor-pointer font-medium text-sm flex-1">{opt.label}</Label>
              </label>
            ))}
          </RadioGroup>
        )}

        {/* Number pair */}
        {current.type === "number-pair" && (
          <div className="grid grid-cols-2 gap-4">
            {current.fields!.map((field) => (
              <div key={field.id}>
                <Label className="text-sm mb-2 block">{field.label}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    value={(answers[current.id] as Record<string, string>)?.[field.id] || ""}
                    onChange={(e) => handleNumberField(field.id, e.target.value)}
                    className="pr-10"
                  />
                  {field.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{field.suffix}</span>
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
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                    checked ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40"
                  }`}
                >
                  <Checkbox checked={checked} onCheckedChange={(c) => handleCheckbox(opt.value, !!c)} />
                  <span className="font-medium text-sm">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button variant="ghost" onClick={prev} disabled={step === 0} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>
          <Button onClick={next} disabled={!canProceed} className="gap-2">
            {step === questions.length - 1 ? "Ergebnis anzeigen" : "Weiter"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Survey;

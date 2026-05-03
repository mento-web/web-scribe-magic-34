import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: "radio" | "number-pair" | "number" | "checkbox";
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
    subtitle: "Bitte geben Sie Ihr genaues Alter ein.",
    type: "number",
    fields: [{ id: "age", label: "Alter", placeholder: "35", suffix: "Jahre" }],
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

// ─── BMI Interstitial ────────────────────────────────────────────────────────

const BMI_STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes checkPop { 0%{transform:scale(0.5);opacity:0;} 70%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }
  @keyframes questionIn { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  .anim-0  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .anim-1  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) .08s both; }
  .anim-2  { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) .16s both; }
  .question-enter { animation: questionIn .35s cubic-bezier(.16,1,.3,1) both; }
  .check-pop { animation: checkPop .25s cubic-bezier(.34,1.56,.64,1) both; }
`;

function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  const d: string[] = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
  }
  return d.join(' ');
}

const WeightChart = ({ w, peakLoss, visible }: { w: number; peakLoss: number; visible: boolean }) => {
  const T3M = 0.35, T6M = 0.60, T12M = 0.90;
  const totalMonths = 12;

  const getFraction = (m: number) => {
    if (m <= 0) return 0;
    if (m <= 3) return (m / 3) * T3M;
    if (m <= 6) return T3M + ((m - 3) / 3) * (T6M - T3M);
    return T6M + ((m - 6) / 6) * (T12M - T6M);
  };

  // SVG geometry
  const VW = 400, VH = 156;
  const padT = 20, padB = 16, padL = 4, padR = 48;
  const cW = VW - padL - padR;
  const cH = VH - padT - padB;

  // Scrubber state — starts at 12 months
  const [scrubMonth, setScrubMonth] = useState(totalMonths);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const monthFromClientX = (clientX: number) => {
    if (!svgRef.current) return scrubMonth;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * VW;
    return Math.max(0, Math.min(totalMonths, ((svgX - padL) / cW) * totalMonths));
  };

  // Global mouse-up so drag works even outside SVG
  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // Derived values at current scrub position
  const scrubFrac   = getFraction(scrubMonth);
  const scrubX      = padL + (scrubMonth / totalMonths) * cW;
  const scrubY      = padT + (scrubFrac / T12M) * cH;
  const scrubWeight = Math.max(0, Math.round((w - scrubFrac * peakLoss) * 10) / 10);
  const lossNow     = Math.round((w - scrubWeight) * 10) / 10;
  const roundedM    = Math.round(scrubMonth);

  const scrubDate = new Date();
  scrubDate.setMonth(scrubDate.getMonth() + roundedM);
  const datePill = scrubDate.toLocaleDateString('de-CH', { month: 'short', year: 'numeric' });

  // Curve path
  const pts = Array.from({ length: totalMonths + 1 }, (_, m) => ({
    x: padL + (m / totalMonths) * cW,
    y: padT + (getFraction(m) / T12M) * cH,
  }));
  const linePath = catmullRomPath(pts);
  const fillPath = `${linePath} L ${pts[totalMonths].x} ${VH - padB} L ${padL} ${VH - padB} Z`;

  // Date pill left offset as % of chart rendered width (accounts for padR)
  const pillLeftPct = ((scrubX - padL) / cW) * ((cW / VW) * 100);

  return (
    <div className="mb-8 select-none">
      {/* Header */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ihr Gewicht</p>
          <p className="text-4xl font-bold tracking-tight">
            {w} <span className="text-lg font-medium text-muted-foreground">kg</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500 tracking-tight tabular-nums">
            {lossNow > 0 ? `↓${lossNow} kg` : '–'}
          </p>
          <p className="text-xs text-muted-foreground">
            {roundedM === 0 ? 'jetzt' : `nach ${roundedM} Monat${roundedM === 1 ? '' : 'en'}`}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-card rounded-2xl overflow-hidden">
        {/* Date pill — HTML overlay so it respects theme */}
        {visible && (
          <div
            className="absolute z-10 top-2 pointer-events-none"
            style={{ left: `${Math.min(Math.max(pillLeftPct, 4), 72)}%`, transform: 'translateX(-50%)' }}
          >
            <div className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm whitespace-nowrap">
              {datePill}
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          className="block"
          style={{ cursor: dragging.current ? 'grabbing' : 'ew-resize', touchAction: 'none' }}
          onMouseDown={(e) => {
            dragging.current = true;
            setScrubMonth(monthFromClientX(e.clientX));
          }}
          onMouseMove={(e) => {
            if (!dragging.current) return;
            setScrubMonth(monthFromClientX(e.clientX));
          }}
          onMouseUp={() => { dragging.current = false; }}
          onTouchStart={(e) => {
            dragging.current = true;
            setScrubMonth(monthFromClientX(e.touches[0].clientX));
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            setScrubMonth(monthFromClientX(e.touches[0].clientX));
          }}
          onTouchEnd={() => { dragging.current = false; }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="wc-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Fill */}
          <path d={fillPath} fill="url(#wc-grad)"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.9s' }}
          />

          {/* Curve */}
          <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"
            pathLength="1"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: visible ? 0 : 1,
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          {/* Scrubber line */}
          <line
            x1={scrubX} y1={padT - 8} x2={scrubX} y2={VH - padB + 2}
            stroke="#888" strokeWidth="1" strokeDasharray="3 3"
            style={{ opacity: visible ? 0.45 : 0, transition: visible ? 'opacity 0.4s ease 1.1s' : 'none' }}
          />

          {/* Glow */}
          <circle cx={scrubX} cy={scrubY} r="11" fill="#22c55e"
            style={{ opacity: visible ? 0.15 : 0, transition: visible ? 'opacity 0.3s ease 1.35s' : 'none' }}
          />
          {/* Dot */}
          <circle cx={scrubX} cy={scrubY} r="6" fill="#22c55e"
            style={{ opacity: visible ? 1 : 0, transition: visible ? 'opacity 0.3s ease 1.35s' : 'none' }}
          />
          <circle cx={scrubX} cy={scrubY} r="2.8" fill="white"
            style={{ opacity: visible ? 1 : 0, transition: visible ? 'opacity 0.3s ease 1.35s' : 'none' }}
          />

          {/* Right-axis weight label */}
          <text x={VW - padR + 7} y={scrubY + 4} fontSize="11" fontWeight="600" fill="#888"
            style={{ opacity: visible ? 1 : 0, transition: 'none' }}
          >{scrubWeight}</text>
          <text x={VW - padR + 7} y={scrubY + 15} fontSize="9" fill="#aaa"
            style={{ opacity: visible ? 1 : 0, transition: 'none' }}
          >kg</text>
        </svg>
      </div>
    </div>
  );
};

function getBmiInfo(bmi: number) {
  if (bmi < 18.5) return { label: "Untergewicht",    badge: "bg-blue-500/10 text-blue-600" };
  if (bmi < 25)   return { label: "Normalgewicht",   badge: "bg-emerald-500/10 text-emerald-600" };
  if (bmi < 30)   return { label: "Übergewicht",     badge: "bg-amber-500/10 text-amber-600" };
  if (bmi < 35)   return { label: "Adipositas I",    badge: "bg-orange-500/10 text-orange-600" };
  return           { label: "Adipositas II+",        badge: "bg-red-500/10 text-red-600" };
}

const BmiInterstitial = ({
  answers,
  gender,
  onContinue,
  onBack,
}: {
  answers: Answers;
  gender: string;
  onContinue: () => void;
  onBack: () => void;
}) => {
  const bmiData = answers["bmi"] as Record<string, string> | undefined;
  const w = Number(bmiData?.weight) || 0;
  const h = (Number(bmiData?.height) || 0) / 100;
  const bmi = h > 0 && w > 0 ? w / (h * h) : 0;
  const bmiTarget = Math.round(bmi * 10) / 10;

  const showProjections = bmi > 25;

  // ── Algorithm based on clinical trial data ────────────────────────────────
  // Baseline: STEP 1 trial — Semaglutide 2.4 mg, non-diabetic, 68 weeks → −14.9%
  const BASE_PEAK = 0.149;

  // Sex multiplier: Johns Hopkins meta-analysis (64 trials, 2026)
  // Women −10.9 %, Men −6.8 %, average −8.85 %
  const META_AVG = (10.9 + 6.8) / 2;
  const sexMultiplier = gender === "women" ? 10.9 / META_AVG : 6.8 / META_AVG;

  const peakLossRate = BASE_PEAK * sexMultiplier;

  // Timeline fractions of 68-week peak (titration starts at ~16–20 wk)
  const T3M  = 0.35;  // 3 months  ≈ 35 % of peak
  const T6M  = 0.60;  // 6 months  ≈ 60 % of peak
  const T12M = 0.90;  // 12 months ≈ 90 % of peak

  // BMI 23 floor: never project below BMI 23
  const minWeight = 23 * h * h;
  const maxLoss   = Math.max(0, w - minWeight);
  const peakLoss  = Math.min(w * peakLossRate, maxLoss);

  const loss3m  = Math.round(T3M  * peakLoss * 10) / 10;
  const loss6m  = Math.round(T6M  * peakLoss * 10) / 10;
  const loss12m = Math.round(T12M * peakLoss * 10) / 10;
  const targetWeight = w > 0 ? Math.round((w - loss12m) * 10) / 10 : 0;

  const [displayBmi, setDisplayBmi] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let rafId: number;
    const duration = 1100;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBmi(+(eased * bmiTarget).toFixed(1));
      if (progress < 1) { rafId = requestAnimationFrame(tick); }
      else { setTimeout(() => setShowDetails(true), 250); }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [bmiTarget]);

  const { label, badge } = getBmiInfo(bmi);
  const gaugePos = Math.min(Math.max((bmi - 15) / 25, 0), 1) * 100;

  return (
    <>
      <style>{BMI_STYLES}</style>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="container mx-auto flex items-center justify-between h-14 px-5 max-w-xl">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Zurück</span>
            </button>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ihre Analyse</span>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Abbrechen
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <div className="container mx-auto px-5 py-10 max-w-xl">

            {/* BMI counter */}
            <div className="anim-0 mb-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ihr BMI</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-8xl font-bold tracking-tight leading-none tabular-nums">
                  {displayBmi.toFixed(1)}
                </span>
                <span className="text-xl font-medium text-muted-foreground mb-3">kg/m²</span>
              </div>
              <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${badge}`}>
                {label}
              </span>
            </div>

            {/* Gauge */}
            <div className="anim-1 mb-10">
              <div className="relative h-3 rounded-full mb-3" style={{ background: 'linear-gradient(to right,#3b82f6 0%,#22c55e 20%,#f59e0b 50%,#f97316 72%,#ef4444 100%)' }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg ring-2 ring-black/10 transition-all duration-1000 ease-out"
                  style={{
                    left: `calc(${showDetails ? gaugePos : 0}% - 10px)`,
                    opacity: showDetails ? 1 : 0,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Untergewicht</span>
                <span>Normal</span>
                <span>Übergewicht</span>
                <span>Adipositas</span>
              </div>
            </div>

            {/* Healthy BMI message */}
            {!showProjections && showDetails && (
              <div className="transition-all duration-500 ease-out" style={{ opacity: showDetails ? 1 : 0, transform: showDetails ? 'translateY(0)' : 'translateY(12px)' }}>
                <div className="bg-card rounded-2xl p-6">
                  <p className="text-base font-semibold mb-2">Ihr Gewicht ist bereits im gesunden Bereich.</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Leider sind Sie für unsere GLP-1 Behandlung nicht geeignet — diese ist für Personen mit einem BMI über 25 vorgesehen. Wir empfehlen Ihnen, Ihren Hausarzt für eine persönliche Beratung aufzusuchen.
                  </p>
                </div>
              </div>
            )}

            {/* Weight chart + projections — only for BMI > 25 */}
            {showProjections && (
              <>
                <WeightChart w={w} peakLoss={peakLoss} visible={showDetails} />

              <div
                className="transition-all duration-500 ease-out"
                style={{ opacity: showDetails ? 1 : 0, transform: showDetails ? 'translateY(0)' : 'translateY(12px)' }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
                  Mit GLP-1 könnten Sie verlieren
                </p>

                <div className="space-y-5 mb-8">
                  {([
                    { label: "In 3 Monaten",  loss: loss3m,  delay: 0 },
                    { label: "In 6 Monaten",  loss: loss6m,  delay: 120 },
                    { label: "In 12 Monaten", loss: loss12m, delay: 240 },
                  ] as const).map(({ label, loss, delay }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm font-bold tabular-nums">−{loss} kg</span>
                      </div>
                      <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: showDetails ? `${(loss / loss12m) * 100}%` : "0%",
                            transitionDelay: showDetails ? `${delay}ms` : "0ms",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {w > 0 && (
                  <div className="bg-card rounded-2xl p-5 mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Zielgewicht nach 12 Monaten</p>
                    <p className="text-4xl font-bold">{targetWeight} <span className="text-xl font-medium text-muted-foreground">kg</span></p>
                    <p className="text-xs text-muted-foreground mt-1">ausgehend von {w} kg Körpergewicht</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground leading-relaxed">
                  * Projektionen basierend auf STEP 1 (Semaglutid 2.4 mg, 68 Wochen) und der Johns Hopkins Metaanalyse 2026 (64 Studien). Geschlechtsspezifische Anpassung: Frauen −10.9 %, Männer −6.8 %. Individuelle Ergebnisse können abweichen.
                </p>
              </div>
              </>
            )}
          </div>
        </main>

        {showProjections && (
          <div className="sticky bottom-0 px-5 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="container mx-auto max-w-xl">
              <Button
                onClick={onContinue}
                size="lg"
                className="w-full h-13 rounded-full text-base font-semibold gap-2"
              >
                Weiter zum Fragebogen <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Survey ──────────────────────────────────────────────────────────────────

const Survey = () => {
  const { gender } = useParams<{ gender: string }>();
  const questions = gender === "men" ? menQuestions : womenQuestions;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [showBmiCard, setShowBmiCard] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const progress = (step / questions.length) * 100;
  const current = questions[step];

  const canProceed = useMemo(() => {
    const ans = answers[current.id];
    if (current.type === "number-pair" || current.type === "number") {
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
    if (current.id === "age") { setShowBmiCard(true); return; }
    doAdvance();
  };

  const handleRadio = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
    setTimeout(() => {
      if (current.id === "age") { setShowBmiCard(true); return; }
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

  const resetSurvey = () => {
    setStep(0); setAnswers({}); setShowResult(false); setShowBmiCard(false); setAnimKey(0);
  };

  // ── BMI interstitial ──
  if (showBmiCard) {
    return (
      <BmiInterstitial
        answers={answers}
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
        title: "Sie könnten geeignet sein.",
        body: "Basierend auf Ihren Angaben könnten Sie für eine ärztlich begleitete GLP-1 Therapie in Frage kommen. Ein Schweizer Arzt prüft Ihre Angaben und meldet sich bei Ihnen.",
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
      "not-eligible": {
        icon: <X className="h-8 w-8" strokeWidth={1.5} />,
        iconBg: "bg-destructive/10", iconColor: "text-destructive",
        badge: "Nicht geeignet", badgeBg: "bg-destructive/10 text-destructive",
        title: "Nicht geeignet.",
        body: "GLP-1 Medikamente sind während der Schwangerschaft oder bei Schwangerschaftsplanung nicht geeignet. Bitte konsultieren Sie Ihren Arzt für alternative Möglichkeiten.",
      },
    }[result];

    return (
      <>
        <style>{BMI_STYLES}</style>
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
            <h1 className="anim-1 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-5">{cfg.title}</h1>
            <p className="anim-1 text-base text-muted-foreground leading-relaxed mb-10">{cfg.body}</p>

            {result === "eligible" && (
              <div className="anim-1 bg-card rounded-2xl p-6 mb-8 text-left">
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

            <div className="anim-2 flex flex-col gap-3">
              <Link to="/">
                <Button size="lg" className="w-full rounded-full text-base font-semibold gap-2">
                  Zur Startseite <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
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
      <style>{BMI_STYLES}</style>
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
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-2">{current.title}</h2>
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
                          selected ? "bg-foreground text-background scale-[1.01]" : "bg-card hover:scale-[1.005] active:scale-[0.998]"
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
                    <div key={field.id} className="bg-card rounded-2xl p-4">
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

              {/* Single number (age) */}
              {current.type === "number" && (
                <div className="bg-card rounded-2xl p-6">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-4">
                    {current.fields![0].label}
                  </label>
                  <div className="flex items-end gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={current.fields![0].placeholder}
                      value={(answers[current.id] as Record<string, string>)?.[current.fields![0].id] || ""}
                      onChange={(e) => handleNumberField(current.fields![0].id, e.target.value)}
                      className="h-16 text-5xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {current.fields![0].suffix && (
                      <span className="text-xl font-medium text-muted-foreground pb-4 shrink-0">{current.fields![0].suffix}</span>
                    )}
                  </div>
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
                          checked ? "bg-foreground text-background scale-[1.01]" : "bg-card hover:scale-[1.005] active:scale-[0.998]"
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
              <Button
                onClick={advance}
                disabled={!canProceed}
                size="lg"
                className="w-full h-16 rounded-2xl text-base font-semibold gap-2 disabled:opacity-20"
              >
                {current.id === "age" ? "Analyse anzeigen" : step === questions.length - 1 ? "Ergebnis anzeigen" : "Weiter"}
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

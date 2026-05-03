import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BMI_STYLES = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .anim-0 { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) both; }
  .anim-1 { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) .08s both; }
  .anim-2 { animation: fadeUp .45s cubic-bezier(.16,1,.3,1) .16s both; }
`;

function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
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
  return d.join(" ");
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

  const VW = 400, VH = 156;
  const padT = 20, padB = 16, padL = 4, padR = 48;
  const cW = VW - padL - padR;
  const cH = VH - padT - padB;

  const [scrubMonth, setScrubMonth] = useState(totalMonths);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const monthFromClientX = (clientX: number) => {
    if (!svgRef.current) return scrubMonth;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * VW;
    return Math.max(0, Math.min(totalMonths, ((svgX - padL) / cW) * totalMonths));
  };

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  const scrubFrac   = getFraction(scrubMonth);
  const scrubX      = padL + (scrubMonth / totalMonths) * cW;
  const scrubY      = padT + (scrubFrac / T12M) * cH;
  const scrubWeight = Math.max(0, Math.round((w - scrubFrac * peakLoss) * 10) / 10);
  const lossNow     = Math.round((w - scrubWeight) * 10) / 10;
  const roundedM    = Math.round(scrubMonth);

  const scrubDate = new Date();
  scrubDate.setMonth(scrubDate.getMonth() + roundedM);
  const datePill = scrubDate.toLocaleDateString("de-CH", { month: "short", year: "numeric" });

  const pts = Array.from({ length: totalMonths + 1 }, (_, m) => ({
    x: padL + (m / totalMonths) * cW,
    y: padT + (getFraction(m) / T12M) * cH,
  }));
  const linePath = catmullRomPath(pts);
  const fillPath = `${linePath} L ${pts[totalMonths].x} ${VH - padB} L ${padL} ${VH - padB} Z`;
  const pillLeftPct = ((scrubX - padL) / cW) * ((cW / VW) * 100);

  return (
    <div className="mb-8 select-none">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ihr Gewicht</p>
          <p className="text-4xl font-bold tracking-tight">
            {w} <span className="text-lg font-medium text-muted-foreground">kg</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500 tracking-tight tabular-nums">
            {lossNow > 0 ? `↓${lossNow} kg` : "–"}
          </p>
          <p className="text-xs text-muted-foreground">
            {roundedM === 0 ? "jetzt" : `nach ${roundedM} Monat${roundedM === 1 ? "" : "en"}`}
          </p>
        </div>
      </div>

      <div className="relative bg-card rounded-2xl overflow-hidden">
        {visible && (
          <div
            className="absolute z-10 top-2 pointer-events-none"
            style={{ left: `${Math.min(Math.max(pillLeftPct, 4), 72)}%`, transform: "translateX(-50%)" }}
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
          style={{ cursor: dragging.current ? "grabbing" : "ew-resize", touchAction: "none" }}
          onMouseDown={(e) => { dragging.current = true; setScrubMonth(monthFromClientX(e.clientX)); }}
          onMouseMove={(e) => { if (!dragging.current) return; setScrubMonth(monthFromClientX(e.clientX)); }}
          onMouseUp={() => { dragging.current = false; }}
          onTouchStart={(e) => { dragging.current = true; setScrubMonth(monthFromClientX(e.touches[0].clientX)); }}
          onTouchMove={(e) => { e.preventDefault(); setScrubMonth(monthFromClientX(e.touches[0].clientX)); }}
          onTouchEnd={() => { dragging.current = false; }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="wc-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#wc-grad)" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.7s ease 0.9s" }} />
          <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"
            pathLength="1"
            style={{ strokeDasharray: 1, strokeDashoffset: visible ? 0 : 1, transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }}
          />
          <line x1={scrubX} y1={padT - 8} x2={scrubX} y2={VH - padB + 2}
            stroke="#888" strokeWidth="1" strokeDasharray="3 3"
            style={{ opacity: visible ? 0.45 : 0, transition: visible ? "opacity 0.4s ease 1.1s" : "none" }}
          />
          <circle cx={scrubX} cy={scrubY} r="11" fill="#22c55e" style={{ opacity: visible ? 0.15 : 0, transition: visible ? "opacity 0.3s ease 1.35s" : "none" }} />
          <circle cx={scrubX} cy={scrubY} r="6"  fill="#22c55e" style={{ opacity: visible ? 1    : 0, transition: visible ? "opacity 0.3s ease 1.35s" : "none" }} />
          <circle cx={scrubX} cy={scrubY} r="2.8" fill="white"  style={{ opacity: visible ? 1    : 0, transition: visible ? "opacity 0.3s ease 1.35s" : "none" }} />
          <text x={VW - padR + 7} y={scrubY + 4}  fontSize="11" fontWeight="600" fill="#888" style={{ opacity: visible ? 1 : 0, transition: "none" }}>{scrubWeight}</text>
          <text x={VW - padR + 7} y={scrubY + 15} fontSize="9"  fill="#aaa"      style={{ opacity: visible ? 1 : 0, transition: "none" }}>kg</text>
        </svg>
      </div>
    </div>
  );
};

function getBmiInfo(bmi: number) {
  if (bmi < 18.5) return { label: "Untergewicht",  badge: "bg-blue-500/10 text-blue-600" };
  if (bmi < 25)   return { label: "Normalgewicht", badge: "bg-emerald-500/10 text-emerald-600" };
  if (bmi < 30)   return { label: "Übergewicht",   badge: "bg-amber-500/10 text-amber-600" };
  if (bmi < 35)   return { label: "Adipositas I",  badge: "bg-orange-500/10 text-orange-600" };
  return           { label: "Adipositas II+",       badge: "bg-red-500/10 text-red-600" };
}

interface BmiAnalysisProps {
  height: number;
  weight: number;
  gender: string;
  onContinue: () => void;
  onBack: () => void;
}

const BmiAnalysis = ({ height, weight, gender, onContinue, onBack }: BmiAnalysisProps) => {
  const h = height / 100;
  const w = weight;
  const bmi = h > 0 && w > 0 ? w / (h * h) : 0;
  const bmiTarget = Math.round(bmi * 10) / 10;
  const showProjections = bmi > 25;

  const BASE_PEAK = 0.149;
  const META_AVG = (10.9 + 6.8) / 2;
  const sexMultiplier = gender === "women" ? 10.9 / META_AVG : 6.8 / META_AVG;
  const peakLossRate = BASE_PEAK * sexMultiplier;

  const T3M = 0.35, T6M = 0.60, T12M = 0.90;

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

            <div className="anim-1 mb-10">
              <div className="relative h-3 rounded-full mb-3" style={{ background: "linear-gradient(to right,#3b82f6 0%,#22c55e 20%,#f59e0b 50%,#f97316 72%,#ef4444 100%)" }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg ring-2 ring-black/10 transition-all duration-1000 ease-out"
                  style={{ left: `calc(${showDetails ? gaugePos : 0}% - 10px)`, opacity: showDetails ? 1 : 0 }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Untergewicht</span>
                <span>Normal</span>
                <span>Übergewicht</span>
                <span>Adipositas</span>
              </div>
            </div>

            {!showProjections && showDetails && (
              <div className="bg-card rounded-2xl p-6">
                <p className="text-base font-semibold mb-2">Ihr Gewicht ist bereits im gesunden Bereich.</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Leider sind Sie für unsere GLP-1 Behandlung nicht geeignet — diese ist für Personen mit einem BMI über 25 vorgesehen. Wir empfehlen Ihnen, Ihren Hausarzt für eine persönliche Beratung aufzusuchen.
                </p>
              </div>
            )}

            {showProjections && (
              <>
                <WeightChart w={w} peakLoss={peakLoss} visible={showDetails} />
                <div
                  className="transition-all duration-500 ease-out"
                  style={{ opacity: showDetails ? 1 : 0, transform: showDetails ? "translateY(0)" : "translateY(12px)" }}
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
                            style={{ width: showDetails ? `${(loss / loss12m) * 100}%` : "0%", transitionDelay: showDetails ? `${delay}ms` : "0ms" }}
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
              <Button onClick={onContinue} size="lg" className="w-full h-13 rounded-full text-base font-semibold gap-2">
                Zu Ihren Optionen <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BmiAnalysis;

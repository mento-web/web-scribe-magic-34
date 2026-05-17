import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Proteinrechner — daily protein requirement calculator (placeholder).

   Linked from the header "Ressourcen" dropdown alongside BMI Rechner. Today
   this is a simple weight × activity-level lookup; later it can grow into a
   richer tool (split by goal, factor in age, distinguish meal-timing, etc.).

   Formula reference (placeholder values):
     Sedentär:           0.8 g per kg per day
     Aktiv:              1.4 g per kg per day
     Sehr aktiv:         1.8 g per kg per day
     Abnehmen + Sport:   2.0 g per kg per day

   The visual language matches BmiWidget on the landing page: pill activity
   toggle, big editorial number readout, off-white input cards.
   ========================================================================= */

type ActivityLevel = "sedentary" | "active" | "athletic" | "weight-loss";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; rate: number; description: string }[] = [
  {
    value: "sedentary",
    label: "Sedentär",
    rate: 0.8,
    description: "Hauptsächlich sitzend, wenig Bewegung",
  },
  {
    value: "active",
    label: "Aktiv",
    rate: 1.4,
    description: "Regelmässige Bewegung, 2–4× Sport pro Woche",
  },
  {
    value: "athletic",
    label: "Sehr aktiv",
    rate: 1.8,
    description: "Intensives Training, 5×+ pro Woche",
  },
  {
    value: "weight-loss",
    label: "Abnehmen + Sport",
    rate: 2.0,
    description: "Kalorienreduktion mit Krafttraining",
  },
];

const Proteinrechner = () => {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("active");

  const rate = ACTIVITY_OPTIONS.find((o) => o.value === activity)!.rate;
  const weightNum = Number(weight);
  const grams = weightNum > 0 ? Math.round(weightNum * rate) : null;

  // Helpful per-meal breakdown if 4 meals/day — purely informational.
  const perMeal = grams !== null ? Math.round(grams / 4) : null;

  return (
    <PageShell>
      {/* === Page header — small label + huge editorial headline === */}
      <section className="px-4 pt-16 pb-12 md:pt-24">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Ressourcen · Tools
          </p>
          <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6">
            Protein Rechner.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Während einer GLP-1 Therapie ist ausreichend Eiweiss entscheidend,
            um Muskelmasse zu erhalten. Berechnen Sie hier Ihren täglichen
            Eiweissbedarf.
          </p>
        </div>
      </section>

      {/* === Calculator block === */}
      <section className="px-4 mt-12">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-[14px] bg-muted p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
              {/* Inputs column */}
              <div className="space-y-6">
                {/* Weight input — same style as the landing-page BmiWidget */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground block mb-3">
                    Ihr Gewicht
                  </label>
                  <div className="bg-background rounded-2xl p-5">
                    <div className="flex items-end gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="80"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full h-12 text-3xl font-bold bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-base font-medium text-muted-foreground pb-2 shrink-0">
                        kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity radio group */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground block mb-3">
                    Aktivitätslevel
                  </label>
                  <div className="space-y-2">
                    {ACTIVITY_OPTIONS.map((opt) => {
                      const selected = activity === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setActivity(opt.value)}
                          className={`w-full text-left p-4 rounded-2xl transition-all duration-150 ${
                            selected
                              ? "bg-foreground text-background"
                              : "bg-background hover:bg-background/70"
                          }`}
                        >
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p
                            className={`text-xs mt-0.5 ${
                              selected ? "text-background/60" : "text-muted-foreground"
                            }`}
                          >
                            {opt.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Result column — big editorial readout */}
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Ihr täglicher Bedarf
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-editorial text-8xl md:text-9xl leading-[0.85] tabular-nums">
                    {grams ?? "—"}
                  </span>
                  <span className="text-xl font-medium text-muted-foreground mb-3">
                    g
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Eiweiss pro Tag ({rate.toFixed(1)} g / kg Körpergewicht)
                </p>

                {/* Per-meal hint */}
                {perMeal !== null && (
                  <div className="bg-background rounded-2xl p-5 max-w-xs">
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-1">
                      Pro Mahlzeit (bei 4 Mahlzeiten)
                    </p>
                    <p className="font-editorial text-3xl leading-none">
                      ~ {perMeal} g
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Methodology / disclaimer line under the calculator */}
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed max-w-2xl">
            Richtwerte basierend auf Empfehlungen der Schweizerischen
            Gesellschaft für Ernährung (SGE) und aktueller Sportforschung.
            Individuelle Bedürfnisse können abweichen — sprechen Sie für eine
            persönliche Empfehlung mit Ihrem Arzt oder Ernährungsberater.
          </p>
        </div>
      </section>

      {/* === CTA back into the survey funnel === */}
      <section className="mt-20 md:mt-28 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-[14px] bg-muted py-16 px-8 text-center">
            <h2 className="font-editorial text-4xl md:text-5xl leading-[1] mb-4">
              Bereit, mit GLP-1 zu starten?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              In 3 Minuten wissen Sie, ob eine ärztlich begleitete Therapie für
              Sie geeignet ist.
            </p>
            <Link
              to="/survey/women"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Fragebogen starten <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Proteinrechner;

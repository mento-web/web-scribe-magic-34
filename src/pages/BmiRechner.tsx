import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BmiWidget } from "@/components/BmiWidget";

/* ============================================================================
   BmiRechner — dedicated /bmi-rechner page.

   Same calculator that lives in §7 of the landing page, but standalone so it
   can be linked from the Ressourcen dropdown, the footer Tools column, and
   shared as its own URL. Uses the shared BmiWidget component so logic and
   visual treatment stay consistent across both surfaces.

   Page structure (top to bottom):
     1. Editorial header  — small label + huge serif "BMI Rechner."
     2. Calculator block  — off-white card with the BmiWidget on it
     3. BMI category strip — five small tiles explaining what each range means
     4. Methodology note  — small disclaimer about BMI's limitations
     5. CTA back to survey
   ========================================================================= */

// Five WHO BMI categories with the helvi tint palette. Each tile is a small
// pastel block with the range as an editorial number + the label below.
const CATEGORIES = [
  { range: "< 18.5", label: "Untergewicht", tint: "hsl(var(--tint-powder-blue))" },
  { range: "18.5 – 24.9", label: "Normalgewicht", tint: "hsl(var(--tint-moss))" },
  { range: "25 – 29.9", label: "Übergewicht", tint: "hsl(var(--tint-peach))" },
  { range: "30 – 34.9", label: "Adipositas I", tint: "hsl(var(--tint-dusty-pink))" },
  { range: "≥ 35", label: "Adipositas II+", tint: "hsl(var(--tint-lavender))" },
];

const BmiRechner = () => (
  <PageShell>
    {/* === 1. Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Ressourcen · Tools
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6">
          BMI Rechner.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Berechnen Sie Ihren Body-Mass-Index in Sekunden und sehen Sie Ihre
          persönliche GLP-1 Gewichtsprognose über 12 Monate.
        </p>
      </div>
    </section>

    {/* === 2. Calculator block — off-white card, two-column on desktop === */}
    <section className="px-4 mt-12">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-[14px] bg-muted p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: explanatory copy */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Ihre Prognose
              </p>
              <h2 className="font-editorial text-4xl md:text-5xl leading-[0.95] mb-4">
                Wie viel können<br />Sie verlieren?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                Geben Sie Ihre Daten ein — wir zeigen Ihnen sofort Ihren BMI
                und Ihre persönliche GLP-1 Gewichtsprognose.
              </p>
            </div>

            {/* Right: the shared widget on a white card so it pops on the band */}
            <div className="bg-background rounded-2xl p-6 md:p-8">
              <BmiWidget variant="light" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* === 3. BMI category explainer ===
       Five small tiles showing WHO ranges in helvi tints. Helps the user
       interpret their result without making them Google it. */}
    <section className="px-4 mt-20 md:mt-28">
      <div className="container mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          BMI Kategorien
        </p>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-10 max-w-2xl">
          Was bedeutet<br />Ihr Wert?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map((c) => (
            <div
              key={c.label}
              className="rounded-[12px] p-5 flex flex-col gap-2"
              style={{ background: c.tint }}
            >
              <p className="font-editorial text-2xl md:text-3xl leading-none">
                {c.range}
              </p>
              <p className="text-xs font-medium text-foreground/75">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* === 4. Methodology + limitations note === */}
    <section className="px-4 mt-16">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Methodik
        </p>
        <h2 className="font-editorial text-3xl md:text-4xl leading-[1.05] mb-4">
          BMI ist ein Richtwert, kein Urteil.
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Der BMI wird als Gewicht (kg) geteilt durch die Körpergrösse (m) zum
          Quadrat berechnet. Er liefert eine schnelle Orientierung, berücksichtigt
          aber weder Muskelmasse noch Fettverteilung. Für eine vollständige
          Einschätzung empfehlen wir die ärztliche Beurteilung im Rahmen
          unseres Fragebogens.
        </p>
      </div>
    </section>

    {/* === 5. CTA back into the survey funnel === */}
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

export default BmiRechner;

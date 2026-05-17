import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Pricing — three-tier plan comparison.
   Wrapped in PageShell so it shares the slim header + minimal footer with the
   other secondary pages. Visual language follows DESIGN.md: editorial serif
   headlines, pastel-tinted plan cards (instead of a single dark "highlighted"
   plan), and solid black pill CTAs.
   ========================================================================= */

// Each plan card carries its own pastel tint so the row reads as three
// editorial product tiles rather than a "pick the middle one" comparison.
// The middle plan is the recommended one — it gets the deepest tint.
const plans = [
  {
    name: "Starter",
    price: "149",
    period: "/ Monat",
    description: "Ideal für den Einstieg in Ihre Gewichtstherapie.",
    features: [
      "Online-Fragebogen & ärztliche Beurteilung",
      "Monatliche Medikamentenlieferung",
      "Diskrete Lieferung nach Hause",
      "Zugang zur helvi App",
    ],
    cta: "Jetzt starten",
    href: "/survey/women",
    tint: "hsl(var(--tint-peach))",
    recommended: false,
  },
  {
    name: "Standard",
    price: "249",
    period: "/ Monat",
    description: "Unsere beliebteste Option mit umfassender Betreuung.",
    features: [
      "Alles aus Starter",
      "Monatliche Arzt-Videokonsultation",
      "Persönlicher Ernährungsplan",
      "Prioritäts-Support (24h Antwort)",
      "Fortschrittsberichte",
    ],
    cta: "Jetzt starten",
    href: "/survey/women",
    tint: "hsl(var(--tint-lavender))",
    recommended: true,
  },
  {
    name: "Premium",
    price: "399",
    period: "/ Monat",
    description: "Maximale Betreuung für schnelle, nachhaltige Ergebnisse.",
    features: [
      "Alles aus Standard",
      "Wöchentliche Arzt-Videokonsultationen",
      "Persönliches Coaching",
      "Blutanalyse inklusive",
      "Sofort-Support (2h Antwort)",
      "Exklusiver Mitgliederbereich",
    ],
    cta: "Jetzt starten",
    href: "/survey/women",
    tint: "hsl(var(--tint-moss))",
    recommended: false,
  },
];

const Pricing = () => (
  <PageShell>
    {/* === Page header — small label + huge editorial headline === */}
    <section className="px-4 pt-16 pb-12 md:pt-24 text-center">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Preise
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6">
          Transparent.<br />In Schweizer Franken.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Wählen Sie das Paket, das zu Ihren Zielen passt — ohne versteckte
          Kosten. Jedes Paket beinhaltet ärztliche Betreuung.
        </p>
      </div>
    </section>

    {/* === Plan cards — three pastel-tinted tiles, middle one marked recommended === */}
    <section className="px-4 mt-8">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[14px] p-8 flex flex-col gap-6"
              style={{ background: plan.tint }}
            >
              {/* Header: name + recommended tag + price */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
                    {plan.name}
                  </p>
                  {plan.recommended && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-foreground text-background rounded-full px-2 py-0.5">
                      Empfohlen
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1.5 mb-3">
                  <span className="font-editorial text-5xl md:text-6xl leading-none">
                    CHF&nbsp;{plan.price}
                  </span>
                  <span className="text-sm text-foreground/60 mb-2">{plan.period}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/75">
                  {plan.description}
                </p>
              </div>

              {/* Feature list — black check + small DM Sans line */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={2} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Pill CTA — solid black on tinted background */}
              <Link
                to={plan.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Fine print under the plan grid */}
        <p className="text-center text-xs text-muted-foreground mt-10 max-w-lg mx-auto leading-relaxed">
          Alle Preise verstehen sich inklusive Mehrwertsteuer. Medikamente sind
          im Paketpreis enthalten. Monatlich kündbar.
        </p>
      </div>
    </section>

    {/* === FAQ teaser — off-white band with serif headline === */}
    <section className="mt-20 md:mt-28 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-[14px] bg-muted py-16 px-8 text-center">
          <h2 className="font-editorial text-4xl md:text-5xl leading-[1] mb-4">
            Noch Fragen?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            In unserem FAQ finden Sie Antworten auf die häufigsten Fragen zu
            Behandlung, Kosten und Ablauf.
          </p>
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            Zum FAQ <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Pricing;

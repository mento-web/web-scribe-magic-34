import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      "Zugang zur SwissVita App",
    ],
    cta: "Jetzt starten",
    href: "/survey/women",
    highlighted: false,
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
    highlighted: true,
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
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
            swissvita
          </Link>
          <div className="flex items-center gap-6">
            <a href="/#bmi-rechner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              BMI Rechner
            </a>
            <Link to="/proteinrechner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Proteinrechner
            </Link>
            <Link to="/blogs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link to="/survey/women">
              <Button className="rounded-full px-6 text-sm font-medium">
                Jetzt starten
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Preise</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            Transparente Preise in CHF
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Wählen Sie das Paket, das zu Ihren Zielen passt — ohne versteckte Kosten. Alle Pakete beinhalten ärztliche Betreuung.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 flex flex-col gap-6 ${
                  plan.highlighted
                    ? "bg-foreground text-background"
                    : "bg-card"
                }`}
              >
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${plan.highlighted ? "text-background/60" : "text-muted-foreground"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="text-5xl font-bold tracking-tight">CHF {plan.price}</span>
                    <span className={`text-sm mb-2 ${plan.highlighted ? "text-background/60" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-background/70" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-background" : "text-accent"}`} />
                      <span className={plan.highlighted ? "text-background/90" : ""}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    className={`rounded-full w-full font-semibold gap-2 ${
                      plan.highlighted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : ""
                    }`}
                    variant={plan.highlighted ? "secondary" : "default"}
                  >
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Fine print */}
          <p className="text-center text-xs text-muted-foreground mt-10 max-w-lg mx-auto">
            Alle Preise verstehen sich inklusive Mehrwertsteuer. Die Kosten für Medikamente sind im Paketpreis enthalten. Monatlich kündbar.
          </p>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Haben Sie noch Fragen?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            In unserem FAQ finden Sie Antworten auf die häufigsten Fragen zu Behandlung, Kosten und Ablauf.
          </p>
          <Link to="/faq">
            <Button variant="outline" className="rounded-full px-8 font-semibold gap-2">
              Zum FAQ <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <p className="text-xl font-bold">swissvita</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Ärztlich begleitete Gewichtstherapie in der Schweiz.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link to="/proteinrechner" className="text-muted-foreground hover:text-foreground transition-colors">
                Proteinrechner
              </Link>
              <Link to="/blogs" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preise
              </Link>
            </div>
            <div className="text-sm text-muted-foreground space-y-2 md:text-right max-w-md">
              <p>© {new Date().getFullYear()} SwissVita. Alle Rechte vorbehalten.</p>
              <p className="text-xs">
                Dies ist kein Ersatz für eine ärztliche Beratung. Alle Behandlungen erfolgen unter ärztlicher Aufsicht gemäss Schweizer Heilmittelgesetz (HMG).
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;

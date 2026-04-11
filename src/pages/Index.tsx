import { Link } from "react-router-dom";
import { Shield, Stethoscope, Truck, CheckCircle, ArrowRight, Star, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustItems = [
  { icon: Stethoscope, label: "Lizenzierte Ärzte" },
  { icon: Shield, label: "100% Online" },
  { icon: CheckCircle, label: "Transparente Preise" },
  { icon: Truck, label: "Diskrete Lieferung" },
];

const steps = [
  { number: "01", title: "Online-Fragebogen", description: "Beantworten Sie einige Fragen zu Ihrer Gesundheit und Ihren Zielen." },
  { number: "02", title: "Ärztliche Beurteilung", description: "Ein Schweizer Arzt prüft Ihre Angaben und erstellt eine Empfehlung." },
  { number: "03", title: "Behandlung erhalten", description: "Ihr Medikament wird diskret zu Ihnen nach Hause geliefert." },
];

const testimonials = [
  { name: "Anna M.", location: "Zürich", text: "Ich habe in 3 Monaten 12 kg abgenommen. Die ärztliche Betreuung war hervorragend.", rating: 5 },
  { name: "Thomas K.", location: "Bern", text: "Endlich ein Programm, das wirklich funktioniert. Professionell und diskret.", rating: 5 },
  { name: "Sandra L.", location: "Basel", text: "Die Online-Beratung war sehr angenehm. Ich fühle mich bestens betreut.", rating: 5 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-xl font-bold text-primary tracking-tight">
            Swiss<span className="text-foreground">Vita</span>
          </Link>
          <Link to="/survey/women">
            <Button size="sm">Jetzt starten</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-4 text-center">
          <p className="text-hero-foreground/70 text-sm font-semibold uppercase tracking-widest mb-4">
            Ärztlich begleitete GLP-1 Therapie
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-hero-foreground leading-tight mb-6">
            Gewichtsverlust,{" "}
            <span className="text-accent">medizinisch begleitet.</span>
          </h1>
          <p className="text-hero-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Wir bieten ärztlich betreute GLP-1 Behandlungen online an — einfach, diskret und von lizenzierten Schweizer Ärzten begleitet.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/survey/men">
              <Button size="lg" className="w-56 text-base font-semibold gap-2">
                Für Männer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/survey/women">
              <Button size="lg" variant="outline" className="w-56 text-base font-semibold gap-2 border-hero-foreground/30 text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground">
                Für Frauen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-muted border-b overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {[...trustItems, ...trustItems, ...trustItems].map((item, i) => (
            <div key={i} className="flex items-center gap-2 mx-8 text-muted-foreground">
              <item.icon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">So funktioniert's</p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            In 3 Schritten zur <span className="text-accent">Behandlung</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="relative bg-card border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <span className="text-5xl font-extrabold text-primary/10">{step.number}</span>
                <h3 className="text-xl font-bold mt-2 mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: "10'000+", label: "Zufriedene Patienten" },
              { icon: Star, value: "4.9/5", label: "Bewertung" },
              { icon: Stethoscope, value: "50+", label: "Schweizer Ärzte" },
              { icon: Clock, value: "24h", label: "Antwortzeit" },
            ].map((stat, i) => (
              <div key={i}>
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-extrabold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">Erfahrungsberichte</p>
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Was unsere <span className="text-accent">Patienten</span> sagen
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card border rounded-2xl p-8">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">«{t.text}»</p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-hero-foreground mb-4">
            Bereit für den ersten Schritt?
          </h2>
          <p className="text-hero-foreground/70 max-w-lg mx-auto mb-8">
            Finden Sie in wenigen Minuten heraus, ob eine GLP-1 Therapie für Sie geeignet ist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/survey/men">
              <Button size="lg" variant="secondary" className="w-56 font-semibold">Für Männer</Button>
            </Link>
            <Link to="/survey/women">
              <Button size="lg" variant="secondary" className="w-56 font-semibold">Für Frauen</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="font-bold text-primary">Swiss<span className="text-foreground">Vita</span></p>
              <p className="text-xs text-muted-foreground mt-1">Ärztlich begleitete Gewichtstherapie in der Schweiz</p>
            </div>
            <div className="text-xs text-muted-foreground text-center md:text-right space-y-1">
              <p>© {new Date().getFullYear()} SwissVita. Alle Rechte vorbehalten.</p>
              <p>Dies ist kein Ersatz für eine ärztliche Beratung. Alle Behandlungen erfolgen unter ärztlicher Aufsicht gemäss Schweizer Heilmittelgesetz (HMG).</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Stethoscope, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroProduct from "@/assets/hero-product.jpg";
import heroMan from "@/assets/hero-man.jpg";
import heroWoman from "@/assets/hero-woman.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
            swissvita
          </Link>
          <Link to="/survey/women">
            <Button className="rounded-full px-6 text-sm font-medium">
              Jetzt starten
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8 max-w-4xl">
            Starten Sie Ihre
            <br />
            <span className="text-accent">Gewichtsreise.</span>
          </h1>

          {/* Bento Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Product Card */}
            <Link
              to="/survey/men"
              className="group relative overflow-hidden rounded-3xl bg-secondary aspect-[3/4] md:aspect-auto md:row-span-2 flex flex-col justify-between p-8"
            >
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">GLP-1 Therapie</p>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Starten Sie Ihre<br />Gewichtsreise heute
                </h2>
              </div>
              <img
                src={heroProduct}
                alt="GLP-1 Injektionspen"
                className="absolute bottom-0 right-0 w-3/5 md:w-1/2 object-contain translate-y-4 translate-x-4 group-hover:translate-y-2 transition-transform duration-500"
              />
              <div className="relative z-10 flex items-center gap-2 text-sm font-semibold mt-auto">
                Fragebogen starten <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Men Card */}
            <Link
              to="/survey/men"
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-auto"
            >
              <img
                src={heroMan}
                alt="Mann nach erfolgreicher Behandlung"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8 text-primary-foreground">
                <p className="text-sm font-medium opacity-80 mb-1">Für Männer</p>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Finden Sie heraus, ob Sie qualifiziert sind</h3>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Starten <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Women Card */}
            <Link
              to="/survey/women"
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] md:aspect-auto"
            >
              <img
                src={heroWoman}
                alt="Frau nach erfolgreicher Behandlung"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8 text-primary-foreground">
                <p className="text-sm font-medium opacity-80 mb-1">Für Frauen</p>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Medizinisch begleiteter Gewichtsverlust</h3>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Starten <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Icons */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, label: "Lizenzierte Schweizer Ärzte" },
              { icon: Shield, label: "100% Online & Sicher" },
              { icon: CheckCircle, label: "Transparente Preise in CHF" },
              { icon: Truck, label: "Diskrete Lieferung" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-card">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">So funktioniert's</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-16">
            In 3 einfachen Schritten
          </h2>
          <div className="space-y-0">
            {[
              { num: "01", title: "Online-Fragebogen ausfüllen", desc: "Beantworten Sie einige Fragen zu Ihrer Gesundheit — dauert nur 3 Minuten." },
              { num: "02", title: "Ärztliche Beurteilung", desc: "Ein Schweizer Arzt prüft Ihre Angaben und erstellt Ihre persönliche Empfehlung." },
              { num: "03", title: "Behandlung erhalten", desc: "Ihr Medikament wird diskret und direkt zu Ihnen nach Hause geliefert." },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 md:gap-10 py-8 border-t last:border-b">
                <span className="text-4xl md:text-5xl font-bold text-accent/30 shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Erfahrungsberichte</p>
              <h2 className="text-3xl md:text-5xl font-bold">Echte Resultate</h2>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
              <span className="ml-2 text-sm font-semibold">4.9/5</span>
              <span className="text-sm text-muted-foreground ml-1">· 10'000+ Patienten</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Anna M.", loc: "Zürich", text: "Ich habe in 3 Monaten 12 kg abgenommen. Die ärztliche Betreuung war hervorragend." },
              { name: "Thomas K.", loc: "Bern", text: "Endlich ein Programm, das wirklich funktioniert. Professionell und diskret." },
              { name: "Sandra L.", loc: "Basel", text: "Die Online-Beratung war sehr angenehm. Ich fühle mich bestens betreut." },
            ].map((t, i) => (
              <div key={i} className="bg-background rounded-2xl p-7">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">«{t.text}»</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Bereit für Ihren ersten Schritt?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            Finden Sie in nur 3 Minuten heraus, ob eine GLP-1 Therapie für Sie geeignet ist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/survey/men">
              <Button size="lg" className="rounded-full w-52 font-semibold gap-2">
                Für Männer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/survey/women">
              <Button size="lg" variant="outline" className="rounded-full w-52 font-semibold gap-2">
                Für Frauen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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

export default Index;

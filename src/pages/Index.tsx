import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroProduct from "@/assets/hero-product.jpg";
import heroMan from "@/assets/hero-man.jpg";
import heroWoman from "@/assets/hero-woman.jpg";

// Dark-styled BMI form — lives inside the black hero card
const HeroBmiWidget = () => {
  const navigate = useNavigate();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"women" | "men">("women");
  const canSubmit = Number(height) > 0 && Number(weight) > 0;
  const go = () => {
    if (canSubmit) navigate(`/analyse?height=${height}&weight=${weight}&gender=${gender}`);
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["women", "men"] as const).map((g) => (
          <button
            key={g} type="button" onClick={() => setGender(g)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              gender === g ? "bg-white text-black" : "bg-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            {g === "women" ? "Frau" : "Mann"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Grösse", value: height, set: setHeight, placeholder: "175", suffix: "cm" },
          { label: "Gewicht", value: weight, set: setWeight, placeholder: "90", suffix: "kg" },
        ].map((f) => (
          <div key={f.label} className="bg-white/10 rounded-2xl p-4">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">{f.label}</label>
            <div className="flex items-end gap-1">
              <input
                type="number" inputMode="numeric" placeholder={f.placeholder}
                value={f.value} onChange={(e) => f.set(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                className="w-full h-10 text-2xl font-bold bg-transparent text-white placeholder:text-white/20 border-0 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-white/30 pb-1 shrink-0">{f.suffix}</span>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button" onClick={go} disabled={!canSubmit}
        className="w-full py-3.5 rounded-full bg-accent text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30 hover:opacity-90 transition-opacity"
      >
        Prognose berechnen <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// Light-styled BMI form — used in the section below
const BmiWidget = () => {
  const navigate = useNavigate();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"women" | "men">("women");
  const canSubmit = Number(height) > 0 && Number(weight) > 0;
  const go = () => {
    if (canSubmit) navigate(`/analyse?height=${height}&weight=${weight}&gender=${gender}`);
  };
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["women", "men"] as const).map((g) => (
          <button
            key={g} type="button" onClick={() => setGender(g)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              gender === g ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {g === "women" ? "Frau" : "Mann"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Grösse", value: height, set: setHeight, placeholder: "175", suffix: "cm" },
          { label: "Gewicht", value: weight, set: setWeight, placeholder: "90", suffix: "kg" },
        ].map((f) => (
          <div key={f.label} className="bg-background rounded-2xl p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">{f.label}</label>
            <div className="flex items-end gap-1.5">
              <Input
                type="number" inputMode="numeric" placeholder={f.placeholder}
                value={f.value} onChange={(e) => f.set(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                className="h-11 text-2xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm font-medium text-muted-foreground pb-1.5 shrink-0">{f.suffix}</span>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={go} disabled={!canSubmit} size="lg" className="w-full rounded-full font-semibold gap-2 disabled:opacity-30">
        Jetzt prüfen <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tight">helvi</Link>
          <div className="flex items-center gap-6">
            <a href="#bmi-rechner" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              BMI Rechner
            </a>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preise
            </Link>
            <Link to="/survey/women">
              <Button className="rounded-full px-6 text-sm font-medium">Jetzt starten</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — split layout */}
      <section className="pt-16 min-h-[94vh] flex items-center px-4">
        <div className="container mx-auto py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: headline + CTAs */}
            <div>
              <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider mb-8">
                Klinisch erprobt · Schweizer Ärzte
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.92] mb-6">
                Abnehmen,
                <br />
                das wirklich
                <br />
                <span className="text-accent">wirkt.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-9 max-w-md">
                Bis zu −21% Körpergewicht in 12 Monaten — medizinisch begleitet, diskret nach Hause geliefert.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/survey/women">
                  <Button size="lg" className="rounded-full font-semibold gap-2">
                    Für Frauen <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/survey/men">
                  <Button size="lg" variant="outline" className="rounded-full font-semibold gap-2">
                    Für Männer <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: dark BMI card */}
            <div className="bg-foreground text-background rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mb-1">Sofort-Check</p>
              <h2 className="text-2xl font-bold mb-7">Sind Sie geeignet?</h2>
              <HeroBmiWidget />
              <p className="text-xs opacity-25 mt-5 leading-relaxed">
                Basiert auf klinischen Studiendaten. Keine Anmeldung erforderlich.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-foreground text-background py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { stat: "−21%",     label: "Ø Gewichtsverlust" },
              { stat: "10'000+",  label: "Patienten behandelt" },
              { stat: "68 Wo.",   label: "Klinisch erprobt" },
              { stat: "4.9 / 5",  label: "Patientenbewertung" },
            ].map((s) => (
              <div key={s.stat} className="border-l border-white/10 pl-6 first:border-0 first:pl-0">
                <p className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{s.stat}</p>
                <p className="text-sm font-medium opacity-40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Product Card — dark */}
            <Link
              to="/survey/women"
              className="group relative overflow-hidden rounded-3xl bg-foreground text-background md:row-span-2 flex flex-col p-8 md:p-10 min-h-[420px]"
            >
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-40 mb-3">GLP-1 Therapie</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] max-w-xs">
                  Ihre Gewichtsreise beginnt hier.
                </h2>
              </div>
              <div className="relative flex-1 flex items-center justify-center my-8 md:my-10 min-h-[200px]">
                <img
                  src={heroProduct}
                  alt="GLP-1 Injektionspen"
                  className="max-h-[280px] md:max-h-[360px] w-auto object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="relative z-10 flex items-center gap-2 text-sm font-semibold">
                Fragebogen starten
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Men Card */}
            <Link to="/survey/men" className="group relative overflow-hidden rounded-3xl aspect-[7/5]">
              <img
                src={heroMan} alt="Mann"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
                <p className="text-sm font-medium opacity-70 mb-1">Für Männer</p>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Qualifiziert? Jetzt herausfinden.</h3>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Starten <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Women Card */}
            <Link to="/survey/women" className="group relative overflow-hidden rounded-3xl aspect-[7/5]">
              <img
                src={heroWoman} alt="Frau"
                className="absolute inset-0 w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
                <p className="text-sm font-medium opacity-70 mb-1">Für Frauen</p>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Medizinisch begleitet. Nachweislich wirksam.</h3>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Starten <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* BMI Rechner */}
      <section id="bmi-rechner" className="py-20 px-4 scroll-mt-20 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Ihre Prognose</p>
              <h2 className="text-3xl md:text-4xl font-bold leading-[1.1] mb-4">
                Wie viel können Sie verlieren?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Geben Sie Ihre Daten ein — wir zeigen Ihnen sofort Ihren BMI und Ihre persönliche GLP-1 Gewichtsprognose.
              </p>
            </div>
            <BmiWidget />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-14">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">So funktioniert's</p>
            <h2 className="text-3xl md:text-5xl font-bold">In 3 Schritten.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              { num: "01", title: "Fragebogen ausfüllen", desc: "3 Minuten. Anonym. Kein Arzttermin nötig." },
              { num: "02", title: "Ärztliche Beurteilung", desc: "Ein Schweizer Arzt prüft Ihre Angaben und erstellt Ihre Empfehlung." },
              { num: "03", title: "Behandlung starten", desc: "Ihr Medikament kommt diskret direkt zu Ihnen nach Hause." },
            ].map((step) => (
              <div key={step.num}>
                <span className="block text-5xl md:text-6xl font-bold text-accent/20 mb-5">{step.num}</span>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — dark inverted */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Erfahrungsberichte</p>
              <h2 className="text-3xl md:text-5xl font-bold">Echte Resultate.</h2>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
              <span className="ml-2 text-sm font-semibold">4.9 / 5</span>
              <span className="text-sm opacity-40 ml-1">· 10'000+ Patienten</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Anna M.", loc: "Zürich", text: "In 3 Monaten 12 kg abgenommen. Die ärztliche Betreuung war ausgezeichnet." },
              { name: "Thomas K.", loc: "Bern", text: "Endlich etwas, das funktioniert. Professionell, diskret, wirksam." },
              { name: "Sandra L.", loc: "Basel", text: "Die Online-Beratung war einfach und angenehm. Ich fühle mich bestens betreut." },
            ].map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm opacity-60 mb-6 leading-relaxed">«{t.text}»</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs opacity-35">{t.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Bereit anzufangen?</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            In 3 Minuten wissen Sie, ob GLP-1 für Sie geeignet ist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/survey/women">
              <Button size="lg" className="rounded-full w-52 font-semibold gap-2">
                Für Frauen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/survey/men">
              <Button size="lg" variant="outline" className="rounded-full w-52 font-semibold gap-2">
                Für Männer <ArrowRight className="h-4 w-4" />
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
              <p className="text-xl font-bold">helvi</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Ärztlich begleitete Gewichtstherapie in der Schweiz.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Preise</Link>
            </div>
            <div className="text-sm text-muted-foreground space-y-2 md:text-right max-w-md">
              <p>© {new Date().getFullYear()} Helvi. Alle Rechte vorbehalten.</p>
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

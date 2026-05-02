import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const activityLevels = [
  { label: "Wenig aktiv", desc: "Bürojob, kaum Sport", factor: 1.2 },
  { label: "Leicht aktiv", desc: "1–3 Trainings/Woche", factor: 1.375 },
  { label: "Mässig aktiv", desc: "3–5 Trainings/Woche", factor: 1.55 },
  { label: "Sehr aktiv", desc: "6–7 Trainings/Woche", factor: 1.725 },
  { label: "Extrem aktiv", desc: "Profi / körperliche Arbeit", factor: 1.9 },
];

const goals = [
  { label: "Gewicht halten", multiplier: 1.6 },
  { label: "Abnehmen", multiplier: 2.0 },
  { label: "Muskelaufbau", multiplier: 2.2 },
];

const Proteinrechner = () => {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<number | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    if (!weight || activity === null || goal === null) return;
    const kg = parseFloat(weight);
    if (isNaN(kg) || kg <= 0) return;
    setResult(Math.round(kg * goals[goal].multiplier));
  };

  const reset = () => {
    setWeight("");
    setActivity(null);
    setGoal(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
            swissvita
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Tool
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-4">
            Proteinrechner
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-12">
            Berechnen Sie Ihren täglichen Proteinbedarf basierend auf Ihrem Gewicht, Aktivitätslevel und Ziel.
          </p>

          {result === null ? (
            <div className="space-y-8">
              {/* Weight */}
              <div className="bg-card rounded-3xl p-8">
                <h2 className="text-lg font-bold mb-5">Ihr Körpergewicht</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="z.B. 75"
                    className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <span className="text-muted-foreground font-medium shrink-0">kg</span>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-card rounded-3xl p-8">
                <h2 className="text-lg font-bold mb-5">Aktivitätslevel</h2>
                <div className="space-y-3">
                  {activityLevels.map((lvl, i) => (
                    <button
                      key={i}
                      onClick={() => setActivity(i)}
                      className={`w-full flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${
                        activity === i
                          ? "border-foreground bg-secondary"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{lvl.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{lvl.desc}</p>
                      </div>
                      {activity === i && (
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="bg-card rounded-3xl p-8">
                <h2 className="text-lg font-bold mb-5">Ihr Ziel</h2>
                <div className="space-y-3">
                  {goals.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setGoal(i)}
                      className={`w-full flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors ${
                        goal === i
                          ? "border-foreground bg-secondary"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <p className="font-semibold text-sm">{g.label}</p>
                      {goal === i && (
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={calculate}
                disabled={!weight || activity === null || goal === null}
                className="w-full rounded-full py-6 text-base font-semibold gap-2"
              >
                Berechnen <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Result card */}
              <div className="bg-card rounded-3xl p-10 text-center">
                <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                  Ihr Ergebnis
                </p>
                <p className="text-7xl md:text-8xl font-bold tracking-tight mb-2">
                  {result}
                  <span className="text-3xl md:text-4xl text-muted-foreground font-medium ml-2">g</span>
                </p>
                <p className="text-muted-foreground mt-3 text-lg">
                  Protein pro Tag empfohlen
                </p>
              </div>

              {/* Tips */}
              <div className="bg-card rounded-3xl p-8 space-y-4">
                <h3 className="font-bold text-lg">So erreichen Sie Ihr Ziel</h3>
                {[
                  { food: "Hähnchenbrust (100g)", protein: "31g Protein" },
                  { food: "Griechischer Joghurt (200g)", protein: "20g Protein" },
                  { food: "Eier (2 Stück)", protein: "12g Protein" },
                  { food: "Hüttenkäse (150g)", protein: "18g Protein" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-t">
                    <span className="text-sm font-medium">{item.food}</span>
                    <span className="text-sm font-semibold text-accent">{item.protein}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={reset} variant="outline" className="rounded-full flex-1 font-semibold">
                  Neu berechnen
                </Button>
                <Link to="/survey/women" className="flex-1">
                  <Button className="rounded-full w-full font-semibold gap-2">
                    Zum Fragebogen <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Proteinrechner;

import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const posts = [
  {
    slug: "glp1-was-ist-das",
    category: "Medizin",
    title: "GLP-1 Therapie: Was steckt dahinter?",
    excerpt:
      "GLP-1 ist ein natürliches Darmhormon, das den Blutzucker reguliert und das Sättigungsgefühl steigert. Erfahren Sie, wie moderne Medikamente diesen Mechanismus nutzen, um beim Abnehmen zu helfen.",
    date: "28. April 2026",
    readTime: "5 Min. Lesezeit",
  },
  {
    slug: "ernaehrung-beim-abnehmen",
    category: "Ernährung",
    title: "Richtig essen während einer Gewichtstherapie",
    excerpt:
      "Welche Lebensmittel unterstützen Ihre Therapie am besten? Unsere Ernährungsexperten geben praktische Tipps für den Alltag – ohne Verzicht auf Genuss.",
    date: "21. April 2026",
    readTime: "4 Min. Lesezeit",
  },
  {
    slug: "bewegung-und-sport",
    category: "Lifestyle",
    title: "Bewegung als Schlüssel zum Erfolg",
    excerpt:
      "Sport und Bewegung verstärken die Wirkung einer GLP-1 Therapie erheblich. Wir zeigen, welche Aktivitäten besonders effektiv sind und wie Sie motiviert bleiben.",
    date: "14. April 2026",
    readTime: "6 Min. Lesezeit",
  },
  {
    slug: "bmi-richtig-verstehen",
    category: "Gesundheit",
    title: "BMI richtig verstehen und einordnen",
    excerpt:
      "Der Body-Mass-Index ist ein nützliches Werkzeug – aber kein alleiniger Massstab für Gesundheit. Wir erklären, was er aussagt und wo seine Grenzen liegen.",
    date: "7. April 2026",
    readTime: "3 Min. Lesezeit",
  },
  {
    slug: "psychologie-des-abnehmens",
    category: "Mindset",
    title: "Die Psychologie hinter dem Abnehmen",
    excerpt:
      "Gewicht verlieren ist nicht nur eine körperliche, sondern auch eine mentale Herausforderung. Kleine Gewohnheitsänderungen können einen grossen Unterschied machen.",
    date: "31. März 2026",
    readTime: "7 Min. Lesezeit",
  },
  {
    slug: "erfolgsgeschichten",
    category: "Erfahrungen",
    title: "Erfahrungsberichte unserer Patientinnen und Patienten",
    excerpt:
      "Lesen Sie, wie echte Menschen aus der Schweiz ihre Ziele mit SwissVita erreicht haben – ehrlich, persönlich und inspirierend.",
    date: "24. März 2026",
    readTime: "8 Min. Lesezeit",
  },
];

const categoryColors: Record<string, string> = {
  Medizin: "bg-blue-100 text-blue-800",
  Ernährung: "bg-green-100 text-green-800",
  Lifestyle: "bg-purple-100 text-purple-800",
  Gesundheit: "bg-orange-100 text-orange-800",
  Mindset: "bg-pink-100 text-pink-800",
  Erfahrungen: "bg-yellow-100 text-yellow-800",
};

const Blogs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
            swissvita
          </Link>
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Blog</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Wissen & Inspiration</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Expertenwissen rund um Gewichtstherapie, Ernährung und einen gesunden Lebensstil – von unserem Ärzteteam für Sie aufbereitet.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-2 bg-accent w-full" />
                <div className="flex flex-col flex-1 p-6 gap-4">
                  <span
                    className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category]}`}
                  >
                    {post.category}
                  </span>
                  <h2 className="text-lg font-bold leading-snug group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all w-fit">
                    Weiterlesen <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit für Ihre Reise?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Starten Sie jetzt Ihren persönlichen Fragebogen und erfahren Sie, welche Therapie zu Ihnen passt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/survey/men">
              <Button size="lg" className="rounded-full w-52 font-semibold gap-2">
                Für Männer
              </Button>
            </Link>
            <Link to="/survey/women">
              <Button size="lg" variant="outline" className="rounded-full w-52 font-semibold gap-2">
                Für Frauen
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

export default Blogs;

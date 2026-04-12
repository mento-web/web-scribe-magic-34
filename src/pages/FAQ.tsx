import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Was ist eine GLP-1 Therapie?",
      answer: "GLP-1 (Glucagon-like Peptide-1) Therapien sind medizinische Behandlungen, die das Hormon GLP-1 nachahmen. Dieses Hormon reguliert den Blutzucker und reduziert das Hungergefühl. Die Therapie wird von lizenzierten Schweizer Ärzten verschrieben und begleitet."
    },
    {
      question: "Wie lange dauert der Fragebogen?",
      answer: "Der medizinische Fragebogen dauert etwa 3 Minuten. Er umfasst Fragen zu Ihrer Gesundheit, Ihrem Lebensstil und Ihren Zielen, damit unser Arztteam eine personalisierte Behandlungsempfehlung erstellen kann."
    },
    {
      question: "Ist die Behandlung in der Schweiz legal?",
      answer: "Ja, alle Behandlungen erfolgen unter ärztlicher Aufsicht gemäss dem Schweizer Heilmittelgesetz (HMG). Wir arbeiten ausschliesslich mit lizenzierten Schweizer Ärzten zusammen."
    },
    {
      question: "Wie wird das Medikament geliefert?",
      answer: "Die Lieferung erfolgt diskret direkt zu Ihrer Wohnadresse. Die Verpackung ist neutral und enthält keine Hinweise auf den Inhalt. Die Lieferzeit beträgt in der Regel 1-2 Werktage innerhalb der Schweiz."
    },
    {
      question: "Wie hoch sind die Kosten?",
      answer: "Die Kosten variieren je nach Behandlungsplan. Nach Ausfüllen des Fragebogens erhalten Sie eine transparente Preisübersicht. Alle Preise sind in Schweizer Franken (CHF) und verstehen sich inklusive Mehrwertsteuer."
    },
    {
      question: "Was passiert nach dem Fragebogen?",
      answer: "Ein lizenzierter Schweizer Arzt prüft Ihre Angaben innerhalb von 24 Stunden. Sie erhalten eine personalisierte Behandlungsempfehlung und können bei Zustimmung sofort mit der Therapie beginnen."
    },
    {
      question: "Ist meine Daten sicher?",
      answer: "Ja, wir verwenden verschlüsselte Verbindungen (SSL) und speichern alle medizinischen Daten gemäss den schweizerischen Datenschutzbestimmungen (DSG). Ihre Daten werden nie an Dritte weitergegeben."
    },
    {
      question: "Kann ich die Behandlung abbrechen?",
      answer: "Ja, Sie können die Behandlung jederzeit abbrechen. Bei Fragen oder Bedenken steht Ihnen unser Ärzteteam jederzeit zur Verfügung."
    },
    {
      question: "Gibt es Nebenwirkungen?",
      answer: "Wie bei allen Medikamenten können auch bei GLP-1 Therapien Nebenwirkungen auftreten. Die häufigsten sind Übelkeit, Durchfall oder Verstopfung. Ihr Arzt bespricht alle Risiken und Nebenwirkungen ausführlich mit Ihnen."
    },
    {
      question: "Wie erreiche ich den Kundensupport?",
      answer: "Unser Support-Team ist per E-Mail unter support@swissvita.ch erreichbar. Für medizinische Fragen kontaktieren Sie bitte direkt Ihren behandelnden Arzt über das Patientenportal."
    }
  ];

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
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Hilfe</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Häufig gestellte Fragen
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Finden Sie Antworten auf die wichtigsten Fragen zu unserer ärztlich begleiteten Gewichtstherapie.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b">
                <AccordionTrigger className="text-left py-6 text-lg font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Noch Fragen?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Starten Sie den Fragebogen und erfahren Sie, ob eine GLP-1 Therapie für Sie geeignet ist.
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

export default FAQ;

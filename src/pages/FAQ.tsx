import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageShell } from "@/components/PageShell";

/* ============================================================================
   FAQ — frequently asked questions (German).
   Wrapped in PageShell so it shares chrome with the other content pages.
   Visual language follows DESIGN.md: editorial serif heading, accordion list
   on a white surface, off-white CTA band at the end.
   ========================================================================= */

// Question data — keep all answers German and HMG-aware.
const faqs = [
  {
    question: "Was ist eine GLP-1 Therapie?",
    answer:
      "GLP-1 (Glucagon-like Peptide-1) Therapien sind medizinische Behandlungen, die das Hormon GLP-1 nachahmen. Dieses Hormon reguliert den Blutzucker und reduziert das Hungergefühl. Die Therapie wird von lizenzierten Schweizer Ärzten verschrieben und begleitet.",
  },
  {
    question: "Wie lange dauert der Fragebogen?",
    answer:
      "Der medizinische Fragebogen dauert etwa 3 Minuten. Er umfasst Fragen zu Ihrer Gesundheit, Ihrem Lebensstil und Ihren Zielen, damit unser Arztteam eine personalisierte Behandlungsempfehlung erstellen kann.",
  },
  {
    question: "Ist die Behandlung in der Schweiz legal?",
    answer:
      "Ja, alle Behandlungen erfolgen unter ärztlicher Aufsicht gemäss dem Schweizer Heilmittelgesetz (HMG). Wir arbeiten ausschliesslich mit lizenzierten Schweizer Ärzten zusammen.",
  },
  {
    question: "Wie wird das Medikament geliefert?",
    answer:
      "Die Lieferung erfolgt diskret direkt zu Ihrer Wohnadresse. Die Verpackung ist neutral und enthält keine Hinweise auf den Inhalt. Die Lieferzeit beträgt in der Regel 1–2 Werktage innerhalb der Schweiz.",
  },
  {
    question: "Wie hoch sind die Kosten?",
    answer:
      "Die Kosten variieren je nach Behandlungsplan. Nach Ausfüllen des Fragebogens erhalten Sie eine transparente Preisübersicht. Alle Preise sind in Schweizer Franken (CHF) und verstehen sich inklusive Mehrwertsteuer.",
  },
  {
    question: "Was passiert nach dem Fragebogen?",
    answer:
      "Ein lizenzierter Schweizer Arzt prüft Ihre Angaben innerhalb von 24 Stunden. Sie erhalten eine personalisierte Behandlungsempfehlung und können bei Zustimmung sofort mit der Therapie beginnen.",
  },
  {
    question: "Sind meine Daten sicher?",
    answer:
      "Ja, wir verwenden verschlüsselte Verbindungen (SSL) und speichern alle medizinischen Daten gemäss den schweizerischen Datenschutzbestimmungen (DSG). Ihre Daten werden nie an Dritte weitergegeben.",
  },
  {
    question: "Kann ich die Behandlung abbrechen?",
    answer:
      "Ja, Sie können die Behandlung jederzeit abbrechen. Bei Fragen oder Bedenken steht Ihnen unser Ärzteteam jederzeit zur Verfügung.",
  },
  {
    question: "Gibt es Nebenwirkungen?",
    answer:
      "Wie bei allen Medikamenten können auch bei GLP-1 Therapien Nebenwirkungen auftreten. Die häufigsten sind Übelkeit, Durchfall oder Verstopfung. Ihr Arzt bespricht alle Risiken und Nebenwirkungen ausführlich mit Ihnen.",
  },
  {
    question: "Wie erreiche ich den Kundensupport?",
    answer:
      "Unser Support-Team ist per E-Mail unter support@helvi.ch erreichbar. Für medizinische Fragen kontaktieren Sie bitte direkt Ihren behandelnden Arzt über das Patientenportal.",
  },
];

const FAQ = () => (
  <PageShell>
    {/* === Page header — centred small label + huge editorial headline === */}
    <section className="px-4 pt-16 pb-12 md:pt-24 text-center">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Hilfe
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6">
          Häufig gestellte<br />Fragen.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Antworten auf die wichtigsten Fragen zu unserer ärztlich begleiteten
          Gewichtstherapie.
        </p>
      </div>
    </section>

    {/* === Accordion — one question per row, no border noise === */}
    <section className="px-4 mt-12">
      <div className="container mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border"
            >
              <AccordionTrigger className="text-left py-6 text-lg font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* === CTA band — off-white, serif headline, pill buttons === */}
    <section className="mt-20 md:mt-28 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-[14px] bg-muted py-16 px-8 text-center">
          <h2 className="font-editorial text-4xl md:text-5xl leading-[1] mb-4">
            Noch Fragen offen?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Starten Sie den Fragebogen und erfahren Sie, ob eine GLP-1 Therapie
            für Sie geeignet ist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/survey/women"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity w-52 justify-center"
            >
              Für Frauen <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/survey/men"
              className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors w-52 justify-center"
            >
              Für Männer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PageShell>
);

export default FAQ;

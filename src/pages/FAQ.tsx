import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageShell } from "@/components/PageShell";
import { PillButton } from "@/components/PillButton";
import { faqs } from "@/lib/faqs";

/* ============================================================================
   FAQ — frequently asked questions (German).
   Wrapped in PageShell so it shares chrome with the other content pages.
   Visual language follows DESIGN.md: editorial serif heading, accordion list
   on a white surface, off-white CTA band at the end.

   The question/answer data lives in src/lib/faqs.ts so the compact FAQ
   band on the landing page (Index.tsx) can render a slice of the same
   list — keep edits there if you change copy.
   ========================================================================= */

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
            <Link to="/survey/women">
              <PillButton variant="solid" className="w-52 justify-center">
                Für Frauen <ArrowRight className="h-4 w-4" />
              </PillButton>
            </Link>
            <Link to="/survey/men">
              <PillButton variant="outline" className="w-52 justify-center">
                Für Männer <ArrowRight className="h-4 w-4" />
              </PillButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PageShell>
);

export default FAQ;

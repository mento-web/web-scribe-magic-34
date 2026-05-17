import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Karriere — placeholder careers page.
   Today helvi has no active openings listed in code; the page invites people
   to reach out. Replace the empty-state block with real openings once they
   exist. Linked from the footer column "Über helvi".
   ========================================================================= */

const Karriere = () => (
  <PageShell>
    {/* === Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Karriere
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          Bauen Sie<br />helvi mit.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Wir suchen Menschen, die Schweizer Telemedizin neu denken wollen —
          Ärztinnen und Ärzte, Software-Engineers, Produktdesigner, und
          Operations-Talente.
        </p>
      </div>
    </section>

    {/* === Values block — three short principles === */}
    <section className="px-4 mt-16">
      <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            title: "Patient zuerst",
            text: "Jede Entscheidung beginnt mit der Frage, ob sie für unsere Patientinnen und Patienten besser ist.",
          },
          {
            title: "Klein, fokussiert",
            text: "Wir sind ein kleines Team mit grossen Ambitionen. Sie werden Verantwortung übernehmen, nicht nur in Meetings sitzen.",
          },
          {
            title: "Schweizer Standard",
            text: "HMG-konform, DSG-konform, transparent. Wir nehmen Compliance und Datenschutz ernst — nicht weil wir müssen.",
          },
        ].map((v) => (
          <div key={v.title} className="border-t border-border pt-6">
            <p className="font-medium text-lg mb-3">{v.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>
    </section>

    {/* === Open-roles placeholder card ===
       This is where the live job list goes once positions are posted. Today
       it's an empty-state nudge to email careers@helvi.ch. */}
    <section className="px-4 mt-20 md:mt-28">
      <div className="container mx-auto max-w-3xl">
        <div className="rounded-[14px] bg-muted p-8 md:p-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Offene Stellen
          </p>
          <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] mb-4">
            Aktuell keine ausgeschriebenen<br />Stellen.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Wenn Sie glauben, dass Sie zu helvi passen — schreiben Sie uns
            trotzdem. Wir freuen uns über Initiativbewerbungen.
          </p>
          <a
            href="mailto:careers@helvi.ch"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            careers@helvi.ch <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Karriere;

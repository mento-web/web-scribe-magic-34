import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";

/* ============================================================================
   "Über uns" — short brand story page.
   Linked from the footer column "Über helvi".
   ========================================================================= */

const UeberUns = () => (
  <PageShell>
    {/* === Page header — small label + huge editorial headline === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Über helvi
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-10">
          Schweizer<br />Gewichts­therapie,<br />neu gedacht.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Helvi macht ärztlich begleitete GLP-1 Therapien einfach, diskret und
          bezahlbar — entwickelt in der Schweiz, für Menschen in der Schweiz.
        </p>
      </div>
    </section>

    {/* === Mission block — explains why helvi exists === */}
    <section className="px-4 mt-12 md:mt-16">
      <div className="container mx-auto max-w-3xl space-y-6 text-base md:text-lg leading-relaxed">
        <p>
          Über eine Million Menschen in der Schweiz leben mit Übergewicht.
          Trotzdem ist der Zugang zu wissenschaftlich fundierten, ärztlich
          begleiteten Behandlungen oft kompliziert, teuer oder schlicht
          unangenehm. Wir glauben, dass es einen besseren Weg gibt.
        </p>
        <p>
          Helvi verbindet Schweizer Ärztinnen und Ärzte mit klinisch geprüften
          GLP-1 Medikamenten und einer Online-Erfahrung, die sich nicht
          anfühlt wie ein Behördengang. Vom 3-minütigen Fragebogen bis zur
          diskreten Lieferung nach Hause — alles aus einer Hand.
        </p>
        <p>
          Wir arbeiten ausschliesslich mit lizenzierten Schweizer Ärzten und
          halten uns strikt an das Schweizer Heilmittelgesetz (HMG). Ihre
          Daten bleiben in der Schweiz — und gehen nie an Dritte.
        </p>
      </div>
    </section>

    {/* === Stat block — three small editorial stats === */}
    <section className="px-4 mt-20 md:mt-28">
      <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { stat: "−21 %", label: "Ø Gewichtsverlust nach 68 Wochen" },
          { stat: "10'000+", label: "behandelte Patientinnen und Patienten" },
          { stat: "4.9 / 5", label: "durchschnittliche Patientenbewertung" },
        ].map((s) => (
          <div key={s.stat} className="border-t border-border pt-6">
            <p className="font-editorial text-4xl md:text-5xl mb-3">{s.stat}</p>
            <p className="text-sm text-muted-foreground max-w-xs">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* === Inline CTA back into the survey funnel === */}
    <section className="px-4 mt-20 md:mt-28">
      <div className="container mx-auto max-w-3xl">
        <h2 className="font-editorial text-3xl md:text-5xl leading-[1] mb-6">
          Bereit, herauszufinden ob es passt?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Der Fragebogen dauert 3 Minuten. Sie erhalten innerhalb von 24 Stunden
          eine persönliche Einschätzung von einem Schweizer Arzt.
        </p>
        <Link
          to="/survey/women"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Fragebogen starten <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </PageShell>
);

export default UeberUns;

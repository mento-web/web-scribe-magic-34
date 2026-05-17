import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Rückgabe — return / refund policy page.
   Important: under the Swiss Heilmittelgesetz (HMG), once a verschreibungs­
   pflichtiges Medikament has been dispatched it cannot be returned and
   re-sold. This page makes that limitation explicit and points to support.
   Linked from the footer column "Support".
   ========================================================================= */

const Rueckgabe = () => (
  <PageShell>
    {/* === Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Rückgabe & Erstattung
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          Was Sie wissen<br />sollten.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Aus rechtlichen und hygienischen Gründen können verschreibungs­
          pflichtige Medikamente nach dem Versand in der Schweiz nicht
          zurückgenommen werden. Hier ist, was Sie trotzdem tun können.
        </p>
      </div>
    </section>

    {/* === Policy detail blocks === */}
    <section className="px-4 mt-16">
      <div className="container mx-auto max-w-3xl space-y-10">
        {/* Block 1 — vor Versand */}
        <div className="border-t border-border pt-6">
          <h2 className="font-editorial text-2xl md:text-3xl mb-3">
            Vor dem Versand: 24 Stunden Stornofrist
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Solange Ihr Medikament noch nicht versandt wurde, können Sie Ihre
            Bestellung kostenlos stornieren. Schreiben Sie uns innerhalb von
            24 Stunden nach Bestellung an{" "}
            <a
              href="mailto:support@helvi.ch"
              className="underline underline-offset-4 text-foreground"
            >
              support@helvi.ch
            </a>
            .
          </p>
        </div>

        {/* Block 2 — nach Versand */}
        <div className="border-t border-border pt-6">
          <h2 className="font-editorial text-2xl md:text-3xl mb-3">
            Nach dem Versand: keine Rücknahme möglich
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Gemäss Schweizer Heilmittelgesetz (HMG) und aus Gründen der
            Arzneimittelsicherheit ist eine Rücknahme oder ein Umtausch von
            verschreibungspflichtigen Medikamenten nach dem Versand
            ausgeschlossen — auch bei ungeöffneter Originalverpackung.
          </p>
        </div>

        {/* Block 3 — Beschädigt / falsch geliefert */}
        <div className="border-t border-border pt-6">
          <h2 className="font-editorial text-2xl md:text-3xl mb-3">
            Beschädigte oder falsche Lieferung
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sollte Ihre Lieferung beschädigt sein oder das falsche Produkt
            enthalten, melden Sie sich bitte innerhalb von 48 Stunden bei
            uns. Wir ersetzen die Lieferung kostenlos.
          </p>
        </div>

        {/* Block 4 — Behandlungsabbruch */}
        <div className="border-t border-border pt-6">
          <h2 className="font-editorial text-2xl md:text-3xl mb-3">
            Behandlung abbrechen
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sie können Ihre Behandlung jederzeit ohne Begründung beenden.
            Bereits versandte Medikamente werden nicht erstattet; künftige
            Lieferungen werden ab sofort gestoppt. Bei medizinischen
            Bedenken sprechen Sie bitte zuerst mit Ihrem behandelnden Arzt
            über das Patientenportal.
          </p>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Rueckgabe;

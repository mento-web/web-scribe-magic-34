import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Impressum — legally required for commercial Swiss websites.

   IMPORTANT: this is a placeholder. Before launching with real customers, fill
   in the real Firma, address, UID, MwSt-Nummer, contact, vertretungs-
   berechtigte Personen, and Aufsichtsbehörde for medication retail.
   Linked from the footer column "Legal".
   ========================================================================= */

const Impressum = () => (
  <PageShell>
    {/* === Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Legal
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          Impressum.
        </h1>
        <p className="text-sm text-muted-foreground italic">
          Platzhaltertext — vor dem Launch mit den realen Firmendaten zu
          ersetzen.
        </p>
      </div>
    </section>

    {/* === Definition-list style data === */}
    <section className="px-4 mt-12">
      <div className="container mx-auto max-w-3xl">
        <dl className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-5 gap-x-8 border-t border-border pt-8">
          {[
            ["Firma", "Helvi AG"],
            ["Adresse", "[Strasse Nr.]\n[PLZ] [Ort]\nSchweiz"],
            ["Vertretungsberechtigte Person(en)", "[Vorname Nachname], CEO"],
            ["Handelsregister", "CH-XXX.X.XXX.XXX-X"],
            ["MwSt-Nummer", "CHE-XXX.XXX.XXX MWST"],
            ["E-Mail", "support@helvi.ch"],
            ["Telefon", "+41 XX XXX XX XX"],
            ["Aufsichtsbehörde", "Swissmedic, Hallerstrasse 7, 3012 Bern"],
          ].map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground self-start">
                {label}
              </dt>
              <dd className="text-base leading-relaxed whitespace-pre-line">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

    {/* === Liability note ===
       Standard Swiss-style Haftungsausschluss block. Keep this section even
       after replacing the placeholder address — it's expected on commercial
       Swiss sites. */}
    <section className="px-4 mt-16">
      <div className="container mx-auto max-w-3xl border-t border-border pt-8 space-y-6">
        <div>
          <h2 className="font-editorial text-2xl md:text-3xl mb-3">
            Haftungsausschluss
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt
            erstellt. Trotzdem übernimmt die Helvi AG keine Gewähr für die
            Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten
            Informationen. Die Inhalte ersetzen keine ärztliche Beratung.
          </p>
        </div>
        <div>
          <h2 className="font-editorial text-2xl md:text-3xl mb-3">
            Urheberrechte
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Sämtliche Inhalte dieser Website unterliegen dem Schweizer
            Urheberrecht. Eine Vervielfältigung, Bearbeitung, Verbreitung
            oder kommerzielle Nutzung bedarf der schriftlichen Zustimmung
            der Helvi AG.
          </p>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Impressum;

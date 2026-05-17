import { PageShell } from "@/components/PageShell";

/* ============================================================================
   AGB — Allgemeine Geschäftsbedingungen (placeholder T&Cs).

   IMPORTANT: this is placeholder copy. Before launching with real customers,
   replace the entire body with terms reviewed by a Swiss-qualified lawyer.
   Keep the same section structure / page chrome so the URL stays stable.
   Linked from the footer column "Legal".
   ========================================================================= */

const AGB = () => (
  <PageShell>
    {/* === Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Legal
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          Allgemeine<br />Geschäfts­bedingungen
        </h1>
        <p className="text-sm text-muted-foreground">
          Stand: {new Date().toLocaleDateString("de-CH", { year: "numeric", month: "long" })}
          {" · "}
          <span className="italic">Platzhaltertext — rechtlich noch nicht final.</span>
        </p>
      </div>
    </section>

    {/* === Body — numbered placeholder sections === */}
    <section className="px-4 mt-12">
      <div className="container mx-auto max-w-3xl space-y-10">
        {[
          {
            num: "1",
            title: "Geltungsbereich",
            body: "Diese Allgemeinen Geschäftsbedingungen (AGB) regeln das Verhältnis zwischen der Helvi AG (nachfolgend „helvi") und den Nutzerinnen und Nutzern der Plattform helvi.ch sowie der zugehörigen Dienste.",
          },
          {
            num: "2",
            title: "Leistungen",
            body: "Helvi vermittelt ärztliche Online-Konsultationen mit lizenzierten Schweizer Ärztinnen und Ärzten sowie den Versand verschreibungspflichtiger Medikamente. Die ärztliche Beurteilung liegt ausschliesslich beim behandelnden Arzt; helvi selbst erbringt keine medizinischen Leistungen.",
          },
          {
            num: "3",
            title: "Vertragsschluss",
            body: "Ein Behandlungsvertrag entsteht erst nach positiver ärztlicher Beurteilung und ausdrücklicher Bestätigung durch die Nutzerin oder den Nutzer. Bis dahin ist die Nutzung der Plattform unverbindlich und kostenlos.",
          },
          {
            num: "4",
            title: "Preise und Zahlung",
            body: "Alle Preise verstehen sich in Schweizer Franken (CHF) und beinhalten die gesetzliche Mehrwertsteuer. Die Zahlung erfolgt im Voraus über die auf der Plattform angebotenen Zahlungsmethoden.",
          },
          {
            num: "5",
            title: "Rückgabe und Erstattung",
            body: "Verschreibungspflichtige Medikamente sind gemäss Schweizer Heilmittelgesetz (HMG) nach dem Versand vom Umtausch ausgeschlossen. Details siehe Rückgabe-Seite.",
          },
          {
            num: "6",
            title: "Haftung",
            body: "Helvi haftet im Rahmen der gesetzlichen Bestimmungen. Eine darüber hinausgehende Haftung — insbesondere für entgangenen Gewinn oder Folgeschäden — ist ausgeschlossen, soweit gesetzlich zulässig.",
          },
          {
            num: "7",
            title: "Datenschutz",
            body: "Die Verarbeitung personenbezogener Daten richtet sich nach unserer Datenschutzerklärung. Es gilt das Schweizer Bundesgesetz über den Datenschutz (DSG).",
          },
          {
            num: "8",
            title: "Anwendbares Recht und Gerichtsstand",
            body: "Es gilt ausschliesslich Schweizer Recht. Ausschliesslicher Gerichtsstand ist Zürich, Schweiz, soweit gesetzlich zulässig.",
          },
        ].map((s) => (
          <div key={s.num} className="border-t border-border pt-6">
            <p className="font-editorial text-3xl md:text-4xl mb-3">
              {s.num}. {s.title}
            </p>
            <p className="text-muted-foreground leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  </PageShell>
);

export default AGB;

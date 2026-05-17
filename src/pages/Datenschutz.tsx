import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Datenschutz — privacy policy (placeholder copy under Swiss DSG).

   IMPORTANT: this is placeholder text. Replace with a lawyer-reviewed Swiss
   DSG (and where applicable, EU-DSGVO) compliant policy before going live.
   Linked from the footer column "Legal".
   ========================================================================= */

const Datenschutz = () => (
  <PageShell>
    {/* === Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Legal
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          Datenschutz.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-3">
          Ihre Gesundheitsdaten sind besonders schützenswert. Wir behandeln
          sie entsprechend.
        </p>
        <p className="text-sm text-muted-foreground italic">
          Platzhaltertext — vor dem Launch durch eine Schweizer Anwaltskanzlei
          zu prüfen.
        </p>
      </div>
    </section>

    {/* === Body — numbered placeholder sections === */}
    <section className="px-4 mt-12">
      <div className="container mx-auto max-w-3xl space-y-10">
        {[
          {
            num: "1",
            title: "Verantwortliche Stelle",
            body: "Verantwortlich für die Datenverarbeitung ist die Helvi AG, [Strasse Nr.], [PLZ] [Ort], Schweiz. Kontakt: datenschutz@helvi.ch.",
          },
          {
            num: "2",
            title: "Welche Daten wir erheben",
            body: "Wir erheben (a) Kontaktdaten (Name, E-Mail, Adresse), (b) Gesundheitsdaten aus dem ärztlichen Fragebogen (Grösse, Gewicht, Vorerkrankungen, Medikation), (c) Kommunikation mit dem Behandlungsteam und (d) technische Zugriffsdaten (IP, Browser-User-Agent, Zeitpunkt).",
          },
          {
            num: "3",
            title: "Zweck der Verarbeitung",
            body: "Wir verarbeiten Ihre Daten ausschliesslich für die Vermittlung der ärztlichen Konsultation, den Versand der Medikamente, die Rechnungsstellung sowie die Erfüllung gesetzlicher Aufbewahrungspflichten gemäss HMG.",
          },
          {
            num: "4",
            title: "Weitergabe an Dritte",
            body: "Eine Weitergabe Ihrer Gesundheitsdaten erfolgt nur an die behandelnde Ärztin oder den behandelnden Arzt sowie an die liefernde Apotheke. Eine darüberhinausgehende Weitergabe — insbesondere zu Werbezwecken — findet nicht statt.",
          },
          {
            num: "5",
            title: "Speicherort",
            body: "Alle Gesundheitsdaten werden in der Schweiz gespeichert. Wir nutzen Schweizer Rechenzentren und schweizerische Cloud-Anbieter, soweit möglich.",
          },
          {
            num: "6",
            title: "Ihre Rechte",
            body: "Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Übertragung Ihrer Daten — soweit gesetzliche Aufbewahrungspflichten dem nicht entgegenstehen. Anfragen an datenschutz@helvi.ch werden innerhalb von 30 Tagen beantwortet.",
          },
          {
            num: "7",
            title: "Cookies",
            body: "Wir verwenden technisch notwendige Cookies sowie — mit Ihrer Einwilligung — Cookies zur Reichweitenmessung. Sie können diese Einwilligung jederzeit widerrufen.",
          },
          {
            num: "8",
            title: "Aufsichtsbehörde",
            body: "Bei Beschwerden können Sie sich an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) wenden: edoeb.admin.ch.",
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

export default Datenschutz;

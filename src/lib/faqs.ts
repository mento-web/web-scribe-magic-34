/* ============================================================================
   faqs — shared FAQ entries (German, HMG-aware).

   Used by:
     • src/pages/FAQ.tsx — renders the full list on the dedicated /faq page.
     • src/pages/Index.tsx — slices the first N entries into the compact
       FAQ band on the landing page (between sections 8 and 11). Update the
       order here to change which questions surface on the landing page.

   Keep answers in German with Swiss spelling (Grösse, gemäss, dass) and
   never paraphrase HMG-relevant copy without checking with legal.
   ========================================================================= */

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
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

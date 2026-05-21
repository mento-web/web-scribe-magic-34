/* ============================================================================
   articles — shared Health Guide article placeholders.

   Used by:
     • src/pages/Index.tsx, section 11 ("Wissen, das Sie nutzen können")
     • src/pages/Wissen.tsx, the dedicated Wissen blog index.

   These are stubs until real blog posts exist — each title pairs with a
   pastel tint variable for its gradient thumbnail background. When a real
   blog/CMS is wired up, swap this array for a fetch from that source and
   keep the same shape (or extend it).
   ========================================================================= */

export interface Article {
  // Headline shown on the card
  title: string;
  // Tiny caption under the title ("5 min Lesedauer")
  read: string;
  // CSS-variable name for the thumbnail background (e.g. "var(--tint-lavender)")
  tint: string;
}

export const articles: Article[] = [
  { title: "Wie GLP-1 funktioniert — einfach erklärt", read: "5 min Lesedauer", tint: "var(--tint-lavender)" },
  { title: "Welche Nebenwirkungen sind normal?", read: "4 min Lesedauer", tint: "var(--tint-peach)" },
  { title: "Abnehmen ohne Jojo-Effekt: was Studien zeigen", read: "7 min Lesedauer", tint: "var(--tint-moss)" },
  { title: "Ernährung während der GLP-1 Therapie", read: "6 min Lesedauer", tint: "var(--tint-powder-blue)" },
  { title: "Bewegung als Teil der Behandlung", read: "5 min Lesedauer", tint: "var(--tint-dusty-pink)" },
  { title: "GLP-1 und Versicherung: das müssen Sie wissen", read: "8 min Lesedauer", tint: "var(--tint-taupe)" },
];

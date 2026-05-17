import { SiteHeader } from "@/components/SiteHeader";

/* ============================================================================
   PageShell — shared chrome (header + minimal footer) for content pages.

   Index.tsx keeps its own custom landing-page chrome (utility bar + multi-
   column footer). PageShell is what the secondary German content pages
   wrap themselves in: Über uns, Kontakt, Karriere, Rückgabe, AGB, Datenschutz,
   Impressum, Proteinrechner. Each page only needs to render its own <main>
   content inside.

   Header is the shared SiteHeader (helvi wordmark + Ressourcen dropdown +
   nav links + account icon). Footer is intentionally minimal here — just
   wordmark, copyright, HMG disclaimer — because the rich multi-column footer
   lives only on the landing page.
   ========================================================================= */

interface PageShellProps {
  children: React.ReactNode;
}

export const PageShell = ({ children }: PageShellProps) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    {/* === Sticky header — same shared SiteHeader as the landing page === */}
    <SiteHeader />

    {/* === Page content — each content page renders its own <section>s here === */}
    <main className="flex-1">{children}</main>

    {/* === Minimal footer — wordmark + copyright + the HMG disclaimer ===
       Keep this lean. The big multi-column footer lives only on Index.tsx.
       The HMG line is legally load-bearing — do not paraphrase. */}
    <footer className="border-t border-border mt-20 md:mt-28">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <p className="text-2xl font-bold tracking-tight lowercase">helvi</p>
        <div className="text-xs text-muted-foreground space-y-2 md:text-right max-w-xl">
          <p>© {new Date().getFullYear()} Helvi. Alle Rechte vorbehalten.</p>
          <p>
            Dies ist kein Ersatz für eine ärztliche Beratung. Alle Behandlungen
            erfolgen unter ärztlicher Aufsicht gemäss Schweizer
            Heilmittelgesetz (HMG).
          </p>
        </div>
      </div>
    </footer>
  </div>
);

export default PageShell;

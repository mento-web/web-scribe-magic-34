import { Link } from "react-router-dom";
import { User } from "lucide-react";

/* ============================================================================
   PageShell — shared chrome (header + minimal footer) for content pages.

   Index.tsx keeps its own custom landing-page chrome (utility bar + slim nav +
   multi-column footer). PageShell is what the secondary German content pages
   wrap themselves in: Über uns, Kontakt, Karriere, Rückgabe, AGB, Datenschutz,
   Impressum. Each page only needs to render its own <main> content inside.

   Why a separate shell vs reusing Index.tsx's chrome:
   - These pages don't need the multi-column link grid in the footer; a small
     "wordmark + © + HMG disclaimer" footer is enough and keeps the page calm.
   - These pages don't need the royal-blue utility bar nudge.
   ========================================================================= */

interface PageShellProps {
  children: React.ReactNode;
}

export const PageShell = ({ children }: PageShellProps) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    {/* === Sticky header — same look as the landing page === */}
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-2xl font-bold tracking-tight lowercase">
          helvi
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link
            to="/#bmi-rechner"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            BMI Rechner
          </Link>
          <Link
            to="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Preise
          </Link>
          <Link
            to="/faq"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            FAQ
          </Link>
        </nav>
        <Link
          to="/survey/women"
          aria-label="Konto"
          className="rounded-full p-2 hover:bg-muted transition-colors"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>

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

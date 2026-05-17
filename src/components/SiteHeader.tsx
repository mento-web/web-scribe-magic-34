import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

/* ============================================================================
   SiteHeader — shared sticky nav used on the landing page and every content
   page (Index.tsx + PageShell.tsx).

   Structure (left → right):
     1.  Lowercase "helvi" wordmark (Link to /)
     2.  Centre nav:
           • Ressourcen ▾   — hover dropdown with BMI Rechner + Protein Rechner
           • Wie es funktioniert  — anchor on the landing page
           • Preise         — /pricing
           • FAQ            — /faq
     3.  Right: small auth-aware affordance:
           • signed out → generic User icon linking to /anmelden
           • signed in  → small initial-on-circle linking to /konto

   Why a single shared component:
     - The two former inline Header copies were drifting in subtle ways
       (different anchor styles, slightly different gap values).
     - The Ressourcen dropdown is fiddly enough that we only want it in one
       place. Maintainers should never edit a nav link in two files.
   ========================================================================= */

// Hover-triggered dropdown for the "Ressourcen" nav item.
// Hover opens; mouse-leave on the whole wrapper closes. Click toggles it for
// keyboard / touch users. The dropdown panel is flat (no shadow), generously
// padded, and uses the same rounded-[14px] radius as the rest of the site.
const ResourcesDropdown = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on click-outside (touch / keyboard fallback for non-hover users).
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Ressourcen
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown panel — top-full puts it directly under the button. The
          pt-2 inside the absolute wrapper gives a hover "bridge" so the menu
          doesn't close when the mouse crosses the small gap. */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div
            role="menu"
            className="min-w-[220px] bg-background border border-border rounded-[14px] py-2"
          >
            <Link
              to="/bmi-rechner"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              BMI Rechner
            </Link>
            <Link
              to="/proteinrechner"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Protein Rechner
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Right-hand affordance. Two visual states, both styled as a small circle.
//   • signed out → generic lucide User icon, links to /anmelden
//   • signed in  → user's first initial in the editorial serif, links to /konto
// Initial source mirrors the logic on the Konto page (user_metadata first,
// email local-part as fallback).
const AccountAffordance = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link
        to="/anmelden"
        aria-label="Anmelden"
        className="rounded-full p-2 hover:bg-muted transition-colors"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fn = (meta.first_name as string | undefined) ?? undefined;
  const full = (meta.full_name as string | undefined) ?? undefined;
  const fromEmail = user.email?.split("@")[0] ?? "";
  const initial = (fn ?? full ?? fromEmail).charAt(0).toUpperCase() || "?";

  return (
    <Link
      to="/konto"
      aria-label="Mein Konto"
      className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity"
    >
      <span className="font-editorial text-lg leading-none">{initial}</span>
    </Link>
  );
};

// Single sticky white nav, identical on every page.
export const SiteHeader = () => (
  <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
    <div className="container mx-auto flex items-center justify-between h-16 px-4">
      {/* === Left: helvi wordmark === */}
      <Link to="/" className="text-2xl font-bold tracking-tight lowercase">
        helvi
      </Link>

      {/* === Centre: nav links (desktop only; nav collapses on mobile) === */}
      <nav className="hidden md:flex items-center gap-10">
        <ResourcesDropdown />
        <Link
          to="/#so-funktioniert"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Wie es funktioniert
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

      {/* === Right: auth-aware account affordance === */}
      <AccountAffordance />
    </div>
  </header>
);

export default SiteHeader;

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

/* ============================================================================
   SiteHeader — shared sticky nav used on the landing page and every content
   page (Index.tsx + PageShell.tsx).

   Structure (left → right):
     1.  Lowercase "helvi" wordmark (Link to /)
     2.  Centre nav (desktop only, `hidden md:flex`):
           • Ressourcen ▾   — hover dropdown with BMI Rechner + Protein Rechner
           • Wie es funktioniert  — anchor on the landing page
           • Preise         — /pricing
           • FAQ            — /faq
     3.  Right side:
           • Mobile (`md:hidden`): hamburger that opens MobileNavDrawer +
             the auth affordance.
           • Desktop (`hidden md:flex`): auth affordance only.

   Why a single shared component:
     - The two former inline Header copies were drifting in subtle ways
       (different anchor styles, slightly different gap values).
     - The Ressourcen dropdown and the new mobile drawer are fiddly enough
       that we only want each to exist in one place.

   Mobile-only additions (2026-05): the desktop nav stays exactly as it was
   — the hamburger + Sheet drawer below covers narrow viewports so Ressourcen,
   "Wie es funktioniert", Preise, and FAQ are reachable from the homepage on
   phones (previously only the footer linked them).
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

/* ============================================================================
   MobileNavDrawer — right-side Sheet that mirrors the desktop nav for phones.

   Rendered alongside the AccountAffordance on `< md` viewports. Owns its own
   open/close state. Each row is a large tap target (≥48px) with no hover-only
   styling so touch users get clear `:active` feedback. Closing on link click
   feels native; the Sheet overlay also closes on backdrop tap (Radix default).
   pt-safe / pb-safe / pr-safe keep content clear of the iOS Dynamic Island
   and home indicator on notched iPhones.
   ========================================================================= */
const MobileNavDrawer = () => {
  // Local open state so we can imperatively close after a link tap.
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Hamburger trigger — only visible on mobile. The Sheet primitive
          provides its own SheetTrigger, but using a plain button + onClick
          keeps tap target sizing explicit (h-10 w-10 → 40px). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        className="md:hidden h-10 w-10 -mr-2 flex items-center justify-center rounded-full hover:bg-muted active:opacity-70 transition-opacity"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      <SheetContent
        side="right"
        className="w-[85%] sm:max-w-sm p-0 pt-safe pb-safe pr-safe flex flex-col"
      >
        {/* Title / Description are required for a11y by Radix Dialog; we
            hide them visually but keep them in the accessibility tree. */}
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Hauptnavigation für helvi.ch
        </SheetDescription>

        {/* === Drawer header — wordmark for orientation === */}
        <div className="px-6 pt-6 pb-4">
          <Link
            to="/"
            onClick={close}
            className="text-2xl font-bold tracking-tight lowercase"
          >
            helvi
          </Link>
        </div>

        {/* === Primary nav list === */}
        <nav className="flex-1 overflow-y-auto px-2">
          {/* Ressourcen group — header + two indented children, since the
              desktop dropdown doesn't translate well to a drawer. */}
          <p className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Ressourcen
          </p>
          <Link
            to="/bmi-rechner"
            onClick={close}
            className="block w-full px-4 py-3 text-base text-foreground rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
          >
            BMI Rechner
          </Link>
          <Link
            to="/proteinrechner"
            onClick={close}
            className="block w-full px-4 py-3 text-base text-foreground rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
          >
            Protein Rechner
          </Link>

          {/* Top-level destinations */}
          <div className="mt-4 border-t border-border pt-2">
            <Link
              to="/#so-funktioniert"
              onClick={close}
              className="block w-full px-4 py-3 text-base text-foreground rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
            >
              Wie es funktioniert
            </Link>
            <Link
              to="/pricing"
              onClick={close}
              className="block w-full px-4 py-3 text-base text-foreground rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
            >
              Preise
            </Link>
            <Link
              to="/faq"
              onClick={close}
              className="block w-full px-4 py-3 text-base text-foreground rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
            >
              FAQ
            </Link>
          </div>
        </nav>

        {/* === Drawer footer — auth-aware account row pinned to the bottom === */}
        <div className="border-t border-border px-4 py-4">
          {user ? (
            <Link
              to="/konto"
              onClick={close}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
            >
              <span className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center font-editorial text-lg leading-none">
                {(() => {
                  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
                  const fn = meta.first_name as string | undefined;
                  const full = meta.full_name as string | undefined;
                  const fromEmail = user.email?.split("@")[0] ?? "";
                  return (fn ?? full ?? fromEmail).charAt(0).toUpperCase() || "?";
                })()}
              </span>
              <span className="text-base">Mein Konto</span>
            </Link>
          ) : (
            <Link
              to="/anmelden"
              onClick={close}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted active:opacity-70 transition-opacity"
            >
              <span className="h-9 w-9 rounded-full border border-border flex items-center justify-center">
                <User className="h-4 w-4" />
              </span>
              <span className="text-base">Anmelden</span>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Single sticky white nav, identical on every page.
// pt-safe pads the header against the iPhone Dynamic Island; the value is 0
// on devices without a notch, so desktop / Android layout is unchanged.
export const SiteHeader = () => (
  <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border pt-safe">
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

      {/* === Right: account affordance, plus mobile hamburger ===
          On desktop the account icon sits alone (unchanged from before).
          On mobile we add the hamburger to the right of it so the user's
          thumb has a single tap zone for navigation. */}
      <div className="flex items-center gap-1">
        <AccountAffordance />
        <MobileNavDrawer />
      </div>
    </div>
  </header>
);

export default SiteHeader;

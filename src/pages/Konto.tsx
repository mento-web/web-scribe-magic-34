import { useNavigate } from "react-router-dom";
import { ArrowRight, Pill, Stethoscope, Receipt, Settings } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from "@/lib/auth";

/* ============================================================================
   Konto — patient portal stub.

   First authenticated page a returning patient lands on after sign-in. Today
   it's a welcome screen with four action cards routing to "#" placeholders.
   As real features get built (treatment manager, doctor messaging, billing,
   account settings), wire each card's href to its real route.

   This page is wrapped in <ProtectedRoute> in App.tsx, so it can assume
   `useAuth().user` is non-null. If it weren't, the user would already have
   been redirected to /anmelden by the route guard.
   ========================================================================= */

// Four action cards arranged in a 2×2 grid. Each carries its own pastel tint
// so the row reads as editorial tiles rather than a feature checklist.
const cards = [
  {
    title: "Behandlung verwalten",
    description: "Ihre aktuelle Therapie, Lieferungen und Anpassungen.",
    icon: Pill,
    tint: "hsl(var(--tint-lavender))",
    // stub — wire to real route once the treatment-management page exists
    href: "#",
  },
  {
    title: "Arzt kontaktieren",
    description: "Sicher mit Ihrem behandelnden Arzt schreiben.",
    icon: Stethoscope,
    tint: "hsl(var(--tint-powder-blue))",
    // stub — wire to real messaging surface once it exists
    href: "#",
  },
  {
    title: "Rechnungen",
    description: "Rechnungen, Zahlungsmethoden und Belege.",
    icon: Receipt,
    tint: "hsl(var(--tint-peach))",
    // stub — wire to billing once it exists
    href: "#",
  },
  {
    title: "Konto-Einstellungen",
    description: "E-Mail, Passwort, Datenschutz-Optionen.",
    icon: Settings,
    tint: "hsl(var(--tint-moss))",
    // stub — wire to settings page once it exists
    href: "#",
  },
];

// Extract a display-friendly first name from whatever Supabase has on the user.
// Order of preference: user_metadata.first_name (set during sign-up if we add
// that step later) → user_metadata.full_name first token → email local-part.
const firstNameFor = (user: { email?: string; user_metadata?: Record<string, unknown> } | null): string => {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const fn = meta.first_name as string | undefined;
  if (fn) return fn;
  const full = meta.full_name as string | undefined;
  if (full) return full.split(" ")[0];
  if (user.email) return user.email.split("@")[0];
  return "";
};

const Konto = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const firstName = firstNameFor(user);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <PageShell>
      {/* === Page header — small label + huge editorial greeting === */}
      <section className="px-4 pt-16 pb-12 md:pt-24">
        <div className="container mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Patientenportal
          </p>
          <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-3">
            {firstName ? <>Willkommen, {firstName}.</> : <>Willkommen.</>}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Hier finden Sie alles rund um Ihre Behandlung.
          </p>
        </div>
      </section>

      {/* === Action cards — 2×2 grid, pastel tints, arrow on the right === */}
      <section className="px-4 mt-8">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="group flex items-start gap-4 rounded-[14px] p-6 hover:opacity-90 transition-opacity"
                style={{ background: c.tint }}
              >
                <span className="h-12 w-12 shrink-0 rounded-full bg-background flex items-center justify-center">
                  <c.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="flex-1">
                  <p className="font-medium text-lg leading-snug mb-1">
                    {c.title}
                  </p>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {c.description}
                  </p>
                </div>
                <ArrowRight
                  className="h-5 w-5 mt-1 shrink-0 group-hover:translate-x-1 transition-transform"
                  strokeWidth={2}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* === Sign-out — ghost link, bottom-left of the page === */}
      <section className="px-4 mt-16">
        <div className="container mx-auto max-w-4xl">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Abmelden
          </button>
        </div>
      </section>
    </PageShell>
  );
};

export default Konto;

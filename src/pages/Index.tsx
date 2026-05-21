import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Pill,
  Stethoscope,
  Globe,
  X,
  Leaf,
  Play,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { SiteHeader } from "@/components/SiteHeader";
import { BmiWidget } from "@/components/BmiWidget";
import { EVENTS, track } from "@/lib/tracking";
import { articles } from "@/lib/articles";
import heroProduct from "@/assets/hero-product.jpg";
import glp1Pens from "@/assets/glp1-pens.png";
import djKhaledHero from "@/assets/dj-khaled-hero.png";
// 3D-rendered illustrations for the three secondary CTA tiles. Each ships
// at 512px wide with built-in soft shadows; sit them inside a white well so
// the illustration's own white background blends seamlessly.
import bookIcon from "@/assets/illustrations/book-icon.png";
import checklistIcon from "@/assets/illustrations/checklist-icon.png";
import calculatorIcon from "@/assets/illustrations/calculator-icon.png";
// Peach-toned GLP-1 injection pen — doubles as both the full-bleed
// backdrop for the "20 % verlieren" lifestyle band (section 6) and one
// of the three "100 % online" card photos previously planned for it.
// We now use it only as the section 6 banner; the section 8 "Klinisch
// geprüft" slot uses the doctor portrait instead. Optimised JPEG at
// 1600 px wide (~150 kB).
import injectionPen from "@/assets/injection-pen.jpg";
// Photography for the three "100 % online" feature cards (section 8).
// Each is an optimised JPEG at 1400 px wide (~150–240 kB). Displayed
// inside a rounded inset window, cropped via object-cover so the focal
// subject (parcel handoff, phone screen, doctor at desk) stays centred.
import deliveryPhoto from "@/assets/delivery.jpg";
import appDashboard from "@/assets/app-dashboard.jpg";
import doctorChat from "@/assets/doctor-chat.jpg";

/* ============================================================================
   LANDING PAGE — `/` route

   This is the marketing landing page for helvi. It is one long composed file
   on purpose: the small helper components (BmiWidget, UtilityBar, Header,
   TrustList, PillButton, ArrowCircleButton, GradientArt, AvatarTile) live at
   the top of the file, and the `Index` component at the bottom assembles them
   into the 13 page sections.

   Section order (top to bottom of what the user sees):
     1.  Utility bar          — thin royal-blue strip with "resume visit" link
     2.  Header               — slim sticky nav with helvi wordmark + account
      3.  Hero                 — huge "Gesünder werden mit helvi." + trust list
     4.  Twin hero cards      — lavender GLP-1 pens + DJ Khaled portrait
     5.  Secondary cards      — 3 small tinted CTAs under the twin cards
     6.  Lifestyle band       — full-bleed "20 % verlieren" with glass card
     7.  BMI Rechner          — restyled BMI form (anchor #bmi-rechner)
     8.  Online features      — 3 cards explaining the online flow
     9.  Social proof         — 3×3 member grid + 10'000+ stat + carousel
     10. Expert credibility   — Swiss MD advisor placeholder cards
     11. Health guide         — placeholder article tiles
     12. Final CTA            — "Bereit anzufangen?" with dual gender CTAs
     13. Footer               — multi-column footer + HMG disclaimer

   Every primary CTA routes into the conversion funnel at /survey/women or
   /survey/men. The BMI form navigates to /analyse with query params.
   ========================================================================= */

// (BmiWidget lives in src/components/BmiWidget.tsx — shared with /bmi-rechner.)

// Thin royal-blue strip at the very top of the page. Mimics Ro's
// "resume your online visit" nudge. Dismissible via local state — when the X
// is clicked it disappears for the rest of the session.
const UtilityBar = () => {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="bg-accent text-white text-sm">
      <div className="container mx-auto flex items-center justify-center relative h-9 px-4">
        {/* pr-10 on mobile reserves room for the absolute-positioned X so
            wrapping copy on narrow phones can't slide under the button. */}
        <p className="text-center pr-10 md:pr-0">
          Online-Beratung starten?{" "}
          <Link to="/survey/women" className="underline underline-offset-4 font-medium">
            Los geht's
          </Link>
        </p>
        {/* p-2 -m-2 expands the tap target to ~40px without growing the icon. */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Schliessen"
          className="absolute right-2 p-2 -m-2 opacity-80 hover:opacity-100 active:opacity-60 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// (The sticky nav lives in src/components/SiteHeader.tsx — same instance is
// used on every page so the Ressourcen dropdown only has to exist once.)

// Right column of the hero. Four icon + text bullets that build trust fast:
// who uses helvi, who prescribes, pricing positioning, and onboarding ease.
const TrustList = () => {
  const items = [
    { icon: Check, text: "Von tausenden vertraut für GLP-1" },
    { icon: Pill, text: "Echte Schweizer Ärzte, zugelassene Medikamente" },
    { icon: Stethoscope, text: "Beste GLP-1 Preise — mit oder ohne Versicherung" },
    { icon: Globe, text: "100 % online starten" },
  ];
  return (
    <ul className="space-y-4">
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 shrink-0" strokeWidth={1.5} />
          <span className="text-base leading-snug">{text}</span>
        </li>
      ))}
    </ul>
  );
};

// Reusable rounded-full pill button used as a CTA throughout the page.
// `solid` = black bg / white text (primary), `outline` = transparent / black
// border (secondary), `light` = white bg used over dark photo cards.
// This renders a span so it can be nested inside <Link>.
//
// Hover micro-interaction: the pill stays fully opaque (no fade) and
// instead grows its right padding from 24 px → 32 px, which nudges the
// trailing arrow icon further to the right. The arrow itself also picks
// up a small translate-x so the motion reads as "leaning into" the
// arrow direction rather than just stretching the pill. Targets the
// last child <svg> so text-only callers (no icon) get the padding grow
// without erroring on a missing svg.
const PillButton = ({
  children,
  variant = "solid",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "light";
  className?: string;
}) => {
  const styles = {
    solid: "bg-foreground text-background",
    outline: "bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background",
    light: "bg-white text-foreground",
  }[variant];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 ease-out hover:pr-8 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 [&>svg:last-child]:ease-out hover:[&>svg:last-child]:translate-x-0.5 ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

// Small black circle with a white arrow inside. Used as the trailing
// "go here" icon on the three secondary cards under the twin hero cards.
// Sized 44px on mobile (iOS minimum tap target) and 40px on desktop —
// the desktop value matches the original design exactly.
const ArrowCircleButton = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full h-11 w-11 md:h-10 md:w-10 bg-foreground text-background shrink-0 ${className}`}
  >
    <ArrowRight className="h-4 w-4" />
  </span>
);

// Decorative gradient block that stands in for real photography. Renders a
// soft two-tone gradient with blurred radial blobs on top, and an optional
// foreground glyph + uppercase label. Used in the secondary cards and the
// "100 % online" feature row until real photos are provided.
const GradientArt = ({
  from,
  to,
  glyph,
  label,
}: {
  from: string;
  to: string;
  glyph?: React.ReactNode;
  label?: string;
}) => (
  <div
    className="relative w-full h-full rounded-[12px] overflow-hidden flex items-center justify-center"
    style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
  >
    <div
      className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-50 blur-2xl"
      style={{ background: from }}
    />
    <div
      className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full opacity-40 blur-2xl"
      style={{ background: to }}
    />
    <div className="relative z-10 flex flex-col items-center gap-3 text-foreground/80">
      {glyph}
      {label ? <span className="text-xs font-medium uppercase tracking-wider">{label}</span> : null}
    </div>
  </div>
);

// One tile in the 3×3 member-video grid. Renders the member's initial over a
// soft gradient, a play button overlay on hover, and a name caption with a
// "helvi member" tag. Stands in for real testimonial videos until they exist.
const AvatarTile = ({ name, gradient }: { name: string; gradient: string }) => (
  <div className="relative aspect-[4/5] rounded-[10px] overflow-hidden group cursor-pointer">
    <div className="absolute inset-0" style={{ background: gradient }} />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="font-editorial text-5xl text-white/90">{name.charAt(0)}</span>
    </div>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
      <span className="rounded-full bg-white/95 h-10 w-10 flex items-center justify-center">
        <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
      </span>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
      <p className="text-xs font-semibold text-white">{name}</p>
      <p className="text-[10px] text-white/70">helvi member</p>
    </div>
  </div>
);

/* ============================================================================
   LAUNCH FEATURE FLAGS

   These switches hide entire landing-page sections without removing their
   code. To bring a section back, flip its flag from `false` to `true` and
   redeploy — no other edits needed. The data arrays inside each guarded
   block stay referenced (so TS sees them as "used") even while the section
   is gated off, which keeps the reinstate path truly one-touch.

   Currently hidden:
     • Section 9  (3×3 member grid + 10'000+ stat + testimonial carousel)
     • Section 10 (Swiss MD advisor cards — "Beispielprofile" placeholders)
   ========================================================================= */
const SHOW_MEMBER_GRID = false;
const SHOW_EXPERT_ADVISORS = false;

/* ============================================================================
   Index — the assembled landing page

   Composes the 14 sections in display order. Static data (member names,
   testimonials, article placeholders) is defined inline at the top of the
   component so it's easy to find and edit.
   ========================================================================= */
const Index = () => {
  // 3×3 member-tile grid data. Each name pairs with a soft pastel gradient.
  // When real testimonial videos arrive, swap these for thumbnails.
  const memberNames = [
    { name: "Anna", gradient: "linear-gradient(135deg, #D4C5E8, #B8A5D5)" },
    { name: "Thomas", gradient: "linear-gradient(135deg, #C8D6E5, #9FB4CB)" },
    { name: "Sandra", gradient: "linear-gradient(135deg, #E8C5B8, #D4A89A)" },
    { name: "Marc", gradient: "linear-gradient(135deg, #C9D2BB, #A8B596)" },
    { name: "Lara", gradient: "linear-gradient(135deg, #F5D5C5, #E0B5A0)" },
    { name: "David", gradient: "linear-gradient(135deg, #B5C8D5, #8FA8B8)" },
    { name: "Petra", gradient: "linear-gradient(135deg, #DBC5DC, #B89DBB)" },
    { name: "Stefan", gradient: "linear-gradient(135deg, #D5CFC1, #B5A89A)" },
    { name: "Nina", gradient: "linear-gradient(135deg, #C5D5E0, #98B5C8)" },
  ];

  // Pull-quote carousel under the member grid. German Swiss-city locations.
  const testimonials = [
    { name: "Anna M.", loc: "Zürich", text: "In 3 Monaten 12 kg abgenommen. Die ärztliche Betreuung war ausgezeichnet." },
    { name: "Thomas K.", loc: "Bern", text: "Endlich etwas, das funktioniert. Professionell, diskret, wirksam." },
    { name: "Sandra L.", loc: "Basel", text: "Die Online-Beratung war einfach und angenehm. Ich fühle mich bestens betreut." },
    { name: "Marc B.", loc: "Genf", text: "Nach Jahren des Jojo-Effekts habe ich endlich eine Lösung gefunden, die wirkt." },
    { name: "Lara R.", loc: "Lausanne", text: "Die Lieferung war diskret und schnell. Der Service ist erstklassig." },
  ];

  // Health Guide placeholder articles live in src/lib/articles.ts so the
  // dedicated /wissen page can render the same set. Edit there to add posts.

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* === 1. Utility bar — royal-blue strip at the very top === */}
      <UtilityBar />

      {/* === 2. Header — shared SiteHeader (wordmark + Ressourcen dropdown + nav) === */}
      <SiteHeader />

      {/* === 3. Hero — huge editorial headline on the left, trust list on the right === */}
      <section className="px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container mx-auto">
          {/* items-center so the trust list is vertically centred against the headline */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-8">
              {/* text-[44px] on the smallest phones (≤360px) prevents the
                  serif headline from wrapping awkwardly; everything from sm
                  upward is identical to the previous responsive ladder. */}
              <h1 className="font-editorial text-[44px] sm:text-[56px] md:text-[88px] lg:text-[112px] leading-[0.9] tracking-tight">
                Gesünder werden<br />mit helvi.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-md">
                Ärztlich begleitete Gewichtsreduktion in der Schweiz.
              </p>
            </div>
            <div className="lg:col-span-4">
              <TrustList />
            </div>
          </div>
        </div>
      </section>

      {/* === 4. Twin hero cards — the two big photo CTAs side-by-side ===
         Left card uses the lavender GLP-1 pen shot, right card uses the
         DJ Khaled "helvi" portrait. Both route into the survey funnel. */}
      <section className="px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left card — lavender background + GLP-1 pen product photo */}
            <Link
              to="/survey/women"
              onClick={() => void track(EVENTS.cta_clicked, { cta_id: "hero_twin_women", target: "/survey/women" })}
              className="group relative overflow-hidden rounded-[14px] aspect-[4/3] md:aspect-square active:scale-[0.98] transition-transform"
              style={{ background: "hsl(var(--tint-lavender))" }}
            >
              <img
                src={glp1Pens}
                alt="GLP-1 Injektionspens"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
                <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight max-w-xs drop-shadow-sm">
                  Neue GLP-1<br />Optionen bei helvi
                </h3>
              </div>
              <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10">
                <PillButton>
                  Jetzt starten <ArrowRight className="h-4 w-4" />
                </PillButton>
              </div>
            </Link>
            {/* Right card — powder-blue background + DJ Khaled portrait */}
            <Link
              to="/survey/men"
              onClick={() => void track(EVENTS.cta_clicked, { cta_id: "hero_twin_men", target: "/survey/men" })}
              className="group relative overflow-hidden rounded-[14px] aspect-[4/3] md:aspect-square active:scale-[0.98] transition-transform"
              style={{ background: "hsl(var(--tint-powder-blue))" }}
            >
              <img
                src={djKhaledHero}
                alt="DJ Khaled mit helvi"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
                <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight max-w-xs drop-shadow-sm">
                  Abnehmen mit<br />GLP-1
                </h3>
              </div>
              <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10">
                <PillButton>
                  Jetzt starten <ArrowRight className="h-4 w-4" />
                </PillButton>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* === 5. Secondary cards — three small tinted CTAs under the twin cards ===
         Wissen (blog index), Eignungs-Check (survey funnel entry), and the
         BMI Rechner tool — each a soft tile with a gradient thumbnail, a
         label, and a small circular arrow. Tint positions are unchanged from
         the original three-card composition so the visual rhythm stays put. */}
      <section className="px-4 mt-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                // Editorial entry point — links to the dedicated blog index.
                label: "Wissen",
                tint: "hsl(var(--tint-peach))",
                to: "/wissen",
                from: "#F5D5C5",
                to2: "#E0B5A0",
                illustration: bookIcon,
                alt: "Aufgeschlagenes Buch",
                // Tilt direction on hover. Tailwind needs the full class
                // string to appear as a source-code literal so the compiler
                // includes it — listing both directions here is intentional.
                tilt: "group-hover:-rotate-6",
              },
              {
                // Eligibility hook — short, direct question pointing the
                // visitor straight into the survey funnel (women's flow,
                // matching the rest of the page's default funnel entry).
                label: "Sind Sie geeignet?",
                tint: "hsl(var(--tint-dusty-pink))",
                to: "/survey/women",
                from: "#E8C5B8",
                to2: "#C9A89A",
                illustration: checklistIcon,
                alt: "Klemmbrett mit Checkliste",
                tilt: "group-hover:rotate-6",
              },
              {
                // BMI Rechner tool — already lives at /bmi-rechner.
                label: "BMI Rechner",
                tint: "hsl(var(--tint-moss))",
                to: "/bmi-rechner",
                from: "#C9D2BB",
                to2: "#A8B596",
                illustration: calculatorIcon,
                alt: "Taschenrechner",
                tilt: "group-hover:rotate-6",
              },
            ].map((c) => (
              <Link
                key={c.label}
                to={c.to}
                onClick={() => void track(EVENTS.cta_clicked, { cta_id: `secondary_tile_${c.label}`, target: c.to })}
                className="group flex items-center gap-4 rounded-[12px] p-4 hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ background: c.tint }}
              >
                {/* Gradient backdrop stays static; the illustration floats
                    above it and tilts + scales up on hover for a touch of
                    micro-interaction. Hover is on the outer card group so
                    the whole tile reacts. Scale is kept modest (105%) so
                    the rotated illustration still fits inside the circle
                    without its corners clipping past the rim. Tilt
                    direction comes from `c.tilt` per illustration. */}
                <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden relative">
                  <GradientArt from={c.from} to={c.to2} />
                  <img
                    src={c.illustration}
                    alt={c.alt}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${c.tilt}`}
                  />
                </div>
                <p className="flex-1 text-sm md:text-base font-medium leading-snug text-foreground">
                  {c.label}
                </p>
                {/* Light nudge on card hover — 2 px slide over 500 ms with
                    ease-out, deliberately slower than the illustration tilt
                    so the arrow reads as "settling forward" rather than
                    eagerly leading. */}
                <ArrowCircleButton className="group-hover:translate-x-0.5 transition-transform duration-500 ease-out" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section heading */}
      <section className="mt-20 md:mt-28 px-4">
        <div className="container mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Gewichtsverlust
          </p>
          <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] max-w-xl">
            Verschreibungspflichtige<br />Behandlung. Klinisch geprüft.
          </h2>
        </div>
      </section>

      {/* === 6. Lifestyle band — full-bleed "20 % verlieren" hero with glass card ===
         Soft warm-gradient backdrop standing in for a real lifestyle photo.
         The floating glassmorphic card top-right mimics an in-app progress
         widget ("↓ 3 kg this week"). The tiny grey line at the bottom is the
         clinical-results disclaimer — required, keep it small and present. */}
      <section className="relative mt-10 md:mt-14 px-4">
        <div className="container mx-auto">
          {/* min-h ladder: shorter on tiny phones so the floating "Diese
              Woche" card doesn't get pushed off-screen, restored to the
              original 420 / 520 from sm upward. The skin-texture banner
              sits behind everything else. */}
          <div className="relative rounded-[14px] overflow-hidden min-h-[360px] sm:min-h-[420px] md:min-h-[520px] flex items-center">
            {/* Photo backdrop — covers the band edge-to-edge. Peach-toned
                GLP-1 injection pen photo sits to the right of the band so
                the headline copy on the left has a clean colour field. */}
            <img
              src={injectionPen}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative z-10 p-8 md:p-16 max-w-2xl">
              {/* Black editorial headline reads cleanly against the plain
                  peach backdrop on the left half of the cocoon banner;
                  no overlay or text-shadow needed. */}
              <h2 className="font-editorial text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight text-foreground">
                20 % Ihres<br />Gewichts<br />verlieren — und<br />es halten.
              </h2>
              <div className="mt-8">
                <Link to="/survey/women">
                  <PillButton>
                    Jetzt abnehmen <ArrowRight className="h-4 w-4" />
                  </PillButton>
                </Link>
              </div>
              <p className="mt-8 text-xs text-foreground/60 max-w-md">
                Basiert auf klinischen Studiendaten. Ergebnisse können individuell variieren.
              </p>
            </div>
            <div className="absolute top-8 right-8 md:top-12 md:right-12 bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-background" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Diese Woche</p>
                  <p className="text-lg font-semibold">↓ 3 kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === 7. BMI Rechner — restyled BMI form section ===
         Anchor target for the header's "BMI Rechner" link. Off-white band
         with a serif headline on the left and the light-variant BmiWidget on
         the right. Submitting navigates to /analyse with height/weight/gender
         as query params. */}
      <section id="bmi-rechner" className="mt-20 md:mt-28 px-4 scroll-mt-20">
        <div className="container mx-auto">
          <div className="rounded-[14px] bg-muted p-8 md:p-16">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                  Ihre Prognose
                </p>
                <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">
                  Wie viel können<br />Sie verlieren?
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                  Geben Sie Ihre Daten ein — wir zeigen Ihnen sofort Ihren BMI und Ihre persönliche GLP-1 Gewichtsprognose.
                </p>
              </div>
              <div className="bg-background rounded-2xl p-6 md:p-8">
                <BmiWidget variant="light" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === 8. Online features — three "100 % online" cards ===
         Anchor target for the header's "Wie es funktioniert" link. Each
         card is a tinted band with a short headline up top and a real
         photo in the inset window below — Swiss Post delivery handoff for
         the "schnelle Lieferung" card, a phone showing the helvi app for
         the dashboard card, and a doctor at her desk for the "klinisch
         geprüft" card. */}
      <section id="so-funktioniert" className="mt-20 md:mt-28 px-4 scroll-mt-20">
        <div className="container mx-auto">
          <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-12 max-w-2xl">
            100 % online.<br />100 % bequem.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Schnelle, diskrete Lieferung",
                tint: "hsl(var(--tint-peach))",
                image: deliveryPhoto,
                alt: "Schweizerische Post übergibt Paket an der Haustür",
              },
              {
                title: "Ziele an einem Ort verwalten",
                tint: "hsl(var(--tint-lavender))",
                image: appDashboard,
                alt: "helvi App auf dem Smartphone mit Gewichtsverlauf",
              },
              {
                title: "Klinisch geprüfte Behandlungen",
                tint: "hsl(var(--tint-powder-blue))",
                image: doctorChat,
                alt: "Ärztin am Schreibtisch mit Stethoskop und GLP-1 Pens",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-[14px] overflow-hidden flex flex-col"
                style={{ background: c.tint }}
              >
                <div className="p-6 md:p-8">
                  <h3 className="font-medium text-xl md:text-2xl leading-tight max-w-xs">
                    {c.title}
                  </h3>
                </div>
                {/* Inset photo window — locked to a 3:2 ratio, the native
                    aspect of all three source JPEGs (1400 × 933). That
                    avoids any cropping and guarantees all three photos
                    render at exactly the same size across the row.
                    `mt-auto` pushes the window to the bottom of the card
                    so the photo bases align even when one title wraps to
                    a different number of lines. */}
                <div className="relative aspect-[3/2] mt-auto mx-6 mb-6 rounded-[12px] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 9. Social proof — 3×3 member grid + 10'000+ stat + carousel ===
         Two-column composition. Left: nine "member tiles" (initial + gradient,
         play-button on hover) standing in for real testimonial videos. Right:
         huge serif "10'000+ Mitglieder" stat with a 95 % satisfaction check.
         Below: a centered pull-quote carousel (shadcn Carousel) of 5 quotes.
         Gated behind SHOW_MEMBER_GRID — flip the flag at the top of this
         file to bring the section back. */}
      {SHOW_MEMBER_GRID && (
        <section className="mt-20 md:mt-28 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7">
                <div className="grid grid-cols-3 gap-3">
                  {memberNames.map((m) => (
                    <AvatarTile key={m.name} name={m.name} gradient={m.gradient} />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="flex items-center gap-2 mb-6">
                  <Check className="h-5 w-5" strokeWidth={2} />
                  <p className="text-sm font-medium">95 % bewerten ihre Erfahrung positiv</p>
                </div>
                <h2 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight">
                  10'000+<br />Mitglieder<br />und es werden<br />mehr.
                </h2>
              </div>
            </div>

            {/* Pull-quote carousel — loops through 5 anonymized testimonials */}
            <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
              <Carousel opts={{ loop: true }}>
                <CarouselContent>
                  {testimonials.map((t) => (
                    <CarouselItem key={t.name}>
                      <div className="text-center px-4 md:px-12">
                        <div className="flex justify-center gap-1 mb-6">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                          ))}
                        </div>
                        <p className="font-editorial text-3xl md:text-5xl leading-[1.1] mb-8">
                          «{t.text}»
                        </p>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.loc} · helvi member</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-3 mt-8">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* === 10. Expert credibility — Swiss MD advisors ===
         Three stat blocks at the top (FMH licensing, clinical study weeks,
         Swiss data protection), then three placeholder advisor cards. The
         "Beispielprofile" caption below the cards flags that the names are
         placeholders until real Swiss advisors are confirmed. Gated behind
         SHOW_EXPERT_ADVISORS — flip the flag at the top of this file to
         bring the section back. */}
      {SHOW_EXPERT_ADVISORS && (
        <section className="mt-20 md:mt-28 px-4">
          <div className="container mx-auto">
            <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-14 max-w-3xl">
              Unterstützt von führenden<br />Schweizer Gesundheitsexperten.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                { stat: "FMH", label: "Vom Bund zugelassene Ärzte" },
                { stat: "68 Wo.", label: "Klinisch geprüfte Studien" },
                { stat: "CH", label: "Datenschutz nach Schweizer Standard" },
              ].map((s) => (
                <div key={s.stat} className="border-t border-border pt-6">
                  <p className="font-editorial text-5xl md:text-6xl mb-3">{s.stat}</p>
                  <p className="text-sm text-muted-foreground max-w-xs">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Dr. med. M. Berger",
                  title: "FMH Allgemeine Innere Medizin",
                  affiliation: "Universität Zürich",
                  gradient: "linear-gradient(135deg, #D4C5E8, #B8A5D5)",
                },
                {
                  name: "Dr. med. R. Keller",
                  title: "FMH Endokrinologie",
                  affiliation: "Universitätsspital Bern",
                  gradient: "linear-gradient(135deg, #C8D6E5, #9FB4CB)",
                },
                {
                  name: "Dr. med. N. Wyss",
                  title: "FMH Adipositas-Medizin",
                  affiliation: "Inselspital",
                  gradient: "linear-gradient(135deg, #C9D2BB, #A8B596)",
                },
              ].map((a) => (
                <div key={a.name} className="rounded-[14px] bg-muted p-6 flex gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center" style={{ background: a.gradient }}>
                      <span className="font-editorial text-2xl text-white/90">
                        {a.name.split(" ").slice(-1)[0].charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">{a.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.affiliation}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4">Beispielprofile.</p>
          </div>
        </section>
      )}

      {/* === 11. Health Guide — placeholder article tiles ===
         Six article cards with gradient thumbnails and read-time captions.
         These are stubs (no real blog yet) — wire each card up to a real
         article URL once content exists. */}
      <section className="mt-20 md:mt-28 px-4">
        <div className="container mx-auto">
          <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-12 max-w-2xl">
            Wissen, das Sie<br />nutzen können.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <div key={a.title} className="group cursor-pointer active:scale-[0.98] transition-transform">
                <div
                  className="aspect-[5/3] rounded-[12px] mb-4 overflow-hidden relative"
                  style={{ background: `hsl(${a.tint})` }}
                >
                  <div
                    className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl opacity-60"
                    style={{ background: "rgba(255,255,255,0.4)" }}
                  />
                  <div
                    className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full blur-2xl opacity-50"
                    style={{ background: "rgba(0,0,0,0.05)" }}
                  />
                </div>
                <h3 className="font-medium text-lg leading-snug mb-2 group-hover:underline underline-offset-4">
                  {a.title}
                </h3>
                <p className="text-xs text-muted-foreground">{a.read}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === 12. Final CTA — "Bereit anzufangen?" band ===
         Last push before the footer. Off-white tinted block with a serif
         headline and two pill buttons (Frauen / Männer) routing to the
         survey funnel — same destinations as the hero CTAs. */}
      <section className="mt-20 md:mt-28 px-4">
        <div className="container mx-auto">
          <div className="rounded-[14px] bg-muted py-16 md:py-24 px-8 text-center">
            <h2 className="font-editorial text-5xl md:text-7xl leading-[0.95] mb-6">
              Bereit anzufangen?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              In 3 Minuten wissen Sie, ob GLP-1 für Sie geeignet ist.
            </p>
            {/* On mobile both pills stretch full-width and stack; from sm
                upward they shrink back to the original 208px side-by-side
                pair so the desktop composition is untouched. The Link wraps
                need w-full sm:w-auto so the PillButton width actually fills
                the available space on phones. */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/survey/women" className="w-full sm:w-auto">
                <PillButton variant="solid" className="w-full sm:w-52 justify-center">
                  Für Frauen <ArrowRight className="h-4 w-4" />
                </PillButton>
              </Link>
              <Link to="/survey/men" className="w-full sm:w-auto">
                <PillButton variant="outline" className="w-full sm:w-52 justify-center">
                  Für Männer <ArrowRight className="h-4 w-4" />
                </PillButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === 13. Footer — multi-column nav + Swiss HMG legal disclaimer ===
         Five-column link grid (Behandlung / Über helvi / Support / Tools /
         Legal) plus the helvi wordmark column on the left. The HMG line at
         the bottom is legally load-bearing — do not paraphrase or remove. */}
      {/* pb-safe pads the footer above the iPhone home indicator; the env
          value is 0 on non-notched devices, so desktop spacing is unchanged. */}
      <footer className="mt-20 md:mt-28 border-t border-border pb-safe">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <p className="text-2xl font-bold tracking-tight lowercase mb-3">helvi</p>
              <p className="text-xs text-muted-foreground max-w-[16ch]">
                Ärztlich begleitete Gewichtstherapie in der Schweiz.
              </p>
            </div>
            {[
              { title: "Behandlung", links: [["Gewichtsverlust", "/survey/women"]] },
              {
                title: "Über helvi",
                links: [
                  ["Über uns", "/ueber-uns"],
                  ["Kontakt", "/kontakt"],
                  ["Karriere", "/karriere"],
                ],
              },
              {
                title: "Support",
                links: [
                  ["FAQ", "/faq"],
                  ["Preise", "/pricing"],
                  ["Rückgabe", "/rueckgabe"],
                ],
              },
              {
                title: "Tools",
                links: [
                  ["BMI-Rechner", "/bmi-rechner"],
                  ["Protein Rechner", "/proteinrechner"],
                ],
              },
              {
                title: "Legal",
                links: [
                  ["AGB", "/agb"],
                  ["Datenschutz", "/datenschutz"],
                  ["Impressum", "/impressum"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith("/") || href.startsWith("#") ? (
                        <Link
                          to={href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">{label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Helvi. Alle Rechte vorbehalten.</p>
            <p className="md:text-right max-w-xl">
              Dies ist kein Ersatz für eine ärztliche Beratung. Alle Behandlungen erfolgen unter
              ärztlicher Aufsicht gemäss Schweizer Heilmittelgesetz (HMG).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

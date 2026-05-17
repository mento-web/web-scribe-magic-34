# DESIGN.md — Helvi design philosophy

> Modelled on Ro (ro.co). This is the source of truth for visual, typographic,
> and interaction decisions on the helvi landing page.
> Read alongside [CLAUDE.md](./CLAUDE.md).

---

## 1. North star

Helvi presents itself as a **premium, modern telehealth brand with a clean
editorial aesthetic** — closer to Aesop or Glossier than to a pharmacy. The
design balances clinical credibility with warm, approachable imagery, leaning
heavily on whitespace, oversized typography, and large lifestyle photography.
The tone is confident, minimalist, and conversion-focused without being
aggressive.

**Helvi diverges from Ro in three explicit ways:**

- Single product (GLP-1 weight loss) — no multi-category mega menu.
- Swiss-German content — Swiss spelling (`Grösse`, `gemäss`), HMG legal copy.
- Photography is mostly substituted by CSS gradient art until real photos
  exist (see §20 backlog).

---

## 2. Colour palette

The palette is restrained and sophisticated.

- **Background:** predominantly white (`--background`), with off-white sectional
  bands (`bg-muted`, `--muted: 40 25% 96%`).
- **Royal blue** is reserved for the top utility bar only
  (`--accent: 230 70% 56%`). It is not used as a general primary colour.
- **Near-black** for body text and CTA buttons (`--foreground: 0 0% 7%`).
- **Soft pastels** are used as photographic backdrops in product tiles and
  feature cards. Each tile gets its own subtly tinted card background so the
  page has visual variety without breaking the calm overall feel.

### Pastel tints (defined in `src/index.css` + `tailwind.config.ts`)

| Token | Hex-ish | Used for |
|---|---|---|
| `--tint-lavender` | dusty lavender | Twin hero card (left), lavender feature card |
| `--tint-powder-blue` | powder blue | Twin hero card (right), shield feature card |
| `--tint-peach` | warm peach | Insurance secondary CTA, chat feature card |
| `--tint-dusty-pink` | dusty pink | Khaled-journey secondary CTA |
| `--tint-moss` | mossy green | Pricing secondary CTA |
| `--tint-taupe` | warm taupe | (Was the product-showcase backdrop; currently unused) |

### Buttons

- **Primary:** solid black pill (`PillButton variant="solid"`).
- **Secondary:** transparent with dark border (`variant="outline"`).
- **On-photo:** white pill on dark backgrounds (`variant="light"`).
- All buttons are universally `rounded-full`.

---

## 3. Typography

The signature is the **contrast between huge editorial headlines and small,
precise body copy**.

- **Headlines:** `Instrument Serif`, exposed via the **`font-editorial`**
  utility class in `src/index.css`. Sizes 60–112 px on hero, 36–60 px on
  section heads. Tight tracking (`tracking-tight leading-[0.95]`).
  Weight stays thin–regular — **never bold, never shouting**.
- **Body, nav, buttons, small labels:** `DM Sans`.
- **Category labels** above sections appear in small uppercase, tracked-out
  type — `text-xs font-semibold uppercase tracking-[0.18em]` (e.g.
  "GEWICHTSVERLUST", "AUF LAGER").
- Numerals look beautiful in the editorial serif. Stats like
  `10'000+`, `−21%`, `68 Wo.`, `FMH` are intentionally rendered that way.

---

## 4. Top utility bar

- Thin (~36 px) royal-blue strip at the very top, centred white text.
- Returning-visitor nudge: **"Online-Beratung fortsetzen? Weiter"** with an
  underlined link.
- Small dismissible × on the right (session-only local state).
- **Implementation:** `UtilityBar` component in `src/pages/Index.tsx`.

---

## 5. Primary navigation

Directly below the utility bar sits the main header on white.

- Lowercase `helvi` wordmark anchors the left in near-black.
- Centre: flat text links — `BMI Rechner`, `Wie es funktioniert`, `Preise`,
  `FAQ`. DM Sans, small, muted, hover → foreground.
- Right: minimal account icon (lucide `User`).
- **No drop shadows, no borders** — only generous spacing.
- **Implementation:** `Header` component in `src/pages/Index.tsx`.
- **Helvi diverges from Ro:** no mega-menu, no category dropdowns. Helvi
  offers only one product line, so the nav stays minimal and editorial. If
  helvi ever expands beyond GLP-1, revisit Ro's mega-menu pattern.

---

## 6. Hero

The hero is **asymmetric**.

- **Left ~8 cols:** oversized editorial headline ("Gesünder mit helvi.")
  dominates. Below, a short DM Sans paragraph as supporting copy.
- **Right ~4 cols:** vertical trust list (`TrustList`) with small lucide icons
  — `Check`, `Pill`, `Stethoscope`, `Globe`. Trust signals mirror Ro's pattern:
  who uses it, who prescribes, pricing positioning, onboarding ease.

---

## 7. Twin hero cards

Below the headline are **two large side-by-side cards with pastel backgrounds
and product photography**.

- Side-by-side `grid-cols-1 md:grid-cols-2`, large rounded corners
  (14 px / `--radius`).
- **Left card** — lavender backdrop (`--tint-lavender`), GLP-1 pen product
  shot. White text upper-left ("Neue GLP-1 Optionen bei helvi"). Black pill
  CTA lower-right ("Jetzt starten →") routing to `/survey/women`.
- **Right card** — powder-blue backdrop (`--tint-powder-blue`), DJ Khaled
  portrait with a giant white "helvi" wordmark behind him. Same CTA pattern
  routing to `/survey/men`.
- Subtle 2 % hover scale on the image inside each card.

---

## 8. Secondary cards row

Beneath the twin cards are **three smaller secondary tiles** with tinted
backgrounds.

- Layout: `grid-cols-1 md:grid-cols-3 gap-4`.
- Each tile: small `GradientArt` thumbnail on the left, label in the middle,
  `ArrowCircleButton` (small black circle with white arrow) on the right.
- Helvi labels:
  - "Kostenloser Versicherungs-Check" (peach tint)
  - "DJ Khaleds Helvi-Reise" (dusty pink tint)
  - "GLP-1 zum besten Preis" (moss tint)

---

## 9. Full-bleed lifestyle band

Ro uses a full-bleed lifestyle photograph (close-up of a glass of water with
skin in the background). Helvi currently substitutes a layered radial CSS
gradient (warm cream → blush) standing in for soft-focus skin lighting.

- Enormous serif overlay headline:
  > **20 % Ihres Gewichts verlieren — und es halten.**
- Black pill CTA below ("Jetzt abnehmen →").
- **Floating glassmorphic card** top-right with a leaf icon and "↓ 3 kg",
  suggesting in-app progress tracking.
- Tiny grey clinical-results disclaimer near the bottom — keep small and
  present:
  > *Basiert auf klinischen Studiendaten. Ergebnisse können individuell variieren.*

---

## 10. Product / treatment section (currently removed)

Ro shows a horizontal product carousel. Helvi previously had a single-product
showcase card for Semaglutid that was **removed via Lovable** — see commit
`81965de`. **Reserved slot** between §9 and §11.

If reinstated, follow Ro's tile pattern:

- Muted-tone backdrop (likely `--tint-taupe`).
- Status badge top-left ("Auf Lager", "Neu", etc.).
- Product name in `font-editorial`.
- Generic-name subtitle in DM Sans ("semaglutide").
- Two pill CTAs side-by-side: solid black "Jetzt starten" + outline "Mehr erfahren".
- Small grey "Wichtige Sicherheitsinformationen" link below the card for
  regulatory compliance.

**Helvi diverges from Ro:** only one product → no carousel, just a single
showcase card.

---

## 11. BMI Rechner / online flow (helvi-specific)

Replaces Ro's prescription-treatments hub with helvi's conversion mechanic:
the BMI calculator that funnels into `/survey/:gender` → `/analyse`.

- Off-white band (`bg-muted`), `rounded-[14px]`.
- Two columns: editorial serif headline + paragraph on the left, BMI form on
  the right.
- **`BmiWidget` component** has `light` and `dark` variants — same form, two
  skins. Selects gender, takes height (cm) + weight (kg), navigates to
  `/analyse?height=&weight=&gender=`.

---

## 12. "100 % online" feature row

Three horizontal cards under the editorial headline "100 % online. 100 % bequem."

- Each card: tinted background + `GradientArt` block with a foreground glyph.
- Glyphs / themes:
  - "Mit Ihrem Arzt 24/7 chatten" — `MessageCircle` on peach.
  - "Ziele an einem Ort verwalten" — `LayoutDashboard` on lavender.
  - "Klinisch geprüfte, zugelassene Behandlungen" — `ShieldCheck` on powder blue.
- These are placeholders for the eventual screenshots / illustrations.

---

## 13. Social proof

Two-column composition (`lg:grid-cols-12`):

- **Left 7 cols:** 3×3 member-tile grid. Each tile (`AvatarTile`) renders the
  member's initial over a soft pastel gradient, with a play-button hover
  overlay and a "helvi member" caption — stand-ins until real testimonial
  videos exist.
- **Right 5 cols:** huge serif statistic "10'000+ Mitglieder und es werden mehr."
  prefaced by a smaller check-stat "✓ 95 % bewerten ihre Erfahrung positiv".

Below: a **pull-quote testimonial carousel** (shadcn `Carousel`) with 5 quotes.
Each slide: star row, big serif pull-quote, small "Name · Ort · helvi member"
caption.

---

## 14. Expert credibility

Section headline: "Unterstützt von führenden Schweizer Gesundheitsexperten."

- Three stat blocks at the top:
  - **FMH** — Vom Bund zugelassene Ärzte.
  - **68 Wo.** — Klinisch geprüfte Studien.
  - **CH** — Datenschutz nach Schweizer Standard.
- Three advisor cards beneath with an initial-on-gradient avatar, the doctor's
  name, FMH specialty, and institutional affiliation
  (Universität Zürich, Universitätsspital Bern, Inselspital).
- Flagged "Beispielprofile" — these are placeholders until real Swiss advisors
  are confirmed.

---

## 15. Health Guide

Editorial article tile grid (`grid-cols-1 md:grid-cols-3`), positioning helvi
as an authoritative health publisher, not just a retailer.

- Each card: gradient thumbnail (no photo needed), article title, and
  "X min Lesedauer" caption.
- Currently stubs — wire each card up to a real article URL when content
  exists.

Sample titles already in place: "Wie GLP-1 funktioniert — einfach erklärt",
"Welche Nebenwirkungen sind normal?", "Abnehmen ohne Jojo-Effekt: was Studien
zeigen".

---

## 16. Final CTA + Footer

- **Final CTA band** (off-white): serif "Bereit anzufangen?" + paragraph +
  two pill CTAs (Frauen / Männer) — same destinations as the hero CTAs.
- **Footer**: multi-column white footer with link columns —
  Behandlung, Über helvi, Support, Tools, Legal — plus the helvi wordmark
  column on the left.
- The HMG line in the bottom row is **legally load-bearing**:
  > *Dies ist kein Ersatz für eine ärztliche Beratung. Alle Behandlungen
  > erfolgen unter ärztlicher Aufsicht gemäss Schweizer Heilmittelgesetz (HMG).*
- Do not paraphrase, shorten, or remove this text.

---

## 17. Interaction & micro-UX rules

- **Buttons:** universally rounded full (pill shape).
- **Arrow icons** inside small black circles signal navigation (`ArrowCircleButton`).
- **Cards:** 12–16 px corner radius (`--radius` is 14 px). No harsh borders or
  shadows.
- **Section spacing:** 100–160 px vertical padding between sections on desktop
  (`mt-20 md:mt-28`). The scroll should feel paced and intentional.
- **Imagery** (when used): studio-quality, art-directed, emotionally warm —
  diverse people in soft, natural lighting.
- **Compliance microcopy** (safety disclaimers, "Wichtige Sicherheits­
  informationen" links, off-label disclosures) is always present but visually
  de-emphasised in small grey type.
- **Hover:** subtle ~2 % scale on photo cards; horizontal `translate-x-1` on
  arrow icons.

---

## 18. UX principles

- **Conversion-optimised but never pushy.** Every section ends with a path
  back to `/survey/women` or `/survey/men` — the same onboarding visit.
- **Trust is built in layers**: credentialed advisors → member counts →
  testimonials → product photography → editorial health writing.
- The overall effect is **luxurious, scientific, and confidence-inspiring** —
  closer to Aesop or Glossier than to a pharmacy.

---

## 19. The recipe (for replicating / extending)

If you're adding a new section or page, use this checklist:

- Very large editorial **serif headlines** (`font-editorial`).
- **Pastel-tinted product / feature cards** with single-object studio
  photography (or `GradientArt` as fallback).
- **Solid black pill CTAs** (`PillButton variant="solid"`).
- **Generous whitespace** — `mt-20 md:mt-28` between sections.
- **Thin coloured utility bar** up top (only the royal-blue one, don't repeat).
- **Modular horizontal carousels** for products and testimonials
  (shadcn `Carousel`).
- **Trust signals**: credentialed advisors, member counts, regulatory
  references.
- **Compliance microcopy** under any product / treatment claim.

---

## 20. Backlog (Ro patterns helvi could adopt later)

Currently substituted or deferred:

- **Real lifestyle photography** for §9 (full-bleed band) and §12 (online
  feature row) — currently CSS gradients.
- **Real member testimonial videos** for §13 — currently initial-on-gradient
  tiles.
- **Real Swiss medical advisor portraits** for §14 — currently initial
  avatars; names flagged "Beispielprofile".
- **Real health-guide articles** for §15 — currently stubs.
- **Reinstated product showcase** (§10) — once decided whether single card or
  small carousel is right.
- **Mega-menu navigation** — only if helvi ever expands beyond GLP-1.

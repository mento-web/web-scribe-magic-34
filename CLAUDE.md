# CLAUDE.md — Helvi project guide

> This file is auto-loaded by Claude Code into every conversation in this repo.
> Keep it short, durable, and focused on what's easy to get wrong.
>
> **See also: [DESIGN.md](./DESIGN.md)** — the design philosophy
> (Ro-inspired editorial telehealth aesthetic), the palette and typography
> rules, and the section-by-section design intent for `src/pages/Index.tsx`.

---

## 1. What this project is

**Helvi** is a Swiss telemedicine landing page and conversion funnel for
medically-supervised **GLP-1 weight loss therapy** (Semaglutid). The site
guides German-speaking visitors from "Healthier on helvi" hero → BMI check →
gender-specific eligibility survey → analysis → pricing.

- Brand wordmark is always lowercase: `helvi`.
- Site copy is **German (Swiss High-German conventions)** — `Grösse` not
  `Größe`, `gemäss` not `gemäß`, `dass` not `daß`.
- Hosted on **Lovable** at `web-scribe-magic-34.lovable.app`.
- GitHub: `mento-web/web-scribe-magic-34`.

---

## 2. Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS + shadcn/ui** (primitives live in `src/components/ui/`)
- **React Router v6**, **TanStack Query v5**, **React Hook Form + Zod**
- **Supabase** (auth + DB) — auto-generated client
- `lucide-react` (icons), `Recharts` (charts), `embla-carousel-react` (carousels)

---

## 3. Commands

```bash
npm run dev         # Vite dev server on port 8080
npm run build       # production build
npm run build:dev   # dev-mode build (keeps the Lovable tagger plugin)
npm run lint        # ESLint
npm test            # Vitest (no test suite yet — exits clean)
```

**Package manager:** `bun.lockb` is authoritative; `package-lock.json` is also
checked in. `npm` works locally; Lovable's CI uses Bun. Either is fine.

---

## 4. Imports & paths

- `@/` alias maps to `./src/` (configured in `vite.config.ts` and
  `tsconfig.json`).
- Always use `@/components/...`, `@/assets/...`, `@/lib/...`, `@/hooks/...`.
  Never relative `../../`.

---

## 5. Routes

| Route                | Page file                  | Notes |
|----------------------|----------------------------|-------|
| `/`                  | `src/pages/Index.tsx`      | Landing page (the big one) |
| `/survey/:gender`    | `src/pages/Survey.tsx`     | `:gender` is `women` or `men` |
| `/analyse`           | `src/pages/Analyse.tsx`    | Reads `?height=&weight=&gender=` |
| `/pricing`           | `src/pages/Pricing.tsx`    | |
| `/faq`               | `src/pages/FAQ.tsx`        | |
| `*`                  | `src/pages/NotFound.tsx`   | 404 |

**Conversion funnel:** every primary CTA on the landing page routes to
`/survey/women` or `/survey/men`. Preserve this when editing — it's the only
path to revenue.

---

## 6. Design system — the dual-write footgun

Theme tokens live in **two** places that must stay in sync:

1. **CSS variables** in `src/index.css` under `:root`
   (`--background`, `--foreground`, `--muted`, `--accent`, `--tint-lavender`, …).
2. **Tailwind color aliases** in `tailwind.config.ts` under
   `theme.extend.colors`.

**Adding a new color requires editing both files.** Otherwise the Tailwind
class won't compile or the CSS variable won't resolve.

### Pastel card tints

```
--tint-lavender · --tint-powder-blue · --tint-dusty-pink
--tint-taupe    · --tint-moss        · --tint-peach
```

Used in `Index.tsx` via inline `style={{ background: "hsl(var(--tint-X))" }}`.
Search for existing usage before inventing a new tint.

### Fonts

- **DM Sans** — body, nav, buttons, small labels.
- **Instrument Serif** — large editorial headlines. Apply via the
  `font-editorial` utility class defined at the bottom of `src/index.css`.

---

## 7. Domain content rules — German + Swiss HMG

- All user-facing copy is German. Use **Swiss spelling**:
  `Grösse` (not `Größe`), `gemäss`, `dass`.
- The **HMG disclaimer** at the bottom of `src/pages/Index.tsx` and inside
  `Survey.tsx` is **legally load-bearing** under the Swiss Heilmittelgesetz.
  Do **not** paraphrase, shorten, or remove this text:

  > *Dies ist kein Ersatz für eine ärztliche Beratung. Alle Behandlungen
  > erfolgen unter ärztlicher Aufsicht gemäss Schweizer
  > Heilmittelgesetz (HMG).*

- "Wichtige Sicherheitsinformationen" microcopy links are intentional and
  visually de-emphasized but must remain present.

---

## 8. Supabase

- Client at `src/integrations/supabase/client.ts` is **auto-generated**.
  Do not hand-edit; regenerate via the Supabase CLI if the schema changes.
- Types at `src/integrations/supabase/types.ts` are also auto-generated.
- Env vars used (defined in a `.env` you do not commit):
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_URL`
- Supabase project ID: `ouhzawtnqxuaqdyzzscv`.
- Migrations and edge functions (if any) live in `/supabase/`.

---

## 9. Lovable workflow

- Pushing commits to `origin/main` triggers **Lovable** to rebuild the site at
  `web-scribe-magic-34.lovable.app`. There is no separate deploy step.
- `vite.config.ts` registers a dev-only `lovable-tagger` plugin that tags
  components for the Lovable visual editor. It is stripped from production
  builds. **Don't remove it.**
- No GitHub Actions, no husky pre-commit hooks. All CI/CD is on Lovable's side.

---

## 10. Code style — heavy English signposting (load-bearing)

The maintainer reads code primarily through its comments, not its symbols.
**Always signpost generously** in any file you touch:

- Put a `/* === Section name === */` banner between logical regions.
- Above every component, function, or non-trivial JSX block, write **one short
  English line** describing what it is or why it exists.
- Inside long JSX, sprinkle `{/* … */}` annotations for non-obvious markup
  ("dismissible blue strip", "floating glassmorphic progress card").
- Tone: factual and intent-focused. Describe what a section is *for*, not
  what each line does line-by-line.
- Skip trivial code — `setState`, simple props, obvious JSX don't need it.

**This rule overrides the usual "no comments unless WHY is non-obvious"
default.** For this project, the answer is always: yes, comment it.

---

## 11. Other conventions

- Keep landing-page sections inline in `src/pages/Index.tsx` unless reused
  elsewhere. The project favors one large composed page over deep abstraction.
- New shadcn primitives → drop into `src/components/ui/` via
  `npx shadcn add <component>`. Don't hand-edit the existing ones.
- Reusable, non-primitive UI → `src/components/`.
- Hooks → `src/hooks/`. Pure utilities → `src/lib/`.

---

## 12. Known footguns

- **`src/pages/Index.tsx` is intentionally long (~850 lines).** `BmiWidget`
  and other small components are defined inline at the top. Edit in place;
  don't split into separate files unless explicitly asked.
- **Tailwind `tint.*` colors vs. inline `hsl(var(--tint-X))`** — both forms
  exist in the codebase. Match the surrounding style; don't migrate
  wholesale.
- **`npm test` exits clean** because there's no test suite yet. Don't claim
  "tests pass" as verification — it proves nothing.
- **Auto-generated Supabase files** will overwrite hand edits next regen.
- **shadcn primitives under `src/components/ui/`** are vendored — they may be
  regenerated by the shadcn CLI. Wrap them with your own component instead of
  editing in place.

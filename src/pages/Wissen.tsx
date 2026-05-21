import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { articles } from "@/lib/articles";

/* ============================================================================
   Wissen — dedicated Health Guide / blog index page.

   Mirrors the article tiles that appear in section 11 of the landing page
   ("Wissen, das Sie nutzen können."), but as a full-page experience with the
   shared SiteHeader / PageShell chrome. Reached from the "Wissen" secondary
   card on the landing page; also the long-term home for individual blog posts
   once those exist (slug-routed children to be added under /wissen/:slug).

   The article data is imported from src/lib/articles.ts so the landing page
   and this page can never drift apart. Visual language follows DESIGN.md —
   huge editorial serif headline, generous whitespace, pastel-tinted thumbnails
   instead of stock photography.
   ========================================================================= */

// Single article tile. Same visual treatment as the landing-page Health Guide
// section so visitors recognise the cards when they land here from the
// "Wissen" secondary CTA. Whole tile is tappable with an `active:scale-[0.98]`
// micro-press for touch feedback (mobile parity with the rest of the site).
const ArticleTile = ({
  title,
  read,
  tint,
}: {
  title: string;
  read: string;
  tint: string;
}) => (
  <div className="group cursor-pointer active:scale-[0.98] transition-transform">
    {/* Gradient thumbnail stand-in for the eventual hero image. The two
        blurred radial blobs add depth without needing real photography. */}
    <div
      className="aspect-[5/3] rounded-[12px] mb-4 overflow-hidden relative"
      style={{ background: `hsl(${tint})` }}
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
      {title}
    </h3>
    <p className="text-xs text-muted-foreground">{read}</p>
  </div>
);

// Page component — sections in display order: page header, article grid,
// closing CTA band back to the survey funnel.
const Wissen = () => (
  <PageShell>
    {/* === Page header — small uppercase label + editorial serif headline === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Wissen
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight mb-6">
          Wissen, das Sie<br />nutzen können.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl">
          Artikel, Erklärungen und Studien rund um GLP-1, Gewichtsreduktion und
          Gesundheit — von unserem Schweizer Ärzteteam aufbereitet.
        </p>
      </div>
    </section>

    {/* === Article grid — same tile design as the landing-page Health Guide === */}
    <section className="px-4 mt-8 md:mt-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {articles.map((a) => (
            <ArticleTile key={a.title} title={a.title} read={a.read} tint={a.tint} />
          ))}
        </div>
      </div>
    </section>

    {/* === Closing CTA — soft band funnelling readers back into the survey ===
       Mirrors the "Bereit anzufangen?" pattern from the landing page so the
       conversion path stays unbroken even from the editorial side of the site. */}
    <section className="mt-20 md:mt-28 px-4">
      <div className="container mx-auto">
        <div className="rounded-[14px] bg-muted py-16 md:py-24 px-8 text-center">
          <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-6">
            Bereit anzufangen?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            In 3 Minuten wissen Sie, ob GLP-1 für Sie geeignet ist.
          </p>
          {/* Same responsive pill pattern as Index.tsx — full-width stacked on
              mobile, side-by-side 208px from sm upward. */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/survey/women" className="w-full sm:w-auto">
              <span className="inline-flex w-full sm:w-52 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity">
                Für Frauen <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link to="/survey/men" className="w-full sm:w-auto">
              <span className="inline-flex w-full sm:w-52 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background transition-colors">
                Für Männer <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PageShell>
);

export default Wissen;

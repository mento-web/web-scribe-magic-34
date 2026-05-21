import * as React from "react";

/* ============================================================================
   PillButton — Helvi's canonical rounded-full CTA pill

   Shared by `Index.tsx`, `Wissen.tsx`, and anywhere the marketing surface
   needs a rounded-full call-to-action. Renders a <span> so it can be nested
   inside <Link> without producing nested-anchor markup.

   Variants
     • `solid`   — black background / white text. Primary CTA.
     • `outline` — transparent / black border. Secondary CTA.
     • `light`   — white background / black text. For use over dark photo
       cards where the solid variant would disappear into the background.

   Hover micro-interaction (consistent with the shadcn Button primitive
   override in `ui/button.tsx`)
     • No opacity fade — the pill stays fully opaque.
     • Right padding grows from 24 px → 32 px, leaning the pill toward
       the arrow side. PillButton's left-aligned shape supports this
       asymmetric grow cleanly; the shadcn Button primitive (which uses
       `justify-center`) uses a small `scale-[1.02]` instead.
     • Trailing <svg> child translates +2 px right, so the arrow leads
       the motion. Targets `:last-child` so text-only pills (no icon)
       still grow without erroring on a missing svg.
     • 200 ms ease-out, the standard duration for primary CTAs.
   ========================================================================= */
export const PillButton = ({
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
    outline:
      "bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-background",
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

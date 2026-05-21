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

   Hover micro-interaction (identical to the shadcn Button primitive
   override in `ui/button.tsx` so every black CTA on the site reacts
   the same way regardless of which component renders it)
     • No opacity fade — the pill stays fully opaque.
     • `hover:scale-[1.02]` — the pill grows uniformly by 2 %. Earlier
       iterations grew the right padding asymmetrically, but that broke
       down on fixed-width centered pills (`w-52 justify-center`) where
       the centered content just shifted left instead of the pill
       leaning right. Uniform scale works for every width and alignment
       combination on the site.
     • `active:scale-[0.98]` — small press-down on tap/click so touch
       devices get the same tactile feedback hover gives the desktop.
     • Trailing <svg> child translates +2 px right, so the arrow still
       carries a directional cue on top of the scale. Targets
       `:last-child` so text-only pills (no icon) animate the scale
       without erroring on a missing svg.
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
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-200 [&>svg:last-child]:ease-out hover:[&>svg:last-child]:translate-x-0.5 ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

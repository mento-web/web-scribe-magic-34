import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EVENTS, track } from "@/lib/tracking";

/* ============================================================================
   BmiWidget — height + weight + gender form that funnels into the analysis
   page.

   Used in three places:
     • Index.tsx        — the §7 "BMI Rechner" section of the landing page
                          (light variant, sitting on an off-white band).
     • BmiRechner.tsx   — the dedicated /bmi-rechner page (light variant).
     • Survey.tsx       — could reuse the dark variant inside the dark hero
                          BMI card if we revisit the survey BMI step.

   On submit, navigates to /analyse with height/weight/gender as query params.
   The analysis page (Analyse.tsx → BmiAnalysis.tsx) reads those and renders
   the BMI gauge, projections, and target weight.

   The `variant` prop swaps the colour treatment so the same form can live on
   either a light or dark surface without restyling at every call-site.
   ========================================================================= */

interface BmiWidgetProps {
  variant?: "light" | "dark";
}

export const BmiWidget = ({ variant = "light" }: BmiWidgetProps) => {
  const navigate = useNavigate();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"women" | "men">("women");
  const canSubmit = Number(height) > 0 && Number(weight) > 0;

  // Submit → drop user into the analysis page with their inputs as URL params.
  const go = () => {
    if (!canSubmit) return;
    const h = Number(height) / 100;
    const w = Number(weight);
    const bmi = h > 0 && w > 0 ? Number((w / (h * h)).toFixed(2)) : null;
    void track(EVENTS.bmi_calculated, {
      height_cm: Number(height),
      weight_kg: w,
      gender,
      bmi,
    });
    navigate(`/analyse?height=${height}&weight=${weight}&gender=${gender}`);
  };

  const isDark = variant === "dark";

  return (
    <div className="space-y-4">
      {/* === Gender toggle — single track with a sliding thumb ===
         One pill-shaped track holds both options. A `<span>` thumb is
         positioned absolutely behind the two button labels and slides
         left/right via translate-x when the selection changes. The
         labels themselves stay in place; only their colour swaps so
         the chosen one reads white-on-black (light variant) or
         black-on-white (dark variant).

         Sizing notes: no inner padding on the track and a flat 50 %
         thumb width — translate-x-full then moves it exactly to the
         right slot. Earlier attempt used w-[calc(50%-4px)] but CSS
         calc requires whitespace around the minus, which Tailwind's
         arbitrary value syntax doesn't allow inline (would need
         `calc(50%_-_4px)`); easier to skip the padding altogether. */}
      <div
        role="group"
        aria-label="Geschlecht"
        className={`relative rounded-full flex ${
          isDark ? "bg-white/10" : "bg-muted"
        }`}
      >
        {/* The sliding thumb — full height, half the track width,
            translates exactly one full thumb width when men is selected.
            A subtle shadow lifts it off the track so the active option
            feels tactile rather than just a colour swap. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full shadow-sm transition-transform duration-300 ease-out ${
            isDark ? "bg-white" : "bg-foreground"
          } ${gender === "men" ? "translate-x-full" : "translate-x-0"}`}
        />
        {(["women", "men"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            aria-pressed={gender === g}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors duration-200 ${
              isDark
                ? gender === g
                  ? "text-black"
                  : "text-white/50 hover:text-white/80"
                : gender === g
                ? "text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {g === "women" ? "Frau" : "Mann"}
          </button>
        ))}
      </div>

      {/* === Height + weight inputs — two equally-weighted cards === */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Grösse",
            value: height,
            set: setHeight,
            placeholder: "175",
            suffix: "cm",
          },
          {
            label: "Gewicht",
            value: weight,
            set: setWeight,
            placeholder: "90",
            suffix: "kg",
          },
        ].map((f) => (
          <div
            key={f.label}
            className={`rounded-2xl p-4 ${isDark ? "bg-white/10" : "bg-muted"}`}
          >
            <label
              className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                isDark ? "text-white/40" : "text-muted-foreground"
              }`}
            >
              {f.label}
            </label>
            <div className="flex items-end gap-1">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                className={`h-10 text-2xl font-bold border-0 bg-transparent p-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  isDark
                    ? "text-white placeholder:text-white/20"
                    : "placeholder:text-muted-foreground/30"
                }`}
              />
              <span
                className={`text-sm pb-1 shrink-0 ${
                  isDark ? "text-white/30" : "text-muted-foreground"
                }`}
              >
                {f.suffix}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* === Submit pill === */}
      <button
        type="button"
        onClick={go}
        disabled={!canSubmit}
        className={`w-full py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30 transition-opacity hover:opacity-90 ${
          isDark ? "bg-white text-black" : "bg-foreground text-background"
        }`}
      >
        Prognose berechnen <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BmiWidget;

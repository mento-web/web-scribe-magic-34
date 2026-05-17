import { Mail, MessageCircle, Stethoscope } from "lucide-react";
import { PageShell } from "@/components/PageShell";

/* ============================================================================
   Kontakt — minimal contact info page.
   Three channels: general support email, in-app messaging hint, and a
   reminder that medical questions go to the prescribing doctor (not support).
   Linked from the footer column "Über helvi".
   ========================================================================= */

const Kontakt = () => (
  <PageShell>
    {/* === Page header === */}
    <section className="px-4 pt-16 pb-12 md:pt-24">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Kontakt
        </p>
        <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-8">
          So erreichen<br />Sie uns.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Für allgemeine Fragen schreiben Sie uns. Für medizinische Anliegen
          wenden Sie sich bitte direkt an Ihren behandelnden Arzt über das
          Patientenportal.
        </p>
      </div>
    </section>

    {/* === Three contact channel cards === */}
    <section className="px-4 mt-16">
      <div className="container mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Mail,
            label: "Allgemeine Fragen",
            value: "support@helvi.ch",
            href: "mailto:support@helvi.ch",
            tint: "hsl(var(--tint-peach))",
          },
          {
            icon: Stethoscope,
            label: "Medizinische Fragen",
            value: "Patientenportal nach dem Fragebogen",
            href: undefined,
            tint: "hsl(var(--tint-lavender))",
          },
          {
            icon: MessageCircle,
            label: "Presse",
            value: "presse@helvi.ch",
            href: "mailto:presse@helvi.ch",
            tint: "hsl(var(--tint-powder-blue))",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-[14px] p-6 flex flex-col gap-4"
            style={{ background: c.tint }}
          >
            <c.icon className="h-6 w-6" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
              {c.label}
            </p>
            {c.href ? (
              <a href={c.href} className="text-base font-medium underline underline-offset-4">
                {c.value}
              </a>
            ) : (
              <p className="text-base font-medium">{c.value}</p>
            )}
          </div>
        ))}
      </div>
    </section>

    {/* === Office address block (placeholder) === */}
    <section className="px-4 mt-20 md:mt-28">
      <div className="container mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Adresse
        </p>
        <p className="font-editorial text-3xl md:text-5xl leading-[1.05] mb-4">
          Helvi AG<br />
          [Strasse Nr.]<br />
          [PLZ] [Ort], Schweiz
        </p>
        <p className="text-sm text-muted-foreground">
          Bürozeiten: Mo–Fr 09:00–17:00 (CET)
        </p>
      </div>
    </section>
  </PageShell>
);

export default Kontakt;

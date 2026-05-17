import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ============================================================================
   Anmelden — login page for returning patients.

   Three sign-in methods (Google OAuth, Apple OAuth, email/password), plus a
   "Passwort vergessen?" recovery flow in a shadcn AlertDialog.

   Sign-up is intentionally NOT exposed here — accounts are created downstream
   by the survey + doctor approval flow. The login page is for returning
   patients only.

   Security notes:
     • Error messages are deliberately generic ("Anmeldedaten ungültig…")
       so an attacker cannot enumerate which accounts exist.
     • OAuth redirects route back to /konto (or to the ?next= path).
     • The ?next= query param is sanitised: only paths starting with a single
       `/` are accepted (no protocol-relative URLs, no http:// targets).
   ========================================================================= */

// Schema is intentionally permissive: validate "is an email", "not empty".
// Don't enforce password length on login — legacy accounts may use shorter
// passwords than current policy. Sign-up enforces stricter rules elsewhere.
const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein."),
});
type LoginInput = z.infer<typeof loginSchema>;

// Only allow redirects to same-origin paths. Reject `//foo` (protocol-rel),
// `http://…`, query-only strings, and anything that doesn't start with `/`.
const sanitiseNext = (raw: string | null): string => {
  if (!raw) return "/konto";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/konto";
  return raw;
};

// Inline Google "G" glyph. Lucide doesn't ship Google/Apple logos; the brand
// colours render even at small sizes. Keep this in one place if reused.
const GoogleGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.87 0-5.3-1.94-6.16-4.55H2.18v2.86A11 11 0 0 0 12 23Z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.34-1.36-.34-2.09 0-.73.13-1.43.35-2.09V7.05H2.18a11 11 0 0 0 0 9.91l3.66-2.87Z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.86C6.7 7.31 9.13 5.38 12 5.38Z"/>
  </svg>
);

// Apple uses an SVG path so it renders crisp at any size. Solid black mark.
const AppleGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
    <path d="M17.54 12.4c-.03-2.6 2.13-3.85 2.23-3.91-1.21-1.78-3.1-2.02-3.78-2.05-1.61-.16-3.15.95-3.96.95-.83 0-2.08-.93-3.42-.91-1.76.03-3.4 1.02-4.3 2.6-1.84 3.18-.47 7.88 1.32 10.46.87 1.27 1.91 2.69 3.27 2.64 1.32-.05 1.82-.85 3.41-.85 1.58 0 2.04.85 3.43.83 1.42-.03 2.31-1.29 3.18-2.57 1-1.48 1.42-2.91 1.44-2.99-.03-.01-2.76-1.06-2.79-4.2ZM14.94 4.95c.73-.88 1.22-2.11 1.08-3.33-1.05.04-2.32.69-3.07 1.57-.68.78-1.27 2.02-1.11 3.22 1.17.09 2.37-.6 3.1-1.46Z" />
  </svg>
);

const Anmelden = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = sanitiseNext(searchParams.get("next"));

  // Form state — generic error string is rendered as one calm line below the
  // password field. Loading state disables the pill while the request flies.
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Forgot-password dialog state.
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Email + password sign-in. On success → navigate to ?next or /konto.
  // On failure → render generic German error (do not reveal which field).
  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    setIsLoading(false);
    if (error) {
      setAuthError("Anmeldedaten ungültig. Bitte versuchen Sie es erneut.");
      return;
    }
    navigate(next, { replace: true });
  };

  // OAuth flow — Supabase redirects to the provider's consent screen, then
  // back to our redirectTo URL. The session lands in localStorage and
  // onAuthStateChange picks it up. We point redirectTo at /konto (or next).
  const signInWithProvider = async (provider: "google" | "apple") => {
    setAuthError(null);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${next}` },
    });
  };

  // Password reset — Supabase emails a recovery link to the supplied address.
  // The link returns to /anmelden with a recovery hash; Supabase's client
  // picks it up and signs the user in (then they can change their password
  // via Konto-Einstellungen — out of scope here).
  const onResetSubmit = async () => {
    if (!resetEmail) return;
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/anmelden`,
    });
    setResetSent(true);
  };

  return (
    <PageShell>
      {/* === Login form — centred, narrow column === */}
      <section className="px-4 pt-16 pb-12 md:pt-24">
        <div className="container mx-auto max-w-md">
          {/* Page header */}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Anmeldung
          </p>
          <h1 className="font-editorial text-5xl md:text-7xl leading-[0.95] tracking-tight mb-3">
            Willkommen zurück.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-10">
            Melden Sie sich in Ihrem helvi-Konto an.
          </p>

          {/* === OAuth buttons — outline pills with brand glyphs === */}
          <div className="space-y-3 mb-8">
            <button
              type="button"
              onClick={() => signInWithProvider("google")}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-foreground bg-background text-foreground px-6 py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              <GoogleGlyph />
              Mit Google fortfahren
            </button>
            <button
              type="button"
              onClick={() => signInWithProvider("apple")}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-foreground bg-background text-foreground px-6 py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              <AppleGlyph />
              Mit Apple fortfahren
            </button>
          </div>

          {/* === "oder" divider === */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              oder
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* === Email + password form === */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted rounded-2xl p-4">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground block mb-2"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full h-10 text-base bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/30"
                placeholder="name@beispiel.ch"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Passwort
                </label>
                {/* Forgot-password trigger — opens an AlertDialog */}
                <AlertDialog
                  onOpenChange={(open) => {
                    if (open) {
                      setResetSent(false);
                      setResetEmail("");
                    }
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                    >
                      Passwort vergessen?
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    {resetSent ? (
                      <>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-editorial text-3xl">
                            E-Mail gesendet.
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Wir haben Ihnen einen Link zum Zurücksetzen des
                            Passworts an <strong>{resetEmail}</strong>{" "}
                            gesendet. Bitte prüfen Sie auch Ihren Spam-Ordner.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction className="rounded-full">
                            Schliessen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </>
                    ) : (
                      <>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-editorial text-3xl">
                            Passwort zurücksetzen.
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Geben Sie die E-Mail-Adresse Ihres Kontos ein. Wir
                            schicken Ihnen einen Link, um ein neues Passwort
                            zu wählen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="bg-muted rounded-2xl p-4 my-2">
                          <label
                            htmlFor="reset-email"
                            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground block mb-2"
                          >
                            E-Mail
                          </label>
                          <input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full h-10 text-base bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/30"
                            placeholder="name@beispiel.ch"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">
                            Abbrechen
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.preventDefault();
                              onResetSubmit();
                            }}
                            className="rounded-full"
                          >
                            Link senden
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </>
                    )}
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full h-10 text-base bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/30"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Generic error — never reveals which field was wrong */}
            {authError && (
              <p className="text-sm text-destructive" role="alert">
                {authError}
              </p>
            )}

            {/* Solid black pill submit button. Disabled + spinner on load. */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Anmelden <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* === Footer microcopy — data sovereignty pitch === */}
          <p className="text-xs text-muted-foreground text-center mt-10 leading-relaxed">
            Daten in der Schweiz. Geschützt nach DSG und HMG.
          </p>

          {/* === Sign-up nudge — account creation happens via the survey === */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Noch kein Konto?{" "}
            <Link
              to="/survey/women"
              className="underline underline-offset-4 text-foreground"
            >
              Fragebogen starten
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
};

export default Anmelden;

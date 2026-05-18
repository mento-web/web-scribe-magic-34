import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSlots, bookSlot, type Slot } from "@/lib/booking";
import { updateLeadBooking } from "@/lib/leads";

/* ============================================================================
   Termin.tsx — Cal.com-backed booking page.

   Funnel position: this page is the step AFTER the survey result screen.
   We arrive here from Survey.tsx when the user is `eligible` and clicks
   "Behandlung buchen", with their email passed via react-router state.

   Layout follows the same editorial shell as the survey result screen:
   centered, max-w-xl, font-editorial headline, muted body, HMG disclaimer
   at the bottom. Reuses the SURVEY-style animation tokens are NOT used here
   on purpose — the booking screen has its own micro-flow (pick date → pick
   slot → confirm) and we don't want a global page-enter animation fighting
   the slot grid re-renders.

   Cal.com integration: every async call goes through `@/lib/booking`. Do
   NOT import @calcom/atoms here. See lib/booking.ts for the seam.
   ========================================================================= */

/* === Helpers — local date formatting, German labels ====================== */

// "YYYY-MM-DD" in local time. We deliberately don't use toISOString() here,
// because that converts to UTC and would shift the date by one day for users
// west of UTC late in the evening.
const toLocalDateIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// German short weekday ("Mo", "Di", …) + day-of-month for the date strip.
const WEEKDAYS_DE_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const formatDateStripLabel = (d: Date): { weekday: string; day: number } => ({
  weekday: WEEKDAYS_DE_SHORT[d.getDay()],
  day: d.getDate(),
});

// 24-hour HH:MM, e.g. "09:30". Used for slot buttons + confirmation card.
const formatSlotTime = (iso: string): string => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// Long German date used in the confirmation card, e.g. "Mittwoch, 20. Mai 2026".
const WEEKDAYS_DE_LONG = [
  "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag",
];
const MONTHS_DE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];
const formatLongDate = (iso: string): string => {
  const d = new Date(iso);
  return `${WEEKDAYS_DE_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`;
};

/* === The page =========================================================== */

const Termin = () => {
  // Pull the email + leads handle forwarded by Survey.tsx via
  // `navigate(..., { state: { email, leadId, leadToken } })`. If a user lands
  // here directly (no state), we bounce them home — booking without a
  // completed survey is not a supported path. leadId / leadToken may be
  // missing if the Supabase INSERT in Survey.tsx failed; in that case we
  // skip the post-booking UPDATE entirely (best-effort lead persistence).
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as {
    email?: string;
    leadId?: string;
    leadToken?: string;
  } | null;
  const email = navState?.email;
  const leadId = navState?.leadId;
  const leadToken = navState?.leadToken;

  useEffect(() => {
    if (!email) navigate("/", { replace: true });
  }, [email, navigate]);

  // Build the 14-day date strip ONCE per mount. "Today" is anchored when the
  // user arrives; we don't try to refresh at midnight.
  const dateOptions = useMemo<Date[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  // Selected date (defaults to today) and the slot the user has tapped.
  const [selectedDateIso, setSelectedDateIso] = useState<string>(() =>
    toLocalDateIso(dateOptions[0]),
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Booking confirmation flow state.
  const [isBooking, setIsBooking] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch slots for the currently-selected day. Resets the selected slot
  // when the day changes (handled in the onClick of the date pills).
  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useQuery({
    queryKey: ["slots", selectedDateIso],
    queryFn: () => fetchSlots(selectedDateIso),
  });

  // Confirms the booking through the lib/booking seam. The lib decides
  // whether the call goes to the stub or to Cal.com Atoms. After the
  // booking succeeds, we ALSO update the leads row with the slot +
  // cal_booking_id. That UPDATE is best-effort: Cal.com is the source of
  // truth for the actual appointment, so a failed leads write must not
  // block the success screen.
  const handleConfirm = async () => {
    if (!email || !selectedSlot) return;
    setIsBooking(true);
    setBookingError(null);

    const result = await bookSlot(email, selectedSlot.startIso);
    if (!result.ok) {
      setIsBooking(false);
      setBookingError(result.error);
      return;
    }

    // Fire-and-don't-block leads UPDATE. Skipped entirely if we don't have a
    // lead handle (e.g. the Supabase INSERT in Survey.tsx silently failed).
    if (leadId && leadToken) {
      try {
        await updateLeadBooking({
          id: leadId,
          leadToken,
          slotIso: selectedSlot.startIso,
          calBookingId: result.bookingId,
        });
      } catch (err) {
        console.warn("updateLeadBooking failed", err);
      }
    }

    setIsBooking(false);
    setBookingId(result.bookingId);
  };

  // If the email was missing the effect above will redirect — render
  // nothing in the meantime to avoid a flash of the booking UI.
  if (!email) return null;

  /* ── Success state — shown after a confirmed booking ─────────────────── */
  if (bookingId && selectedSlot) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Green check medallion — same chrome as the eligible result icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-500" strokeWidth={1.5} />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6 bg-emerald-500/10 text-emerald-600">
            Termin bestätigt
          </span>

          <h1 className="font-editorial text-5xl md:text-6xl leading-[0.95] tracking-tight mb-5">
            Ihr Termin steht.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Eine Bestätigung wurde an <strong className="text-foreground">{email}</strong> gesendet.
          </p>

          {/* Recap card — same `bg-muted rounded-[14px]` chrome as the
              pricing teaser on the survey result screen */}
          <div className="bg-muted rounded-[14px] p-6 mb-8 text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2">
              Termin
            </p>
            <p className="font-editorial text-2xl leading-tight mb-1">
              {formatLongDate(selectedSlot.startIso)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatSlotTime(selectedSlot.startIso)} Uhr · 30 Minuten
            </p>
          </div>

          <Link to="/">
            <Button size="lg" className="w-full rounded-full text-base font-medium gap-2">
              Zur Startseite <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          {/* HMG disclaimer — load-bearing under Swiss HMG, do not edit. */}
          <p className="text-xs text-muted-foreground mt-10 max-w-sm mx-auto leading-relaxed">
            Diese Einschätzung ersetzt keine ärztliche Diagnose. Alle Behandlungen erfolgen gemäss Schweizer Heilmittelgesetz (HMG) und unter ärztlicher Aufsicht.
          </p>
        </div>
      </div>
    );
  }

  /* ── Confirmation state — slot tapped, awaiting "Termin bestätigen" ──── */
  if (selectedSlot) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header matches the survey shell — back link + cancel link */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="container mx-auto flex items-center justify-between h-14 px-5 max-w-xl">
            <button
              onClick={() => setSelectedSlot(null)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Zurück</span>
            </button>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Abbrechen
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-start md:items-center">
          <div className="container mx-auto px-5 pt-10 pb-6 max-w-xl w-full">
            {/* Editorial title — confirms what the user is about to book */}
            <div className="mb-8">
              <h2 className="font-editorial text-4xl md:text-5xl leading-[1] tracking-tight mb-3">
                Termin bestätigen
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ein Schweizer Arzt meldet sich zur gewählten Zeit. Dauer ca. 30 Minuten.
              </p>
            </div>

            {/* Recap card — same chrome as the success-state card */}
            <div className="bg-muted rounded-[14px] p-6 mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2">
                Termin
              </p>
              <p className="font-editorial text-2xl leading-tight mb-1">
                {formatLongDate(selectedSlot.startIso)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatSlotTime(selectedSlot.startIso)} Uhr · 30 Minuten
              </p>
            </div>

            {/* Email recap — read-only; the user already typed it on the
                survey result screen. Surfacing it here lets them double-check. */}
            <div className="bg-muted rounded-[14px] p-6 mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mb-2">
                E-Mail
              </p>
              <p className="text-base">{email}</p>
            </div>

            {bookingError && (
              <p className="text-sm text-destructive mb-3" role="alert">
                {bookingError}
              </p>
            )}

            {/* Solid primary pill — same shape as Survey.tsx eligible CTA */}
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={isBooking}
              className="w-full rounded-full text-base font-medium gap-2"
            >
              {isBooking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Termin bestätigen <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* HMG disclaimer — required by Swiss HMG, do not edit. */}
            <p className="text-xs text-muted-foreground mt-10 max-w-sm mx-auto leading-relaxed text-center">
              Diese Einschätzung ersetzt keine ärztliche Diagnose. Alle Behandlungen erfolgen gemäss Schweizer Heilmittelgesetz (HMG) und unter ärztlicher Aufsicht.
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Default state — pick a date, then a 30-minute slot ──────────────── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header — back to landing, cancel link mirrors Survey.tsx */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between h-14 px-5 max-w-xl">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Zurück</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start">
        <div className="container mx-auto px-5 pt-10 pb-12 max-w-xl w-full">
          {/* Editorial title introducing the slot picker */}
          <div className="mb-8">
            <h2 className="font-editorial text-4xl md:text-5xl leading-[1] tracking-tight mb-3">
              Wählen Sie einen Termin
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ein Schweizer Arzt meldet sich zur gewählten Zeit. Dauer ca. 30 Minuten.
            </p>
          </div>

          {/* === Date strip — horizontal scrollable row of 14 day pills === */}
          <div className="mb-8 -mx-5 px-5 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {dateOptions.map((d) => {
                const iso = toLocalDateIso(d);
                const isActive = iso === selectedDateIso;
                const { weekday, day } = formatDateStripLabel(d);
                return (
                  <button
                    key={iso}
                    onClick={() => {
                      setSelectedDateIso(iso);
                      setSelectedSlot(null);
                    }}
                    className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-colors ${
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                      {weekday}
                    </span>
                    <span className="font-editorial text-2xl leading-none mt-1">
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* === Slot grid — 30-minute pills, 2 cols mobile / 3 cols md+ === */}
          {slotsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {slotsError && (
            <p className="text-sm text-destructive py-8 text-center">
              Termine konnten nicht geladen werden. Bitte erneut versuchen.
            </p>
          )}

          {slots && slots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {slots.map((slot) => (
                <button
                  key={slot.startIso}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className="rounded-full bg-muted text-foreground py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-muted disabled:hover:text-foreground"
                >
                  {formatSlotTime(slot.startIso)}
                </button>
              ))}
            </div>
          )}

          {slots && slots.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Keine freien Termine an diesem Tag.
            </p>
          )}

          {/* HMG disclaimer — required by Swiss HMG, do not edit. */}
          <p className="text-xs text-muted-foreground mt-12 max-w-sm mx-auto leading-relaxed text-center">
            Diese Einschätzung ersetzt keine ärztliche Diagnose. Alle Behandlungen erfolgen gemäss Schweizer Heilmittelgesetz (HMG) und unter ärztlicher Aufsicht.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Termin;

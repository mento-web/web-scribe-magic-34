/* ============================================================================
   booking.ts — Cal.com Atoms integration seam.

   What this file is:
     The frontend (Termin.tsx) talks to THIS module to fetch available time
     slots and confirm a booking. The backend (operator: us, with Cal.com
     Atoms wired in a server route) is responsible for replacing the stubs
     below with real Cal.com API calls.

   Why a seam:
     We deliberately do NOT import @calcom/atoms here. Keeping the contract
     small (Slot[], two async functions) means swapping the stub for a real
     Cal.com Atoms availability + booking call is a single-file change, with
     zero ripple into Termin.tsx or the Survey result screen.

   What the stub does today:
     Returns a deterministic 09:00–17:30 grid in 30-minute increments. Every
     slot is marked available. This makes the page fully clickable and
     reviewable on Lovable before the backend is connected.

   Replace the bodies of fetchSlots() and bookSlot() — keep their signatures
   stable.
   ========================================================================= */

// One bookable 30-minute window. startIso is UTC ISO-8601 ("…Z").
export type Slot = {
  startIso: string;
  available: boolean;
};

// Success / failure envelope returned by bookSlot. Keeps the caller from
// having to deal with thrown exceptions for expected business failures
// (slot already taken, email rejected, etc.).
export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

/* === fetchSlots ============================================================
   Returns the 30-minute slot grid for a given calendar date.

   `dateIso` is expected as YYYY-MM-DD in the user's local time zone — we
   build slot start times against that date, NOT against UTC midnight, so the
   times the user sees match what they picked.

   Cal.com backend replacement: call the Atoms availability endpoint for the
   configured event-type, then map the result into Slot[].
   ======================================================================== */
export async function fetchSlots(dateIso: string): Promise<Slot[]> {
  // Simulate ~250ms network latency so the UI's loading state is exercised.
  await new Promise((r) => setTimeout(r, 250));

  // Build [YYYY, M, D] from the supplied dateIso. We treat it as a local
  // date — same wall-clock day the user is picking in the date strip.
  const [yearStr, monthStr, dayStr] = dateIso.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1; // JS Date months are 0-indexed.
  const day = Number(dayStr);

  // 09:00 → 17:30 inclusive, every 30 minutes = 18 slots.
  const slots: Slot[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (const minute of [0, 30]) {
      const local = new Date(year, month, day, hour, minute, 0, 0);
      slots.push({
        startIso: local.toISOString(),
        available: true,
      });
    }
  }
  return slots;
}

/* === bookSlot =============================================================
   Confirms a booking for the given attendee email + slot start time.

   Cal.com backend replacement: POST to the Atoms booking endpoint with the
   attendee email + event-type + start time. Return the resulting booking id.
   ======================================================================== */
export async function bookSlot(
  email: string,
  startIso: string,
): Promise<BookingResult> {
  // Simulate ~800ms server round-trip so the confirm button's spinner is
  // visible during development.
  await new Promise((r) => setTimeout(r, 800));

  // Reference the parameters so TS/lint don't flag them as unused while the
  // stub is in place. Remove these lines when wiring the real API call.
  void email;
  void startIso;

  // Pretend-success path. Replace with the real Cal.com booking id.
  return { ok: true, bookingId: `stub-${Date.now()}` };
}

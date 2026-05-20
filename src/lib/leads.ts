/* ============================================================================
   leads.ts — Supabase wrappers for the survey-funnel `leads` table.

   Two operations, one per phase of the funnel:
     1. createLead()        — INSERT on the eligible result screen, when the
                              user submits a valid email.
     2. updateLeadBooking() — RPC call from /termin after the slot picker
                              confirms a booking. Fills in booking columns.

   The (id, lead_token) pair is generated CLIENT-SIDE and travels through
   react-router state. It is the shared secret that lets the same browser
   complete its own row without being able to mutate anyone else's. Anon
   never gets SELECT on this table, so we cannot read these values back
   from the database after the INSERT — we have to know them up front.

   Types are defined locally here so this file doesn't depend on
   `src/integrations/supabase/types.ts`, which is auto-generated and
   currently does not know about the leads table. After you regen types
   (`supabase gen types typescript --linked > src/integrations/supabase/types.ts`)
   you can drop the `as any` cast on `supabase` below and TypeScript will
   validate these calls against the real schema.
   ========================================================================= */

import { supabase } from "@/integrations/supabase/client";
import { backfillLeadSurveyResponses } from "@/lib/tracking";

export type Eligibility = "eligible" | "borderline" | "low-bmi";
export type Gender = "women" | "men";

export type CreateLeadInput = {
  email: string;
  gender: Gender;
  eligibility: Eligibility;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
};

// Returned to the caller so it can complete the lead later via
// updateLeadBooking. Travels in router state from Survey.tsx → Termin.tsx.
export type LeadHandle = {
  id: string;
  leadToken: string;
};

// TEMPORARY: untyped Supabase view. Remove `as any` once the regenerated
// types in src/integrations/supabase/types.ts include the leads table and
// update_lead_booking RPC.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

/* createLead — inserts a new row and returns its (id, leadToken).
   id + leadToken are generated locally with crypto.randomUUID() so we don't
   need to read them back from the DB (anon has no SELECT permission). */
export async function createLead(input: CreateLeadInput): Promise<LeadHandle> {
  const id = crypto.randomUUID();
  const leadToken = crypto.randomUUID();

  const { error } = await sb.from("leads").insert({
    id,
    lead_token: leadToken,
    email: input.email,
    gender: input.gender,
    eligibility: input.eligibility,
    height_cm: input.heightCm,
    weight_kg: input.weightKg,
    bmi: input.bmi,
  });

  if (error) throw new Error(error.message);

  // Stamp the new lead_id onto every survey_responses row this visitor has
  // already written. Best-effort — if it fails, the funnel-by-campaign query
  // simply won't pivot survey answers through this lead, but the lead row
  // itself still exists. Never blocks the user.
  void backfillLeadSurveyResponses(id);

  return { id, leadToken };
}

/* updateLeadBooking — calls the SECURITY DEFINER RPC that fills in booking
   columns on a previously-inserted row. The (id, token) pair must match,
   otherwise the function raises 'lead not found' and we throw. */
export async function updateLeadBooking(args: {
  id: string;
  leadToken: string;
  slotIso: string;
  calBookingId: string;
}): Promise<void> {
  const { error } = await sb.rpc("update_lead_booking", {
    p_id: args.id,
    p_token: args.leadToken,
    p_slot_iso: args.slotIso,
    p_cal_booking_id: args.calBookingId,
  });
  if (error) throw new Error(error.message);
}

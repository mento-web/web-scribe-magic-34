/* ============================================================================
   tracking.ts — Client-side funnel event tracking.

   What this file owns:
     1. The visitor identity. A (visitor_id, visitor_token) pair is generated
        on the very first page hit, persisted to localStorage, and inserted
        into public.visitors with first-touch attribution (UTMs, referrer,
        landing page, user-agent). The pair is the same shared-secret pattern
        used by leads.ts.

     2. The track() function. Every funnel event (page_viewed, cta_clicked,
        lead_created, …) gets written to public.events via track(). Calls
        are fire-and-forget: errors are logged but never thrown — analytics
        must never break the funnel.

     3. The EVENTS canonical list. event_name is free-text in the DB but call
        sites must use EVENTS.<name> here, so there is one place to grep and
        no typo drift.

   Why initialization is a Promise:
     The visitors row must exist before any events can reference it via
     FK. ensureVisitor() does the INSERT once and caches the resulting
     promise; every track() awaits that promise. If a hundred events fire
     before the INSERT completes, they all line up behind the same promise.
   ========================================================================= */

import { supabase } from "@/integrations/supabase/client";

// Locally typed Supabase view. Same pattern as src/lib/leads.ts — drop the
// cast once src/integrations/supabase/types.ts is regenerated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

/* ── EVENTS — canonical event-name registry ──────────────────────────────────
   Anyone adding a new event MUST add a key here. Keeping it as a `const`
   object (not an enum) so call sites read like `EVENTS.lead_created`. */
export const EVENTS = {
  page_viewed: "page_viewed",
  cta_clicked: "cta_clicked",
  bmi_calculated: "bmi_calculated",
  survey_started: "survey_started",
  survey_question_answered: "survey_question_answered",
  eligibility_result: "eligibility_result",
  lead_created: "lead_created",
  slot_selected: "slot_selected",
  booking_confirmed: "booking_confirmed",
  sign_in_attempted: "sign_in_attempted",
  sign_in_succeeded: "sign_in_succeeded",
  sign_out: "sign_out",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/* ── localStorage keys ─────────────────────────────────────────────────────── */
const LS_VISITOR_ID = "helvi_visitor_id";
const LS_VISITOR_TOKEN = "helvi_visitor_token";

export type VisitorHandle = { visitorId: string; visitorToken: string };

/* ── Module-level state ──────────────────────────────────────────────────────
   readyPromise: holds the in-flight or completed visitor-creation. Replaces
                 the need for a public "isReady" boolean — track() just awaits.
   currentProfileId: set by auth.tsx on SIGNED_IN so authenticated events get
                     a profile_id stamp. */
let readyPromise: Promise<VisitorHandle> | null = null;
let currentProfileId: string | null = null;

export function setProfileId(id: string | null): void {
  currentProfileId = id;
}

/* ── deriveDeviceType — coarse UA-based bucket ───────────────────────────────
   Good enough for "mobile vs desktop" funnel splits. Real device-type
   parsing belongs in a UA-parsing lib but isn't worth the bundle weight. */
function deriveDeviceType(ua: string): "mobile" | "tablet" | "desktop" {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

/* ── captureAttribution — read URL + referrer on first visit ─────────────── */
function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    referrer_url: document.referrer || null,
    landing_page: window.location.pathname + window.location.search,
    user_agent_raw: navigator.userAgent,
    device_type: deriveDeviceType(navigator.userAgent),
  };
}

/* ── ensureVisitor — idempotent visitor-row creation ─────────────────────────
   On first call: if localStorage has both id+token, trust them and return
   without an INSERT (the row already exists from a prior session). If not,
   generate UUIDs, INSERT with attribution, persist to localStorage.

   Cached via readyPromise — every track() awaits the same promise.
   Errors are swallowed: we still cache the IDs locally so subsequent track()
   calls can attempt INSERTs; FK violations will be the visible failure mode. */
function ensureVisitor(): Promise<VisitorHandle> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    const existingId = window.localStorage.getItem(LS_VISITOR_ID);
    const existingToken = window.localStorage.getItem(LS_VISITOR_TOKEN);

    if (existingId && existingToken) {
      return { visitorId: existingId, visitorToken: existingToken };
    }

    const visitorId = crypto.randomUUID();
    const visitorToken = crypto.randomUUID();
    const attribution = captureAttribution();

    try {
      const { error } = await sb.from("visitors").insert({
        id: visitorId,
        visitor_token: visitorToken,
        ...attribution,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      // Tracking must never break the funnel. Log and continue — events
      // fired immediately after this will likely 500 on the FK, but
      // subsequent visits will succeed (localStorage is set below).
      console.warn("[tracking] visitor INSERT failed:", err);
    }

    window.localStorage.setItem(LS_VISITOR_ID, visitorId);
    window.localStorage.setItem(LS_VISITOR_TOKEN, visitorToken);
    return { visitorId, visitorToken };
  })();

  return readyPromise;
}

/* ── getOrCreateVisitor — public entry point for app mount ───────────────── */
export function getOrCreateVisitor(): Promise<VisitorHandle> {
  return ensureVisitor();
}

/* ── getVisitorSync — synchronous read for callers that already know the
   visitor exists (e.g. Survey.tsx after the app has mounted). Returns null
   if localStorage was cleared. */
export function getVisitorSync(): VisitorHandle | null {
  const visitorId = window.localStorage.getItem(LS_VISITOR_ID);
  const visitorToken = window.localStorage.getItem(LS_VISITOR_TOKEN);
  if (!visitorId || !visitorToken) return null;
  return { visitorId, visitorToken };
}

/* ── track — fire one event into public.events ───────────────────────────── */
export async function track(
  eventName: EventName,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { visitorId } = await ensureVisitor();
    const eventId = crypto.randomUUID();

    const { error } = await sb.from("events").insert({
      event_id: eventId,
      visitor_id: visitorId,
      profile_id: currentProfileId,
      event_name: eventName,
      event_time: new Date().toISOString(),
      source: "client",
      metadata,
    });

    if (error) {
      // Duplicate event_id (idempotency hit) is the only "expected" error —
      // double-click on a CTA, React StrictMode double-mount, etc. Anything
      // else gets logged.
      if (error.code !== "23505") {
        console.warn("[tracking] event INSERT failed:", error.message);
      }
    }
  } catch (err) {
    console.warn("[tracking] track() threw:", err);
  }
}

/* ── upsertSurveyResponse — write one row to public.survey_responses ─────────
   Goes through the RPC (which validates visitor_token), not a direct INSERT,
   because the table has no anon INSERT policy. The RPC handles UPSERT
   semantics — calling twice for the same (visitor, question_key) overwrites
   the previous answer. */
export async function upsertSurveyResponse(
  questionKey: string,
  answer: unknown,
): Promise<void> {
  try {
    const v = getVisitorSync();
    if (!v) {
      console.warn("[tracking] upsertSurveyResponse: no visitor in localStorage");
      return;
    }
    const { error } = await sb.rpc("upsert_survey_response", {
      p_visitor_id: v.visitorId,
      p_visitor_token: v.visitorToken,
      p_question_key: questionKey,
      p_answer: answer,
    });
    if (error) console.warn("[tracking] upsert_survey_response failed:", error.message);
  } catch (err) {
    console.warn("[tracking] upsertSurveyResponse threw:", err);
  }
}

/* ── backfillLeadSurveyResponses — call once createLead() has resolved ───────
   Stamps the new lead_id onto every survey_responses row for the current
   visitor. Best-effort; failures are logged. */
export async function backfillLeadSurveyResponses(leadId: string): Promise<void> {
  try {
    const v = getVisitorSync();
    if (!v) return;
    const { error } = await sb.rpc("backfill_lead_survey_responses", {
      p_visitor_id: v.visitorId,
      p_visitor_token: v.visitorToken,
      p_lead_id: leadId,
    });
    if (error) console.warn("[tracking] backfill_lead_survey_responses failed:", error.message);
  } catch (err) {
    console.warn("[tracking] backfillLeadSurveyResponses threw:", err);
  }
}

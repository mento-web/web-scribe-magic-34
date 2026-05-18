-- ============================================================================
-- 20260518230000_create_leads.sql
--
-- Survey-funnel lead capture + Cal.com booking tracking.
--
-- Two-phase write model:
--   1. Anon INSERT runs from /survey/:gender when the user submits a valid
--      email on the "eligible" result screen (Behandlung buchen).
--   2. Anon RPC update_lead_booking() runs from /termin after the slot
--      picker confirms the booking, filling in booking_slot_iso +
--      cal_booking_id.
--
-- The (id, lead_token) pair is generated CLIENT-SIDE and passed forward via
-- react-router state. It is the shared secret that lets a browser complete
-- its own row without being able to touch anyone else's. Anon never gets
-- SELECT/DELETE on this table — only INSERT and RPC-EXECUTE.
-- ============================================================================

-- ── Table ────────────────────────────────────────────────────────────────
CREATE TABLE public.leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_token   uuid NOT NULL    DEFAULT gen_random_uuid(),

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  -- Survey snapshot. Captured at the moment the user clicks "Behandlung
  -- buchen", so even users who never confirm a slot leave a row.
  email        text NOT NULL,
  gender       text NOT NULL CHECK (gender IN ('women', 'men')),
  eligibility  text NOT NULL CHECK (eligibility IN ('eligible', 'borderline', 'low-bmi')),
  height_cm    int,
  weight_kg    numeric(5,2),
  bmi          numeric(5,2),

  -- Booking columns — NULL until update_lead_booking() fills them in after
  -- a successful slot pick on /termin.
  booking_slot_iso     timestamptz,
  cal_booking_id       text,
  booking_confirmed_at timestamptz
);

-- ── Indexes — typical access patterns ────────────────────────────────────
-- Recent leads first when scanning from a dashboard.
CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
-- Case-insensitive lookup by email (e.g. "did this person already submit?").
CREATE INDEX leads_email_lower_idx ON public.leads (lower(email));

-- ── updated_at trigger ───────────────────────────────────────────────────
-- Bumps updated_at on every UPDATE. Useful for audit + Supabase realtime.
CREATE OR REPLACE FUNCTION public.leads_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER leads_touch_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.leads_touch_updated_at();

-- ============================================================================
-- Row Level Security
--   - INSERT: anyone (anon role) can drop a new lead. The CHECK constraints
--     on the columns themselves are the schema-level guard.
--   - SELECT / UPDATE / DELETE: never granted to anon. Booking updates flow
--     through update_lead_booking() below, which runs SECURITY DEFINER.
--   - Authenticated / service-role: not configured here; the table owner
--     (postgres) still has full access for dashboard queries.
-- ============================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_insert_anon"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT INSERT ON public.leads TO anon;
-- No SELECT/UPDATE/DELETE grants for anon. Intentional.

-- ============================================================================
-- update_lead_booking(p_id, p_token, p_slot_iso, p_cal_booking_id)
--
-- The ONLY path by which the anon role can mutate an existing leads row.
-- SECURITY DEFINER runs the function as the table owner (bypassing RLS);
-- the (id, token) check inside the function body is what actually protects
-- rows. If either value is wrong, NOT FOUND fires and we raise a generic
-- error that does not leak whether the id existed.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_lead_booking(
  p_id              uuid,
  p_token           uuid,
  p_slot_iso        timestamptz,
  p_cal_booking_id  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.leads
  SET booking_slot_iso     = p_slot_iso,
      cal_booking_id       = p_cal_booking_id,
      booking_confirmed_at = now()
  WHERE id = p_id AND lead_token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lead not found';
  END IF;
END;
$$;

-- Lock down the function: strip PUBLIC first, then grant only to anon.
REVOKE ALL  ON FUNCTION public.update_lead_booking(uuid, uuid, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_lead_booking(uuid, uuid, timestamptz, text) TO anon;

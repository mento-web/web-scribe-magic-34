-- ============================================================================
-- 20260520000000_create_tracking_foundation.sql
--
-- Event-based funnel tracking foundation.
--
-- Four new tables, one trigger, two RPCs, one ALTER. The shape follows the
-- event-sourcing pattern: every action a visitor takes is a row in
-- public.events. Funnels are derived at query time via FILTER (WHERE …).
-- New funnel shapes never require a schema change.
--
-- Identity model:
--   visitors  — one row per anonymous browser, keyed by a (id, token) secret
--               pair held in the client's localStorage. UTM + referrer +
--               landing page captured ONCE at first page hit, never updated.
--   profiles  — one row per signed-up user, FK to auth.users.id. Auto-created
--               by a trigger on auth.users INSERT.
--   events    — references visitor_id always, profile_id only after signup.
--   leads     — gains a profile_id column to link a pre-signup lead to a
--               post-signup account by email (via link_lead_to_profile RPC).
--
-- All anon writes follow the same shared-secret pattern as the existing
-- leads table: the client generates (id, token), passes both at write time,
-- and any future mutation has to know the token. RLS for anon is INSERT-only
-- on tracking tables; UPDATEs on survey_responses go through a SECURITY
-- DEFINER RPC that validates the visitor token.
-- ============================================================================


-- ── public.profiles ─────────────────────────────────────────────────────────
-- One row per signed-up user. PK is auth.users.id so we never carry two
-- different "user identity" keys. handle_new_user() trigger below populates
-- this automatically on signup.

CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  email       text NOT NULL,
  first_name  text
);

CREATE INDEX profiles_email_lower_idx ON public.profiles (lower(email));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile row.
CREATE POLICY "profiles_self_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_self_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── handle_new_user() trigger ───────────────────────────────────────────────
-- Auto-creates a profiles row whenever a new auth.users row appears. Copies
-- email and, if present, user_metadata.first_name (set during OAuth signup or
-- via supabase.auth.signUp's options.data).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── public.visitors ─────────────────────────────────────────────────────────
-- Anonymous identity. (id, visitor_token) is the shared secret kept in the
-- client's localStorage. Captured ONCE on first page hit; the row is never
-- updated. First-touch attribution lives here forever.

CREATE TABLE public.visitors (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_token   uuid NOT NULL    DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- First-touch attribution. Set once at INSERT time, never updated.
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  referrer_url    text,
  landing_page    text,
  user_agent_raw  text,
  device_type     text  -- 'mobile' | 'tablet' | 'desktop' — derived client-side
);

CREATE INDEX visitors_created_at_idx ON public.visitors (created_at DESC);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visitors_insert_anon"
  ON public.visitors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.visitors TO anon, authenticated;


-- ── public.events ───────────────────────────────────────────────────────────
-- The core table. Write-once. Every action in the funnel emits one row.
--
-- event_id (client-generated UUID, UNIQUE) gives idempotency: double-clicks,
-- retries, and SPA re-renders won't duplicate events. event_time vs
-- received_at separates "when did the action happen" from "when did the DB
-- record it" (important for offline / batched / webhook-sourced events).
--
-- event_name is free text by design. The canonical list lives in
-- src/lib/tracking.ts as the EVENTS constant. We trade schema enforcement
-- for the ability to add new events without a migration.

CREATE TABLE public.events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL UNIQUE,  -- client-generated; dedup key

  visitor_id   uuid NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  profile_id   uuid          REFERENCES public.profiles(id)  ON DELETE SET NULL,

  event_name   text NOT NULL,
  event_time   timestamptz NOT NULL,
  received_at  timestamptz NOT NULL DEFAULT now(),

  -- 'client' = fired from the browser
  -- 'server' = fired from a webhook (Stripe, Cal.com) via Edge Function
  -- 'system' = fired by a DB trigger or scheduled job
  source       text NOT NULL DEFAULT 'client'
               CHECK (source IN ('client', 'server', 'system')),

  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON COLUMN public.events.event_name IS
  'Free-text event name. Canonical list lives in src/lib/tracking.ts EVENTS constant. Examples: page_viewed, cta_clicked, survey_started, lead_created, booking_confirmed, sign_in_succeeded.';

-- Most funnel queries are "how many of event X in time window Y" — this
-- index covers them.
CREATE INDEX events_name_received_idx
  ON public.events (event_name, received_at DESC);

-- Per-visitor timelines (used to derive funnels per session).
CREATE INDEX events_visitor_received_idx
  ON public.events (visitor_id, received_at DESC);

-- Per-profile timelines for signed-up users. Partial — most events have
-- profile_id NULL, so this stays small.
CREATE INDEX events_profile_received_idx
  ON public.events (profile_id, received_at DESC)
  WHERE profile_id IS NOT NULL;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_insert_anon"
  ON public.events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.events TO anon, authenticated;


-- ── public.survey_responses ─────────────────────────────────────────────────
-- One row per (visitor, question). UPSERT semantics so back-navigation /
-- changing an answer just updates the existing row instead of creating a
-- second one — which means drop-off queries are accurate (count per
-- question is the count of distinct visitors who answered).
--
-- lead_id is NULL until the visitor clicks "Behandlung buchen" on the
-- eligible screen; at that moment createLead() backfills lead_id for all
-- of this visitor's prior responses.

CREATE TABLE public.survey_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id    uuid NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  lead_id       uuid          REFERENCES public.leads(id)    ON DELETE SET NULL,

  question_key  text NOT NULL,        -- matches Question.id from Survey.tsx
  answer        jsonb NOT NULL,       -- string | string[] | {height_cm, weight_kg}
  answered_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (visitor_id, question_key)
);

CREATE INDEX survey_responses_visitor_idx ON public.survey_responses (visitor_id);
CREATE INDEX survey_responses_lead_idx    ON public.survey_responses (lead_id) WHERE lead_id IS NOT NULL;

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Direct anon write paths are blocked. All writes go through the
-- upsert_survey_response() RPC below, which validates the visitor token.


-- ── upsert_survey_response RPC ──────────────────────────────────────────────
-- Anon's only path to write a survey answer. Validates the (visitor_id,
-- visitor_token) pair against the visitors table; if it matches, UPSERT.
-- If it doesn't, raise a generic "visitor not found" so we don't leak
-- whether the visitor_id existed.
--
-- The visitor_token check is what stops a malicious anon from overwriting
-- another visitor's responses — they'd need to know the token, which only
-- ever lives in that visitor's localStorage.

CREATE OR REPLACE FUNCTION public.upsert_survey_response(
  p_visitor_id     uuid,
  p_visitor_token  uuid,
  p_question_key   text,
  p_answer         jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok boolean;
BEGIN
  -- Verify the (id, token) pair before doing anything.
  SELECT EXISTS (
    SELECT 1 FROM public.visitors
    WHERE id = p_visitor_id AND visitor_token = p_visitor_token
  ) INTO v_ok;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'visitor not found';
  END IF;

  INSERT INTO public.survey_responses (visitor_id, question_key, answer)
  VALUES (p_visitor_id, p_question_key, p_answer)
  ON CONFLICT (visitor_id, question_key)
  DO UPDATE SET answer = EXCLUDED.answer, answered_at = now();
END;
$$;

REVOKE ALL  ON FUNCTION public.upsert_survey_response(uuid, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_survey_response(uuid, uuid, text, jsonb) TO anon, authenticated;


-- ── leads.profile_id (post-signup linkage) ──────────────────────────────────
-- Existing leads rows captured at "Behandlung buchen" time are pre-signup.
-- When the user later signs up via /anmelden, link_lead_to_profile() runs
-- on first SIGNED_IN auth event and stamps profile_id onto any matching
-- leads row by email. This is how a paying patient gets traced back to
-- their acquisition campaign.

ALTER TABLE public.leads
  ADD COLUMN profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX leads_profile_id_idx ON public.leads (profile_id) WHERE profile_id IS NOT NULL;


-- ── link_lead_to_profile RPC ────────────────────────────────────────────────
-- Called by the client from src/lib/auth.tsx onAuthStateChange SIGNED_IN.
-- Runs SECURITY DEFINER so it can UPDATE leads (which anon and authenticated
-- both lack UPDATE on). Matching is by lower-cased email; case-insensitive
-- because the user may have typed differently in the survey vs at signup.
--
-- Returns the count of leads rows linked (0 if no match). Idempotent —
-- re-running it does nothing extra because of the profile_id IS NULL guard.
--
-- survey_responses.lead_id is NOT backfilled here. It is set at the moment
-- of createLead() (in src/lib/leads.ts), where we know visitor_id directly.
-- After this RPC runs, the join chain to attribute survey answers to a
-- profile is: survey_responses.lead_id → leads.profile_id → profiles.id.

CREATE OR REPLACE FUNCTION public.link_lead_to_profile(p_email text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count int;
BEGIN
  WITH linked AS (
    UPDATE public.leads
    SET profile_id = auth.uid()
    WHERE lower(email) = lower(p_email)
      AND profile_id IS NULL
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM linked;

  RETURN v_count;
END;
$$;

REVOKE ALL  ON FUNCTION public.link_lead_to_profile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_lead_to_profile(text) TO authenticated;


-- ── backfill_lead_survey_responses RPC ──────────────────────────────────────
-- Called from src/lib/leads.ts:createLead() right after the leads INSERT
-- succeeds. Stamps the new lead_id onto every survey_responses row for the
-- given visitor that doesn't have one yet.
--
-- SECURITY DEFINER + visitor_token check, same shape as upsert_survey_response.

CREATE OR REPLACE FUNCTION public.backfill_lead_survey_responses(
  p_visitor_id     uuid,
  p_visitor_token  uuid,
  p_lead_id        uuid
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ok    boolean;
  v_count int;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.visitors
    WHERE id = p_visitor_id AND visitor_token = p_visitor_token
  ) INTO v_ok;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'visitor not found';
  END IF;

  WITH updated AS (
    UPDATE public.survey_responses
    SET lead_id = p_lead_id
    WHERE visitor_id = p_visitor_id
      AND lead_id IS NULL
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM updated;

  RETURN v_count;
END;
$$;

REVOKE ALL  ON FUNCTION public.backfill_lead_survey_responses(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.backfill_lead_survey_responses(uuid, uuid, uuid) TO anon, authenticated;

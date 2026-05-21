-- ============================================================================
-- 20260521150000_dashboard_funnel_views.sql
--
-- Read-side scaffolding for the Helvi funnel dashboard.
--
-- What this migration adds:
--   1. A `tenant_id` column with default 'helvi' on events, visitors, leads,
--      and survey_responses. Single-tenant today; the column is here so
--      multi-tenant later is a no-rewrite extension — every read in the
--      dashboard already filters by tenant_id.
--   2. A composite index on events(tenant_id, event_time DESC) — the access
--      pattern every dashboard page uses.
--   3. Five read-only aggregation views the dashboard consumes:
--        funnel_daily          — event counts per day per event_name
--        funnel_conversion     — per-visitor max funnel step reached
--        demographics_summary  — leads grouped by gender + BMI bucket
--        traffic_sources       — visitors grouped by UTM + referrer
--        recent_leads          — leads + latest survey answer flat join
--
-- What this migration does NOT add:
--   - No dashboard_admins table. No new RLS read policies. The v1 dashboard
--     reads via Supabase service role from Next.js Server Components, which
--     bypasses RLS by design. Access is gated at the deployment layer (Vercel
--     Password Protection), not in the database. When the dashboard goes
--     customer-facing or multi-tenant, add a dashboard_admins table + RLS
--     SELECT policies tied to auth.uid() — the tenant_id columns added here
--     already match that future shape.
--   - No GRANT SELECT to anon/authenticated on the new views. They are
--     intentionally only accessible to service_role and the postgres owner.
--
-- Backfill safety:
--   tenant_id is added with DEFAULT 'helvi', so every existing row gets the
--   value automatically. No data migration step required. The default also
--   means future INSERTs from the Helvi landing page (which don't know about
--   tenant_id) keep working unchanged.
-- ============================================================================


-- ── Section 1 ── tenant_id columns ──────────────────────────────────────────
-- Single statement per table so each is rerunnable in isolation if needed.
-- NOT NULL with a DEFAULT means the backfill is implicit and instant.

ALTER TABLE public.events
  ADD COLUMN tenant_id text NOT NULL DEFAULT 'helvi';

ALTER TABLE public.visitors
  ADD COLUMN tenant_id text NOT NULL DEFAULT 'helvi';

ALTER TABLE public.leads
  ADD COLUMN tenant_id text NOT NULL DEFAULT 'helvi';

ALTER TABLE public.survey_responses
  ADD COLUMN tenant_id text NOT NULL DEFAULT 'helvi';


-- ── Section 2 ── access index ───────────────────────────────────────────────
-- Every dashboard query filters by tenant_id and orders by time. This is the
-- one index that matters for the read side.
CREATE INDEX events_tenant_time_idx
  ON public.events (tenant_id, event_time DESC);


-- ── Section 3 ── funnel_daily view ──────────────────────────────────────────
-- One row per (day, event_name, tenant). Distinct-visitor count so two
-- events from the same visitor on the same day count as one.
--
-- Used by: Overview "30-day traffic" line, Funnel "per-step daily" chart.

CREATE OR REPLACE VIEW public.funnel_daily AS
SELECT
  date_trunc('day', event_time)::date  AS day,
  tenant_id,
  event_name,
  count(DISTINCT visitor_id)           AS visitor_count,
  count(*)                             AS event_count
FROM public.events
GROUP BY 1, 2, 3;

COMMENT ON VIEW public.funnel_daily IS
  'Per-day distinct-visitor and raw event counts per event_name. Used by the dashboard Overview + Funnel pages.';


-- ── Section 4 ── funnel_conversion view ─────────────────────────────────────
-- One row per visitor. reached_step is the highest funnel step they ever hit.
-- Step ordering is the canonical Helvi acquisition funnel:
--
--   1 page_viewed              — landed on the site at all
--   2 cta_clicked              — clicked the Hero / inline CTA
--   3 bmi_calculated           — entered height & weight
--   4 survey_started           — opened /survey/:gender
--   5 survey_question_answered — answered at least one survey question
--   6 eligibility_result       — saw the eligible / borderline / low-bmi screen
--   7 lead_created             — submitted email on the eligible screen
--   8 slot_selected            — chose a Cal.com slot
--   9 booking_confirmed        — Cal.com confirmed the booking (webhook)
--
-- Events not in this list (sign_in_*, sign_out) are ignored — they live
-- after the acquisition funnel and don't belong on the conversion chart.
--
-- When a new step is added to the funnel, change ONLY this view. Every
-- dashboard query reads through it.

CREATE OR REPLACE VIEW public.funnel_conversion AS
SELECT
  visitor_id,
  tenant_id,
  max(
    CASE event_name
      WHEN 'page_viewed'              THEN 1
      WHEN 'cta_clicked'              THEN 2
      WHEN 'bmi_calculated'           THEN 3
      WHEN 'survey_started'           THEN 4
      WHEN 'survey_question_answered' THEN 5
      WHEN 'eligibility_result'       THEN 6
      WHEN 'lead_created'             THEN 7
      WHEN 'slot_selected'            THEN 8
      WHEN 'booking_confirmed'        THEN 9
      ELSE 0
    END
  ) AS reached_step,
  min(event_time) AS first_event_at,
  max(event_time) AS last_event_at
FROM public.events
GROUP BY visitor_id, tenant_id;

COMMENT ON VIEW public.funnel_conversion IS
  'Per-visitor furthest step reached, on the canonical 9-step Helvi funnel. Update step ordering here when a new event is added to the funnel.';


-- ── Section 5 ── demographics_summary view ──────────────────────────────────
-- Leads grouped by gender + eligibility + BMI bucket. Buckets follow the
-- WHO BMI categories so stakeholders can read them at a glance.
--
-- Used by: Demographics page (gender split, BMI histogram, eligibility bars).

CREATE OR REPLACE VIEW public.demographics_summary AS
SELECT
  tenant_id,
  gender,
  eligibility,
  -- BMI bucket. WHO categories, plus an "unknown" bucket for null BMI.
  CASE
    WHEN bmi IS NULL          THEN 'unknown'
    WHEN bmi < 18.5           THEN 'underweight'
    WHEN bmi < 25             THEN 'normal'
    WHEN bmi < 30             THEN 'overweight'
    WHEN bmi < 35             THEN 'obese_class_1'
    WHEN bmi < 40             THEN 'obese_class_2'
    ELSE                           'obese_class_3'
  END AS bmi_bucket,
  count(*)                                 AS lead_count,
  count(booking_confirmed_at)              AS booked_count,
  -- Booked rate as percent (0–100), one decimal. NULL when no leads in the
  -- bucket — coalesce in the dashboard if you need 0.
  round(
    100.0 * count(booking_confirmed_at)::numeric
          / nullif(count(*), 0),
    1
  ) AS booked_rate_pct
FROM public.leads
GROUP BY tenant_id, gender, eligibility,
         CASE
           WHEN bmi IS NULL          THEN 'unknown'
           WHEN bmi < 18.5           THEN 'underweight'
           WHEN bmi < 25             THEN 'normal'
           WHEN bmi < 30             THEN 'overweight'
           WHEN bmi < 35             THEN 'obese_class_1'
           WHEN bmi < 40             THEN 'obese_class_2'
           ELSE                           'obese_class_3'
         END;

COMMENT ON VIEW public.demographics_summary IS
  'Leads grouped by gender, eligibility, and WHO BMI bucket. booked_rate_pct is leads-to-confirmed-booking conversion within each cell.';


-- ── Section 6 ── traffic_sources view ───────────────────────────────────────
-- Visitors grouped by first-touch attribution. UTM source/medium/campaign
-- + referrer + landing_page bucketing. Joined back to leads so we can show
-- conversion rate per source ("which UTM source actually produces bookings").
--
-- Used by: Sources page.

CREATE OR REPLACE VIEW public.traffic_sources AS
SELECT
  v.tenant_id,
  coalesce(v.utm_source,   '(direct)') AS utm_source,
  coalesce(v.utm_medium,   '(none)')   AS utm_medium,
  coalesce(v.utm_campaign, '(none)')   AS utm_campaign,
  coalesce(v.referrer_url, '(direct)') AS referrer_url,
  count(DISTINCT v.id)                          AS visitor_count,
  count(DISTINCT l.id)                          AS lead_count,
  count(DISTINCT l.id) FILTER
    (WHERE l.booking_confirmed_at IS NOT NULL)  AS booked_count,
  round(
    100.0 * count(DISTINCT l.id) FILTER (WHERE l.booking_confirmed_at IS NOT NULL)::numeric
          / nullif(count(DISTINCT v.id), 0),
    2
  ) AS visitor_to_booked_pct
FROM public.visitors v
LEFT JOIN public.events e
  ON e.visitor_id = v.id
  AND e.event_name = 'lead_created'
LEFT JOIN public.leads l
  ON l.id = (e.metadata->>'lead_id')::uuid
GROUP BY v.tenant_id,
         coalesce(v.utm_source,   '(direct)'),
         coalesce(v.utm_medium,   '(none)'),
         coalesce(v.utm_campaign, '(none)'),
         coalesce(v.referrer_url, '(direct)');

COMMENT ON VIEW public.traffic_sources IS
  'First-touch attribution grouped by UTM + referrer, with conversion rate from visitor to confirmed booking. Joins visitors → events(lead_created) → leads via metadata.lead_id.';


-- ── Section 7 ── recent_leads view ──────────────────────────────────────────
-- Leads in reverse-chronological order with the visitor's first-touch
-- attribution flattened in. The Leads page paginates over this with a
-- LIMIT / OFFSET; no need for a stored procedure.
--
-- We join to the events table to find the originating visitor_id by
-- matching on the events.metadata->>'lead_id' stamped at lead_created time.

CREATE OR REPLACE VIEW public.recent_leads AS
SELECT
  l.tenant_id,
  l.id                                       AS lead_id,
  l.created_at,
  l.email,
  l.gender,
  l.eligibility,
  l.bmi,
  l.booking_slot_iso,
  l.booking_confirmed_at,
  v.utm_source,
  v.utm_medium,
  v.utm_campaign,
  v.referrer_url,
  v.landing_page,
  v.device_type
FROM public.leads l
LEFT JOIN public.events e
  ON  e.event_name = 'lead_created'
  AND (e.metadata->>'lead_id')::uuid = l.id
LEFT JOIN public.visitors v
  ON v.id = e.visitor_id;

COMMENT ON VIEW public.recent_leads IS
  'Leads flattened with first-touch attribution from the originating visitor row. Used by the dashboard Leads page; expects LIMIT/OFFSET pagination at query time.';


-- ── Section 8 ── grants ─────────────────────────────────────────────────────
-- Explicitly REVOKE on all five views so neither anon nor authenticated can
-- SELECT them directly. The dashboard reads through service_role, which has
-- bypass-RLS and full-access regardless. This is belt-and-suspenders — even
-- if a future migration enables RLS on the underlying tables, these views
-- stay locked down at the role level.

REVOKE ALL ON public.funnel_daily         FROM anon, authenticated;
REVOKE ALL ON public.funnel_conversion    FROM anon, authenticated;
REVOKE ALL ON public.demographics_summary FROM anon, authenticated;
REVOKE ALL ON public.traffic_sources      FROM anon, authenticated;
REVOKE ALL ON public.recent_leads         FROM anon, authenticated;

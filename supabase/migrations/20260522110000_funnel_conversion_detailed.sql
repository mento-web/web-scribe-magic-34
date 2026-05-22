-- ============================================================================
-- 20260522110000_funnel_conversion_detailed.sql
--
-- Adds funnel_conversion_detailed: one row per visitor, joining the
-- existing funnel_conversion view with visitor first-touch attribution
-- and (when present) lead demographics. Powers the sliceable funnel on
-- the dashboard /funnel page.
--
-- Why a separate view: funnel_conversion is intentionally minimal — just
-- the reached step + time bounds — so it stays cheap and uncoupled
-- from the visitor/lead schema. The dashboard needs both the funnel
-- aggregation AND the slicing dimensions in one row, so we fan out
-- here rather than ask the query layer to join three views.
--
-- Semantics:
--   • Always-known columns come from visitors (UTM, device, landing_page,
--     referrer). Filtering by these does not distort the funnel.
--   • Demographic columns (gender, eligibility, bmi_*) come from leads
--     and are NULL when the visitor never reached lead_created. Filtering
--     by a demographic therefore restricts the cohort to "visitors who
--     eventually reached the survey and identified as X" — the funnel
--     top is no longer all visitors. The dashboard surface explains this.
--
-- Idempotent: CREATE OR REPLACE VIEW. Re-applying is safe.
-- ============================================================================


CREATE OR REPLACE VIEW public.funnel_conversion_detailed AS
SELECT
  v.id                                  AS visitor_id,
  v.tenant_id,

  -- ── Funnel position ─────────────────────────────────────────────────
  fc.reached_step,
  fc.first_event_at,
  fc.last_event_at,

  -- ── Always-known first-touch attribution (from visitors row) ───────
  coalesce(v.utm_source,   '(direct)') AS utm_source,
  coalesce(v.utm_medium,   '(none)')   AS utm_medium,
  coalesce(v.utm_campaign, '(none)')   AS utm_campaign,
  v.utm_content,
  v.referrer_url,
  v.landing_page,
  v.device_type,

  -- ── Demographics — only present once a lead exists for this visitor.
  -- NULL means "never reached lead_created, so no demographic data". ───
  l.gender,
  l.eligibility,
  CASE
    WHEN l.bmi IS NULL          THEN NULL
    WHEN l.bmi < 18.5           THEN 'underweight'
    WHEN l.bmi < 25             THEN 'normal'
    WHEN l.bmi < 30             THEN 'overweight'
    WHEN l.bmi < 35             THEN 'obese_class_1'
    WHEN l.bmi < 40             THEN 'obese_class_2'
    ELSE                             'obese_class_3'
  END AS bmi_bucket,
  l.bmi AS bmi_raw

FROM public.visitors v

-- INNER JOIN: only visitors with at least one tracked event appear in the
-- funnel. funnel_conversion is keyed by visitor_id, so this is 1:1.
JOIN public.funnel_conversion fc
  ON  fc.visitor_id = v.id
  AND fc.tenant_id  = v.tenant_id

-- A visitor might have multiple lead_created events in pathological cases
-- (re-submission). Pull the earliest one via LATERAL+LIMIT 1 so we keep
-- the row count at exactly one per visitor.
LEFT JOIN LATERAL (
  SELECT (e.metadata->>'lead_id')::uuid AS lead_id
  FROM public.events e
  WHERE e.visitor_id = v.id
    AND e.event_name = 'lead_created'
  ORDER BY e.event_time ASC
  LIMIT 1
) ev_lead ON true

LEFT JOIN public.leads l
  ON l.id = ev_lead.lead_id;


COMMENT ON VIEW public.funnel_conversion_detailed IS
  'One row per visitor. Joins funnel_conversion with first-touch attribution and (when present) lead demographics. Demographic columns are NULL when the visitor never reached lead_created. Used by the dashboard /funnel filtered view.';


-- Same lockdown as the other dashboard views: service_role only.
REVOKE ALL ON public.funnel_conversion_detailed FROM anon, authenticated;

-- Repair the iCal integration:
--  1. Dedicated external-block RPCs that write inventory_nights only (the
--     `blocks` table CHECK rejects owner_type='airbnb', so claim_block could
--     never acquire Airbnb-imported inventory).
--  2. A transactional reconcile RPC: release an event's old nights + claim the
--     new nights in one statement so a conflict rolls back and preserves the
--     original blocks.
--  3. Column-level anon grant on `units` so the private calendar fields
--     (ical_import_url, ical_export_token, ical_sync_status, ical_last_synced_at,
--     ical_last_attempt_at) cannot be read through the public Data API.

-- External (Airbnb) inventory RPCs — inventory_nights only, never the
-- staff-managed `blocks` table. The partial unique index
-- inventory_nights_active_unique ON (unit_id, stay_date) WHERE is_active
-- enforces one active owner per room per night atomically.

CREATE OR REPLACE FUNCTION public.claim_external_block(
  p_unit_id uuid,
  p_checkin_date date,
  p_checkout_date date,
  p_owner_type text,
  p_source_uid text,
  p_created_by uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_night date;
BEGIN
  IF p_owner_type NOT IN ('airbnb','external') THEN
    RAISE EXCEPTION 'invalid external owner_type: %', p_owner_type;
  END IF;
  v_night := p_checkin_date;
  WHILE v_night < p_checkout_date LOOP
    INSERT INTO public.inventory_nights (
      unit_id, stay_date, owner_type, claim_reason, is_active, created_by
    ) VALUES (
      p_unit_id, v_night, p_owner_type, p_source_uid, true, p_created_by
    );
    v_night := v_night + 1;
  END LOOP;
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.release_external_block(
  p_unit_id uuid,
  p_source_uid text
) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.inventory_nights SET is_active = false
    WHERE unit_id = p_unit_id
      AND claim_reason = p_source_uid
      AND owner_type IN ('airbnb','external')
      AND is_active = true;
$$;

-- Transactional amendment for an imported event: release THIS event's old
-- nights, then claim the new nights. A unique-index conflict on any new night
-- aborts the whole call and rolls back the release, so the original blocks
-- are preserved (failed amendment never leaves the room half-moved).
CREATE OR REPLACE FUNCTION public.reconcile_external_event(
  p_unit_id uuid,
  p_source_uid text,
  p_checkin_date date,
  p_checkout_date date,
  p_owner_type text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_night date;
BEGIN
  IF p_owner_type NOT IN ('airbnb','external') THEN
    RAISE EXCEPTION 'invalid external owner_type: %', p_owner_type;
  END IF;

  -- Release only this event's own nights (explicit event-to-block relationship
  -- via claim_reason = source_uid). Other reservations/blocks/feeds untouched.
  UPDATE public.inventory_nights SET is_active = false
    WHERE unit_id = p_unit_id
      AND claim_reason = p_source_uid
      AND owner_type IN ('airbnb','external')
      AND is_active = true;

  -- Claim new nights. Unique-index violation rolls everything back.
  v_night := p_checkin_date;
  WHILE v_night < p_checkout_date LOOP
    INSERT INTO public.inventory_nights (
      unit_id, stay_date, owner_type, claim_reason, is_active
    ) VALUES (
      p_unit_id, v_night, p_owner_type, p_source_uid, true
    );
    v_night := v_night + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_external_block(uuid, date, date, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_external_block(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reconcile_external_event(uuid, text, date, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_external_block(uuid, date, date, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_external_block(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_external_event(uuid, text, date, date, text) TO service_role;

-- Column-level protection of private calendar/integration fields on `units`.
-- anon may SELECT only the safe public columns; the ical_* fields are
-- unreadable through the public Data API even on published rows. RLS still
-- restricts rows to published, non-archived units. service_role / authenticated
-- (staff) keep full table access.
REVOKE SELECT ON public.units FROM anon;
GRANT SELECT (
  id, unit_code, public_name, property_id, room_type_id, unit_kind, description,
  max_guests, max_adults, max_children, bedrooms, beds, bathrooms, pet_policy,
  accessibility_notes, base_rate_cents, cleaning_fee_cents, is_published,
  is_archived, is_closed, sort_order, primary_image_url, airbnb_listing_id,
  airbnb_url, created_at, updated_at
) ON public.units TO anon;
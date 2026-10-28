CREATE OR REPLACE FUNCTION public.claim_external_block(
  p_unit_id uuid,
  p_checkin_date date,
  p_checkout_date date,
  p_owner_type text,
  p_source_uid text,
  p_created_by uuid DEFAULT NULL
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

REVOKE ALL ON FUNCTION public.claim_external_block(uuid, date, date, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_external_block(uuid, date, date, text, text, uuid) TO service_role;
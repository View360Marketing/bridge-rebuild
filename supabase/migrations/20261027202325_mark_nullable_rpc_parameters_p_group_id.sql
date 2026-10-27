-- acquire_inventory: p_policy_version, p_created_by, p_group_id are nullable
CREATE OR REPLACE FUNCTION public.acquire_inventory(
  p_booking_reference text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_source text,
  p_status text,
  p_currency text,
  p_total_cents int,
  p_policy_version text DEFAULT NULL,
  p_hold_expires_at timestamptz,
  p_checkin_date date,
  p_checkout_date date,
  p_adults int,
  p_children int,
  p_created_by uuid DEFAULT NULL,
  p_units jsonb,
  p_owner_type text,
  p_group_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_reservation_id uuid;
  v_guest_id uuid;
  v_unit jsonb;
  v_night date;
BEGIN
  INSERT INTO public.guests (name, email, phone)
    VALUES (p_guest_name, p_guest_email, p_guest_phone)
    RETURNING id INTO v_guest_id;

  INSERT INTO public.reservations (
    booking_reference, guest_id, source, status, currency, total_cents, paid_cents,
    policy_version, hold_expires_at, checkin_date, checkout_date, adults, children,
    group_id, created_by
  ) VALUES (
    p_booking_reference, v_guest_id, p_source, p_status, p_currency, p_total_cents, 0,
    p_policy_version, p_hold_expires_at, p_checkin_date, p_checkout_date, p_adults, p_children,
    p_group_id, p_created_by
  ) RETURNING id INTO v_reservation_id;

  FOR v_unit IN SELECT * FROM jsonb_array_elements(p_units) LOOP
    INSERT INTO public.reservation_units (
      reservation_id, unit_id, checkin_date, checkout_date, adults, children
    ) VALUES (
      v_reservation_id,
      (v_unit->>'unit_id')::uuid,
      (v_unit->>'checkin_date')::date,
      (v_unit->>'checkout_date')::date,
      COALESCE((v_unit->>'adults')::int, 0),
      COALESCE((v_unit->>'children')::int, 0)
    );

    v_night := (v_unit->>'checkin_date')::date;
    WHILE v_night < (v_unit->>'checkout_date')::date LOOP
      INSERT INTO public.inventory_nights (
        unit_id, stay_date, owner_type, owner_id, claim_reason, is_active, group_id, created_by
      ) VALUES (
        (v_unit->>'unit_id')::uuid,
        v_night,
        p_owner_type,
        v_reservation_id,
        p_status,
        true,
        p_group_id,
        p_created_by
      );
      v_night := v_night + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'reservation_id', v_reservation_id,
    'booking_reference', p_booking_reference,
    'status', p_status,
    'guest_id', v_guest_id
  );
END;
$$;

-- claim_block: p_reason and p_group_id are nullable
CREATE OR REPLACE FUNCTION public.claim_block(
  p_unit_id uuid,
  p_checkin_date date,
  p_checkout_date date,
  p_owner_type text,
  p_reason text DEFAULT NULL,
  p_group_id uuid DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_block_id uuid;
  v_night date;
BEGIN
  INSERT INTO public.blocks (unit_id, checkin_date, checkout_date, owner_type, reason, group_id, created_by)
    VALUES (p_unit_id, p_checkin_date, p_checkout_date, p_owner_type, p_reason, p_group_id, p_created_by)
    RETURNING id INTO v_block_id;

  v_night := p_checkin_date;
  WHILE v_night < p_checkout_date LOOP
    INSERT INTO public.inventory_nights (
      unit_id, stay_date, owner_type, owner_id, claim_reason, is_active, group_id, created_by
    ) VALUES (
      p_unit_id, v_night, p_owner_type, v_block_id, p_reason, true, p_group_id, p_created_by
    );
    v_night := v_night + 1;
  END LOOP;

  RETURN jsonb_build_object('block_id', v_block_id);
END;
$$;
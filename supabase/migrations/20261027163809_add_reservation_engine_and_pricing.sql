-- Stage 2: Reservation engine — pricing, restrictions, groups, blocks, atomic inventory RPCs.

-- Extend reservations -------------------------------------------------------
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS group_id uuid,
  ADD COLUMN IF NOT EXISTS amendment_of uuid,
  ADD COLUMN IF NOT EXISTS adults int NOT NULL DEFAULT 0 CHECK (adults >= 0),
  ADD COLUMN IF NOT EXISTS children int NOT NULL DEFAULT 0 CHECK (children >= 0),
  ADD COLUMN IF NOT EXISTS checkin_date date,
  ADD COLUMN IF NOT EXISTS checkout_date date;

-- Extend inventory_nights ---------------------------------------------------
ALTER TABLE public.inventory_nights
  ADD COLUMN IF NOT EXISTS group_id uuid;

-- Extend quotes -------------------------------------------------------------
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS subtotal_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fees_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxes_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nights int,
  ADD COLUMN IF NOT EXISTS adults int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS children int DEFAULT 0;

-- Extend integration_settings ----------------------------------------------
ALTER TABLE public.integration_settings
  ADD COLUMN IF NOT EXISTS advance_notice_days int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_horizon_days int,
  ADD COLUMN IF NOT EXISTS default_hold_minutes int NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS default_checkin_time text NOT NULL DEFAULT '15:00',
  ADD COLUMN IF NOT EXISTS default_checkout_time text NOT NULL DEFAULT '11:00';

-- rate_plans ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  room_type_id uuid REFERENCES public.room_types(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  base_nightly_cents int NOT NULL DEFAULT 0 CHECK (base_nightly_cents >= 0),
  weekend_nightly_cents int CHECK (weekend_nightly_cents >= 0),
  additional_adult_cents int NOT NULL DEFAULT 0 CHECK (additional_adult_cents >= 0),
  additional_child_cents int NOT NULL DEFAULT 0 CHECK (additional_child_cents >= 0),
  weekend_days int[] NOT NULL DEFAULT '{5,6}',
  is_active boolean NOT NULL DEFAULT true,
  effective_from date,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (room_type_id IS NOT NULL OR unit_id IS NOT NULL)
);
GRANT SELECT ON public.rate_plans TO anon, authenticated;
GRANT ALL ON public.rate_plans TO service_role;
ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active rate plans" ON public.rate_plans
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read rate plans" ON public.rate_plans
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage rate plans" ON public.rate_plans
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- date_rate_overrides -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.date_rate_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_plan_id uuid REFERENCES public.rate_plans(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  stay_date date NOT NULL,
  nightly_cents int NOT NULL CHECK (nightly_cents >= 0),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS date_rate_overrides_plan_date
  ON public.date_rate_overrides (rate_plan_id, stay_date);
CREATE UNIQUE INDEX IF NOT EXISTS date_rate_overrides_unit_date
  ON public.date_rate_overrides (unit_id, stay_date);
GRANT SELECT ON public.date_rate_overrides TO anon, authenticated;
GRANT ALL ON public.date_rate_overrides TO service_role;
ALTER TABLE public.date_rate_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read rate overrides" ON public.date_rate_overrides
  FOR SELECT TO anon USING (true);
CREATE POLICY "staff read rate overrides" ON public.date_rate_overrides
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage rate overrides" ON public.date_rate_overrides
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- restrictions --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  room_type_id uuid REFERENCES public.room_types(id) ON DELETE CASCADE,
  stay_date date NOT NULL,
  min_stay int CHECK (min_stay >= 1),
  max_stay int CHECK (max_stay >= 1),
  closed_to_arrival boolean NOT NULL DEFAULT false,
  closed_to_departure boolean NOT NULL DEFAULT false,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restrictions TO anon, authenticated;
GRANT ALL ON public.restrictions TO service_role;
ALTER TABLE public.restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read restrictions" ON public.restrictions
  FOR SELECT TO anon USING (true);
CREATE POLICY "staff read restrictions" ON public.restrictions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage restrictions" ON public.restrictions
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- fees ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  amount_cents int NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  basis text NOT NULL DEFAULT 'per_stay' CHECK (basis IN ('per_stay','per_night','per_person','per_person_per_night')),
  is_taxable boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fees TO anon, authenticated;
GRANT ALL ON public.fees TO service_role;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active fees" ON public.fees
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read fees" ON public.fees
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage fees" ON public.fees
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- taxes ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  rate_percent numeric NOT NULL CHECK (rate_percent >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.taxes TO anon, authenticated;
GRANT ALL ON public.taxes TO service_role;
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active taxes" ON public.taxes
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read taxes" ON public.taxes
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage taxes" ON public.taxes
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- promotions ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  discount_percent numeric CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_cents int CHECK (discount_cents >= 0),
  max_redemptions int,
  redemptions_count int NOT NULL DEFAULT 0,
  effective_from date,
  effective_to date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active promotions" ON public.promotions
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read promotions" ON public.promotions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage promotions" ON public.promotions
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- policy_versions -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  cancellation_policy jsonb,
  checkin_rules jsonb,
  house_rules jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.policy_versions TO anon, authenticated;
GRANT ALL ON public.policy_versions TO service_role;
ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read active policies" ON public.policy_versions
  FOR SELECT TO anon USING (is_active);
CREATE POLICY "staff read policies" ON public.policy_versions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage policies" ON public.policy_versions
  FOR ALL TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));

-- groups (wedding/retreat allotments) ---------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  group_code text NOT NULL UNIQUE,
  checkin_date date,
  checkout_date date,
  release_date date,
  payment_responsibility text NOT NULL DEFAULT 'organizer' CHECK (payment_responsibility IN ('organizer','guest')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','released','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.groups TO authenticated;
GRANT ALL ON public.groups TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage groups" ON public.groups
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- blocks (maintenance / owner / group blocks metadata) ---------------------
CREATE TABLE IF NOT EXISTS public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  checkin_date date NOT NULL,
  checkout_date date NOT NULL,
  owner_type text NOT NULL CHECK (owner_type IN ('maintenance','owner','group')),
  reason text,
  group_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (checkout_date > checkin_date)
);
GRANT SELECT ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage blocks" ON public.blocks
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- housekeeping_tasks --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  task_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','inspected','complete')),
  assigned_to uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.housekeeping_tasks TO authenticated;
GRANT ALL ON public.housekeeping_tasks TO service_role;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage housekeeping" ON public.housekeeping_tasks
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- idempotency_keys ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  scope text NOT NULL,
  operation text NOT NULL,
  request_hash text NOT NULL,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key, scope)
);
GRANT SELECT, INSERT, UPDATE ON public.idempotency_keys TO authenticated;
GRANT ALL ON public.idempotency_keys TO service_role;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage idempotency" ON public.idempotency_keys
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- RPC: acquire_inventory (atomic reservation + units + nights) --------------
CREATE OR REPLACE FUNCTION public.acquire_inventory(
  p_booking_reference text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_source text,
  p_status text,
  p_currency text,
  p_total_cents int,
  p_policy_version text,
  p_hold_expires_at timestamptz,
  p_checkin_date date,
  p_checkout_date date,
  p_adults int,
  p_children int,
  p_created_by uuid,
  p_units jsonb,
  p_owner_type text,
  p_group_id uuid
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

-- RPC: claim_block (atomic block + nights) ---------------------------------
CREATE OR REPLACE FUNCTION public.claim_block(
  p_unit_id uuid,
  p_checkin_date date,
  p_checkout_date date,
  p_owner_type text,
  p_reason text,
  p_group_id uuid,
  p_created_by uuid
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

-- RPC: release_block (deactivate nights + remove block) --------------------
CREATE OR REPLACE FUNCTION public.release_block(p_block_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.inventory_nights SET is_active = false
    WHERE owner_id = p_block_id AND owner_type IN ('maintenance','owner','group') AND is_active = true;
  DELETE FROM public.blocks WHERE id = p_block_id;
$$;

-- RPC: release_reservation (deactivate a reservation's nights) ------------
CREATE OR REPLACE FUNCTION public.release_reservation(p_reservation_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.inventory_nights SET is_active = false
    WHERE owner_id = p_reservation_id AND owner_type = 'reservation' AND is_active = true;
$$;

-- RPC: amend_reservation (atomic swap of dates/units; rollback on conflict) -
CREATE OR REPLACE FUNCTION public.amend_reservation(
  p_reservation_id uuid,
  p_new_units jsonb,
  p_new_checkin date,
  p_new_checkout date,
  p_new_total_cents int,
  p_adults int,
  p_children int,
  p_created_by uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_unit jsonb;
  v_night date;
BEGIN
  -- Release old inventory (rolled back if new allocation fails)
  UPDATE public.inventory_nights SET is_active = false
    WHERE owner_id = p_reservation_id AND owner_type = 'reservation' AND is_active = true;

  DELETE FROM public.reservation_units WHERE reservation_id = p_reservation_id;

  FOR v_unit IN SELECT * FROM jsonb_array_elements(p_new_units) LOOP
    INSERT INTO public.reservation_units (
      reservation_id, unit_id, checkin_date, checkout_date, adults, children
    ) VALUES (
      p_reservation_id,
      (v_unit->>'unit_id')::uuid,
      (v_unit->>'checkin_date')::date,
      (v_unit->>'checkout_date')::date,
      COALESCE((v_unit->>'adults')::int, 0),
      COALESCE((v_unit->>'children')::int, 0)
    );

    v_night := (v_unit->>'checkin_date')::date;
    WHILE v_night < (v_unit->>'checkout_date')::date LOOP
      INSERT INTO public.inventory_nights (
        unit_id, stay_date, owner_type, owner_id, claim_reason, is_active, created_by
      ) VALUES (
        (v_unit->>'unit_id')::uuid,
        v_night,
        'reservation',
        p_reservation_id,
        'confirmed',
        true,
        p_created_by
      );
      v_night := v_night + 1;
    END LOOP;
  END LOOP;

  UPDATE public.reservations
    SET checkin_date = p_new_checkin, checkout_date = p_new_checkout,
        total_cents = p_new_total_cents, adults = p_adults, children = p_children,
        version = version + 1, updated_at = now()
    WHERE id = p_reservation_id;

  RETURN jsonb_build_object('reservation_id', p_reservation_id, 'status', 'amended');
END;
$$;

-- RPC: group_pickup (transfer a group night claim to a reservation) --------
CREATE OR REPLACE FUNCTION public.group_pickup(
  p_group_id uuid,
  p_unit_id uuid,
  p_checkin_date date,
  p_checkout_date date,
  p_booking_reference text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_adults int,
  p_children int,
  p_created_by uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_reservation_id uuid;
  v_guest_id uuid;
  v_night date;
BEGIN
  -- Verify the group owns these nights
  PERFORM 1 FROM public.inventory_nights
    WHERE unit_id = p_unit_id AND group_id = p_group_id
      AND owner_type = 'group' AND is_active = true
      AND stay_date >= p_checkin_date AND stay_date < p_checkout_date;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'group_inventory_unavailable';
  END IF;

  INSERT INTO public.guests (name, email, phone)
    VALUES (p_guest_name, p_guest_email, p_guest_phone)
    RETURNING id INTO v_guest_id;

  INSERT INTO public.reservations (
    booking_reference, guest_id, source, status, currency, total_cents,
    checkin_date, checkout_date, adults, children, group_id, created_by
  ) VALUES (
    p_booking_reference, v_guest_id, 'group', 'confirmed', 'USD', 0,
    p_checkin_date, p_checkout_date, p_adults, p_children, p_group_id, p_created_by
  ) RETURNING id INTO v_reservation_id;

  -- Transfer the group nights to the reservation (same rows, new owner)
  v_night := p_checkin_date;
  WHILE v_night < p_checkout_date LOOP
    UPDATE public.inventory_nights
      SET owner_type = 'reservation', owner_id = v_reservation_id
      WHERE unit_id = p_unit_id AND stay_date = v_night
        AND group_id = p_group_id AND owner_type = 'group' AND is_active = true;
    v_night := v_night + 1;
  END LOOP;

  RETURN jsonb_build_object('reservation_id', v_reservation_id, 'booking_reference', p_booking_reference);
END;
$$;

GRANT EXECUTE ON FUNCTION public.acquire_inventory(text,text,text,text,text,text,text,int,text,timestamptz,date,date,int,int,uuid,jsonb,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_block(uuid,date,date,text,text,uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_block(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_reservation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.amend_reservation(uuid,jsonb,date,date,int,int,int,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.group_pickup(uuid,uuid,date,date,text,text,text,text,int,int,uuid) TO authenticated;
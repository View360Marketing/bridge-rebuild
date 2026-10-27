-- Stage 1: Foundation schema for The Bridges lodging booking & property management system.
-- Roles + helpers -----------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('super_admin','manager','front_desk','housekeeping','read_only');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','manager','front_desk','housekeeping','read_only'))
$$;
CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','manager'))
$$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- properties ----------------------------------------------------------------
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  timezone text NOT NULL DEFAULT 'America/Chicago',
  currency text NOT NULL DEFAULT 'USD',
  contact_phone text,
  contact_email text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read properties" ON public.properties FOR SELECT TO anon USING (true);
CREATE POLICY "staff read properties" ON public.properties FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers update properties" ON public.properties
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers delete properties" ON public.properties
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

-- room_types ----------------------------------------------------------------
CREATE TABLE public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  default_max_guests int NOT NULL DEFAULT 2 CHECK (default_max_guests >= 0),
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.room_types TO anon, authenticated;
GRANT ALL ON public.room_types TO service_role;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read room types" ON public.room_types FOR SELECT TO anon USING (true);
CREATE POLICY "staff read room types" ON public.room_types FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers manage room types" ON public.room_types
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers update room types" ON public.room_types
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers delete room types" ON public.room_types
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

-- units (physical rooms) ----------------------------------------------------
CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_code text NOT NULL UNIQUE,
  public_name text,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  room_type_id uuid REFERENCES public.room_types(id) ON DELETE SET NULL,
  unit_kind text NOT NULL DEFAULT 'room' CHECK (unit_kind IN ('room','cabin','rv_site','suite')),
  description text,
  max_guests int NOT NULL DEFAULT 2 CHECK (max_guests >= 0),
  max_adults int NOT NULL DEFAULT 2 CHECK (max_adults >= 0),
  max_children int NOT NULL DEFAULT 0 CHECK (max_children >= 0),
  bedrooms int NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
  beds int NOT NULL DEFAULT 1 CHECK (beds >= 0),
  bathrooms int NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
  pet_policy text NOT NULL DEFAULT 'no_pets' CHECK (pet_policy IN ('no_pets','pets_allowed','pets_negotiable')),
  accessibility_notes text,
  base_rate_cents int NOT NULL DEFAULT 0 CHECK (base_rate_cents >= 0),
  cleaning_fee_cents int NOT NULL DEFAULT 0 CHECK (cleaning_fee_cents >= 0),
  is_published boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  is_closed boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.units TO anon, authenticated;
GRANT ALL ON public.units TO service_role;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read published units" ON public.units
  FOR SELECT TO anon USING (is_published AND NOT is_archived);
CREATE POLICY "staff read units" ON public.units
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers insert units" ON public.units
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers update units" ON public.units
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers delete units" ON public.units
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

-- unit_media ----------------------------------------------------------------
CREATE TABLE public.unit_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.unit_media TO anon, authenticated;
GRANT ALL ON public.unit_media TO service_role;
ALTER TABLE public.unit_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read unit media" ON public.unit_media FOR SELECT TO anon USING (true);
CREATE POLICY "staff read unit media" ON public.unit_media FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers insert unit media" ON public.unit_media
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers update unit media" ON public.unit_media
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers delete unit media" ON public.unit_media
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

-- inventory_nights: one active owner per (unit, night) ----------------------
CREATE TABLE public.inventory_nights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  stay_date date NOT NULL,
  owner_type text NOT NULL CHECK (owner_type IN ('reservation','hold','group','owner','maintenance','external')),
  owner_id uuid,
  claim_reason text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.inventory_nights TO authenticated;
GRANT ALL ON public.inventory_nights TO service_role;
ALTER TABLE public.inventory_nights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read inventory" ON public.inventory_nights
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "managers write inventory" ON public.inventory_nights
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers update inventory" ON public.inventory_nights
  FOR UPDATE TO authenticated USING (public.is_manager(auth.uid())) WITH CHECK (public.is_manager(auth.uid()));
CREATE POLICY "managers delete inventory" ON public.inventory_nights
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));
CREATE UNIQUE INDEX inventory_nights_active_unique
  ON public.inventory_nights (unit_id, stay_date) WHERE is_active;

-- guests --------------------------------------------------------------------
CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage guests" ON public.guests
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- reservations --------------------------------------------------------------
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text NOT NULL UNIQUE,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'direct',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','requested','held','pending_payment','confirmed','checked_in','checked_out','cancelled','expired','no_show','exception_needs_review')),
  currency text NOT NULL DEFAULT 'USD',
  total_cents int NOT NULL DEFAULT 0,
  paid_cents int NOT NULL DEFAULT 0,
  policy_version text,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage reservations" ON public.reservations
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- reservation_units ---------------------------------------------------------
CREATE TABLE public.reservation_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  checkin_date date NOT NULL,
  checkout_date date NOT NULL,
  adults int NOT NULL DEFAULT 0 CHECK (adults >= 0),
  children int NOT NULL DEFAULT 0 CHECK (children >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (checkout_date > checkin_date)
);
GRANT SELECT ON public.reservation_units TO authenticated;
GRANT ALL ON public.reservation_units TO service_role;
ALTER TABLE public.reservation_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage reservation units" ON public.reservation_units
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- quotes / quote_lines ------------------------------------------------------
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
  expires_at timestamptz,
  total_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  policy_version text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.quote_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  label text NOT NULL,
  amount_cents int NOT NULL DEFAULT 0,
  kind text NOT NULL DEFAULT 'room',
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
GRANT SELECT ON public.quote_lines TO authenticated;
GRANT ALL ON public.quote_lines TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage quotes" ON public.quotes
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff manage quote lines" ON public.quote_lines
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- audit_events (append-only) ------------------------------------------------
CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before jsonb,
  after jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read audit" ON public.audit_events
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff insert audit" ON public.audit_events
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- integration_settings (singleton) ------------------------------------------
CREATE TABLE public.integration_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  inventory_authority text NOT NULL DEFAULT 'UNRESOLVED' CHECK (inventory_authority IN ('UNRESOLVED','direct_only','pms_authority','request_to_book')),
  expected_room_count int NOT NULL DEFAULT 33,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'America/Chicago',
  bootstrap_completed_at timestamptz,
  instant_booking_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_settings TO authenticated;
GRANT ALL ON public.integration_settings TO service_role;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read settings" ON public.integration_settings
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "admin update settings" ON public.integration_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
INSERT INTO public.integration_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- storage: unit-media bucket access -----------------------------------------
CREATE POLICY "anon read unit media bucket" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'unit-media');
CREATE POLICY "staff read unit media bucket" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'unit-media');
CREATE POLICY "staff upload unit media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND bucket_id = 'unit-media');
CREATE POLICY "staff update unit media" ON storage.objects
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()) AND bucket_id = 'unit-media')
  WITH CHECK (public.is_staff(auth.uid()) AND bucket_id = 'unit-media');
CREATE POLICY "staff delete unit media" ON storage.objects
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()) AND bucket_id = 'unit-media');
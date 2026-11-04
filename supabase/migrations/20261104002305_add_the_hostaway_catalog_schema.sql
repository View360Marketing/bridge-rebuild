BEGIN;
SELECT pg_advisory_xact_lock(hashtext('bridges-hostaway-catalog'));

ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS hostaway_listing_id text,
  ADD COLUMN IF NOT EXISTS hostaway_source_url text,
  ADD COLUMN IF NOT EXISTS hostaway_record_kind text,
  ADD COLUMN IF NOT EXISTS hostaway_review_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hostaway_media_expected integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hostaway_media_copied integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS units_hostaway_listing_id_unique ON public.units(hostaway_listing_id);
ALTER TABLE public.unit_media ADD COLUMN IF NOT EXISTS hostaway_image_id text;
CREATE UNIQUE INDEX IF NOT EXISTS unit_media_hostaway_image_unique ON public.unit_media(unit_id,hostaway_image_id);

CREATE TABLE IF NOT EXISTS public.hostaway_catalog (
  listing_id text PRIMARY KEY,
  unit_id uuid NOT NULL UNIQUE REFERENCES public.units(id) ON DELETE RESTRICT,
  source jsonb NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hostaway_catalog ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.hostaway_catalog FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.hostaway_catalog TO authenticated;
GRANT ALL ON public.hostaway_catalog TO service_role;
DROP POLICY IF EXISTS "admins read hostaway catalog" ON public.hostaway_catalog;
CREATE POLICY "admins read hostaway catalog" ON public.hostaway_catalog
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_hostaway_booking_readiness()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.hostaway_listing_id IS NOT NULL AND
     (NEW.hostaway_listing_id IS DISTINCT FROM OLD.hostaway_listing_id OR
      NEW.hostaway_record_kind IS DISTINCT FROM OLD.hostaway_record_kind) THEN
    RAISE EXCEPTION 'Hostaway source identity and package type cannot be reassigned';
  END IF;
  IF NEW.hostaway_record_kind = 'rv_package_offer' THEN
    IF NEW.is_published OR NOT NEW.is_closed OR NOT NEW.hostaway_review_required THEN
      RAISE EXCEPTION 'RV packages require shared site allocation before direct booking';
    END IF;
  ELSIF NEW.hostaway_listing_id IS NOT NULL AND NEW.hostaway_review_required
        AND (NEW.is_published OR NOT NEW.is_closed) THEN
    RAISE EXCEPTION 'Review and approval required before publishing or opening direct booking';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_hostaway_booking_readiness() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS units_hostaway_readiness ON public.units;
CREATE TRIGGER units_hostaway_readiness BEFORE INSERT OR UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.guard_hostaway_booking_readiness();

CREATE OR REPLACE FUNCTION public.guard_hostaway_reservation_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF NEW.unit_id IS NULL THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.units u WHERE u.id = NEW.unit_id
              AND u.hostaway_record_kind = 'rv_package_offer') THEN
    RAISE EXCEPTION 'RV package offers require shared site allocation before booking';
  END IF;
  IF EXISTS (SELECT 1 FROM public.units u WHERE u.id = NEW.unit_id
              AND u.hostaway_listing_id IS NOT NULL AND u.hostaway_review_required
              AND (u.is_published OR NOT u.is_closed)) THEN
    RAISE EXCEPTION 'Review and approval required before booking this Hostaway listing';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_hostaway_reservation_assignment() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS reservation_units_hostaway_readiness ON public.reservation_units;
CREATE TRIGGER reservation_units_hostaway_readiness BEFORE INSERT OR UPDATE ON public.reservation_units
  FOR EACH ROW EXECUTE FUNCTION public.guard_hostaway_reservation_assignment();

COMMIT;
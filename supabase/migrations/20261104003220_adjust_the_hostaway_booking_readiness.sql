BEGIN;
SELECT pg_advisory_xact_lock(hashtext('bridges-hostaway-guard-update-v2'));

DROP TRIGGER IF EXISTS units_hostaway_readiness ON public.units;

CREATE OR REPLACE FUNCTION public.guard_hostaway_booking_readiness()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.hostaway_listing_id IS NOT NULL AND
     (NEW.hostaway_listing_id IS DISTINCT FROM OLD.hostaway_listing_id OR
      NEW.hostaway_record_kind IS DISTINCT FROM OLD.hostaway_record_kind) THEN
    RAISE EXCEPTION 'Hostaway source identity and package type cannot be reassigned';
  END IF;
  IF NEW.hostaway_record_kind = 'rv_package_offer' THEN
    IF NOT NEW.is_closed OR NOT NEW.hostaway_review_required THEN
      RAISE EXCEPTION 'RV packages require shared site allocation before direct booking';
    END IF;
  ELSIF NEW.hostaway_listing_id IS NOT NULL AND NEW.hostaway_review_required
        AND NOT NEW.is_closed THEN
    RAISE EXCEPTION 'Review and approval required before opening direct booking';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER units_hostaway_readiness BEFORE INSERT OR UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.guard_hostaway_booking_readiness();

COMMIT;
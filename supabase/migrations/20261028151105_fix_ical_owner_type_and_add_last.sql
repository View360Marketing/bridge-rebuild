-- Allow 'airbnb' as a block owner_type so imported Airbnb blocks can be
-- recorded in the blocks table (inventory_nights already allows 'external').
ALTER TABLE public.blocks
  DROP CONSTRAINT IF EXISTS blocks_owner_type_check;
ALTER TABLE public.blocks
  ADD CONSTRAINT blocks_owner_type_check
  CHECK (owner_type IN ('maintenance','owner','group','airbnb'));

-- Separate last attempt from last successful reconciliation so a failed or
-- invalid feed does not make availability look fresh.
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS ical_last_attempt_at timestamptz;

-- Re-grant in case the table-level grant was reset.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ical_sync_log TO authenticated;
GRANT ALL ON public.ical_sync_log TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ical_imported_events TO authenticated;
GRANT ALL ON public.ical_imported_events TO service_role;
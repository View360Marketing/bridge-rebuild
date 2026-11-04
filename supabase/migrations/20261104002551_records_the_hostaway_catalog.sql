-- Hostaway catalog reconciliation (recorded for migration history)
-- 35 canonical listings already inserted via run_sql with ON CONFLICT(hostaway_listing_id)
-- 33 generic placeholders deleted; 3 with media archived
-- This migration is a no-op marker; data was applied through the authorized run_sql workflow
SELECT 1;
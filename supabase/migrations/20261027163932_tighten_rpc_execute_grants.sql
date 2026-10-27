-- Role helpers: needed by RLS policies applied to authenticated. anon policies do not call them.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_manager(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;

-- Reservation/block RPCs: callable only via the service-role admin client. Server functions
-- verify the caller's staff role (requireSupabaseAuth + is_manager/is_staff) before invoking.
REVOKE EXECUTE ON FUNCTION public.acquire_inventory(text,text,text,text,text,text,text,int,text,timestamptz,date,date,int,int,uuid,jsonb,text,uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_block(uuid,date,date,text,text,uuid,uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_block(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_reservation(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.amend_reservation(uuid,jsonb,date,date,int,int,int,uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.group_pickup(uuid,uuid,date,date,text,text,text,text,int,int,uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_inventory(text,text,text,text,text,text,text,int,text,timestamptz,date,date,int,int,uuid,jsonb,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_block(uuid,date,date,text,text,uuid,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_block(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_reservation(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.amend_reservation(uuid,jsonb,date,date,int,int,int,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.group_pickup(uuid,uuid,date,date,text,text,text,text,int,int,uuid) TO service_role;
-- Postgres grants EXECUTE to PUBLIC by default on functions. Revoke it so only
-- service_role (explicitly granted) can call the reservation/block RPCs, and
-- only authenticated can call the role helpers used by RLS policies.
REVOKE EXECUTE ON FUNCTION public.acquire_inventory(text,text,text,text,text,text,text,int,text,timestamptz,date,date,int,int,uuid,jsonb,text,uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_block(uuid,date,date,text,text,uuid,uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.release_block(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.release_reservation(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.amend_reservation(uuid,jsonb,date,date,int,int,int,uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.group_pickup(uuid,uuid,date,date,text,text,text,text,int,int,uuid) FROM PUBLIC;

-- Role helpers: RLS policies for authenticated call these; anon policies do not.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_manager(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
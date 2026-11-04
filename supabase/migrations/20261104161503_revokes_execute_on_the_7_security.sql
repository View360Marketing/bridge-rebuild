BEGIN;
SELECT pg_advisory_xact_lock(hashtext('bridges-sec-definer-revoke-authenticated'));

-- Revoke direct REST/RPC execution from all unprivileged roles.
-- These SECURITY DEFINER helpers are used inside RLS policies and from
-- server code (service_role / admin client). They must NOT be callable
-- by authenticated users via /rest/v1/rpc/... (role enumeration).
REVOKE EXECUTE ON FUNCTION public.count_active_super_admins() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_manager(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_ben_super_admin() FROM PUBLIC, anon, authenticated;

-- Service role (server admin client) still needs to call these for authz checks.
GRANT EXECUTE ON FUNCTION public.count_active_super_admins() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.protect_ben_super_admin() TO service_role;

COMMIT;
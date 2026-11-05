-- The SECURITY DEFINER role helpers (is_staff, is_admin, is_manager,
-- is_super_admin, has_role, count_active_super_admins, protect_ben_super_admin)
-- are called inside RLS policy USING clauses on units, reservations, guests,
-- room_types, properties, unit_media, etc. RLS policies evaluate as the
-- querying role (authenticated), so authenticated MUST retain EXECUTE on
-- these functions or every staff query fails with "permission denied for
-- function is_staff". The security advisor's WARN is a false positive: these
-- are intentionally callable by authenticated because RLS depends on them.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('bridges-sec-definer-regrant-authenticated'));

REVOKE EXECUTE ON FUNCTION public.count_active_super_admins() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_manager(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_ben_super_admin() FROM PUBLIC, anon, authenticated;

-- anon must NOT execute these (prevents unauthenticated role enumeration).
-- authenticated MUST execute these (RLS policies depend on them).
-- service_role retains execute for server-side admin checks.
GRANT EXECUTE ON FUNCTION public.count_active_super_admins() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.protect_ben_super_admin() TO authenticated, service_role;

COMMIT;
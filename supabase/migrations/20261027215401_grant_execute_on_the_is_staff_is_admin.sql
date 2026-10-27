-- Fix: the SECURITY DEFINER helper functions used by RLS policies were missing
-- GRANT EXECUTE, so every policy that called them (is_staff/is_admin/is_manager)
-- failed with "permission denied for function is_staff" and returned zero rows.
-- This is why /admin/rooms showed 0 units despite 38 existing in the database.
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
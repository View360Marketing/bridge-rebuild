-- reservation_amount_due is a server-side helper called only through the service role.
-- Revoke the default PUBLIC execute privilege that PostgreSQL grants to new functions.
REVOKE EXECUTE ON FUNCTION public.reservation_amount_due FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reservation_amount_due FROM anon;
REVOKE EXECUTE ON FUNCTION public.reservation_amount_due FROM authenticated;
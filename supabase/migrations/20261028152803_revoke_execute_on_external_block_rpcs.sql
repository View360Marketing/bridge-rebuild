REVOKE EXECUTE ON FUNCTION public.claim_external_block(uuid, date, date, text, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_external_block(uuid, date, date, text, text, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.release_external_block(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.release_external_block(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.reconcile_external_event(uuid, text, date, date, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reconcile_external_event(uuid, text, date, date, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
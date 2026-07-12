
-- 1) notifications: deny client INSERT (only service_role via edge functions)
CREATE POLICY "No client inserts on notifications"
  ON public.notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- 2) sms_subscribers: replace public self-register with authenticated-only
DROP POLICY IF EXISTS "Public can self-register" ON public.sms_subscribers;
CREATE POLICY "Authenticated can self-register"
  ON public.sms_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (
    source = ANY (ARRAY['web'::text, 'missed_call'::text])
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 3) sms_templates: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated read templates" ON public.sms_templates;
CREATE POLICY "Admins read templates"
  ON public.sms_templates FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4) SECURITY DEFINER function execute grants: revoke from anon/authenticated where not needed
REVOKE EXECUTE ON FUNCTION public.admin_assign_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) FROM PUBLIC, anon;

-- has_role is called from RLS policies; policies evaluate as the calling role, so authenticated
-- needs to invoke it. Grant back only that specific function to authenticated.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- ensure_current_user_profile is invoked by signed-in clients to repair their profile
GRANT EXECUTE ON FUNCTION public.ensure_current_user_profile(text, text, text, public.app_role) TO authenticated;

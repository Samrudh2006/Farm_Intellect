-- Fix 1: Add WITH CHECK to consultations expert update policy
DROP POLICY IF EXISTS "Experts can update assigned consultations" ON public.consultations;
CREATE POLICY "Experts can update assigned consultations"
ON public.consultations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id)
WITH CHECK (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id);

-- Fix 2: otp_codes — explicit deny-all policies for authenticated users.
-- Edge functions use the service role and bypass RLS; no client should ever read/write this table.
DROP POLICY IF EXISTS "Deny all select on otp_codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Deny all insert on otp_codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Deny all update on otp_codes" ON public.otp_codes;
DROP POLICY IF EXISTS "Deny all delete on otp_codes" ON public.otp_codes;

CREATE POLICY "Deny all select on otp_codes" ON public.otp_codes
  FOR SELECT TO authenticated, anon USING (false);
CREATE POLICY "Deny all insert on otp_codes" ON public.otp_codes
  FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Deny all update on otp_codes" ON public.otp_codes
  FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "Deny all delete on otp_codes" ON public.otp_codes
  FOR DELETE TO authenticated, anon USING (false);

-- Fix 4: Realtime authorization — restrict realtime.messages so users can only
-- subscribe to their own per-user notification topics (e.g. "notifications:<uid>").
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can receive own notification topic" ON realtime.messages;
CREATE POLICY "Users can receive own notification topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = ('notifications:' || auth.uid()::text)
  OR realtime.topic() = auth.uid()::text
);
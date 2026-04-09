-- Fix: Expert consultation policies - ensure they check expert_id ownership
DROP POLICY IF EXISTS "Experts can view assigned consultations" ON public.consultations;
CREATE POLICY "Experts can view assigned consultations" ON public.consultations
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id
);

DROP POLICY IF EXISTS "Experts can update assigned consultations" ON public.consultations;
CREATE POLICY "Experts can update assigned consultations" ON public.consultations
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id
);

-- Fix: Ensure no user INSERT on notifications (system-only via service role)
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
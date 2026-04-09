-- Fix: Restrict merchant access to farmer roles to only those with active orders
DROP POLICY IF EXISTS "Merchants can view farmer roles" ON public.user_roles;

CREATE POLICY "Merchants can view farmer roles with orders" ON public.user_roles
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'merchant'::app_role)
  AND role = 'farmer'::app_role
  AND EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.merchant_id = auth.uid()
    AND orders.farmer_id = user_roles.user_id
  )
);

-- Fix: Remove user self-insert on notifications (should be system-generated only)
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

-- Add index on otp_codes for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_purpose ON public.otp_codes (phone, purpose, used_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_created_at ON public.otp_codes (created_at);
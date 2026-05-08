-- Paid plans + field operations + scheduling + webhook audit placeholders

ALTER TABLE public.sms_subscribers
  ADD COLUMN IF NOT EXISTS farmer_type text NOT NULL DEFAULT 'self',
  ADD COLUMN IF NOT EXISTS village text,
  ADD COLUMN IF NOT EXISTS gram_panchayat text,
  ADD COLUMN IF NOT EXISTS sevak_id uuid,
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS monthly_sms_quota integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS sms_sent_this_month integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_cycle_start date NOT NULL DEFAULT date_trunc('month', now())::date,
  ADD COLUMN IF NOT EXISTS plan_started_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.sms_subscribers
  DROP CONSTRAINT IF EXISTS sms_subscribers_farmer_type_check,
  ADD CONSTRAINT sms_subscribers_farmer_type_check CHECK (farmer_type IN ('self', 'sevak_registered'));

ALTER TABLE public.sms_subscribers
  DROP CONSTRAINT IF EXISTS sms_subscribers_plan_tier_check,
  ADD CONSTRAINT sms_subscribers_plan_tier_check CHECK (plan_tier IN ('free', 'basic', 'pro', 'institutional'));

ALTER TABLE public.sms_subscribers
  DROP CONSTRAINT IF EXISTS sms_subscribers_plan_status_check,
  ADD CONSTRAINT sms_subscribers_plan_status_check CHECK (plan_status IN ('trial', 'active', 'paused', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_sms_subscribers_plan_tier ON public.sms_subscribers(plan_tier);
CREATE INDEX IF NOT EXISTS idx_sms_subscribers_plan_status ON public.sms_subscribers(plan_status);
CREATE INDEX IF NOT EXISTS idx_sms_subscribers_sevak_id ON public.sms_subscribers(sevak_id);

CREATE OR REPLACE FUNCTION public.apply_sms_plan_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.plan_tier = 'free' THEN
    NEW.monthly_sms_quota := 4;
  ELSIF NEW.plan_tier = 'basic' THEN
    NEW.monthly_sms_quota := 12;
  ELSIF NEW.plan_tier = 'pro' THEN
    NEW.monthly_sms_quota := 30;
  ELSE
    NEW.monthly_sms_quota := 120;
  END IF;

  IF NEW.plan_status IS NULL OR NEW.plan_status = '' THEN
    NEW.plan_status := 'active';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sms_plan_defaults ON public.sms_subscribers;
CREATE TRIGGER trg_sms_plan_defaults
BEFORE INSERT OR UPDATE OF plan_tier ON public.sms_subscribers
FOR EACH ROW EXECUTE FUNCTION public.apply_sms_plan_defaults();

CREATE OR REPLACE FUNCTION public.increment_sms_counter(subscriber_id_input uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sms_subscribers
  SET sms_sent_this_month = sms_sent_this_month + 1
  WHERE id = subscriber_id_input;
END;
$$;

CREATE TABLE IF NOT EXISTS public.sms_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  kind text NOT NULL,
  template_key text NOT NULL,
  day_of_week integer NOT NULL,
  send_time time NOT NULL DEFAULT '06:00',
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_schedules_day_check CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT sms_schedules_kind_check CHECK (kind IN ('weather', 'market', 'crop', 'scheme'))
);

CREATE TRIGGER trg_sms_schedules_updated
BEFORE UPDATE ON public.sms_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.sms_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access sms_schedules" ON public.sms_schedules;
CREATE POLICY "Admins full access sms_schedules" ON public.sms_schedules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.sms_schedules (name, kind, template_key, day_of_week, send_time, active)
VALUES
  ('monday-weather', 'weather', 'weather_default', 1, '06:00', true),
  ('wednesday-crop', 'crop', 'crop_default', 3, '06:30', true),
  ('friday-market', 'market', 'market_default', 5, '07:00', true),
  ('sunday-scheme', 'scheme', 'scheme_default', 0, '08:00', true)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  project_url text := current_setting('app.settings.supabase_url', true);
BEGIN
  IF to_regnamespace('cron') IS NOT NULL AND to_regnamespace('net') IS NOT NULL AND project_url IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sms-weather-mon') THEN
      PERFORM cron.unschedule('sms-weather-mon');
    END IF;
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sms-crop-wed') THEN
      PERFORM cron.unschedule('sms-crop-wed');
    END IF;
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sms-market-fri') THEN
      PERFORM cron.unschedule('sms-market-fri');
    END IF;
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sms-scheme-sun') THEN
      PERFORM cron.unschedule('sms-scheme-sun');
    END IF;

    PERFORM cron.schedule(
      'sms-weather-mon',
      '0 6 * * 1',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := '{"Content-Type":"application/json","Authorization":"Bearer PLACEHOLDER_SERVICE_ROLE"}'::jsonb,
          body := '{"kind":"weather","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher')
    );

    PERFORM cron.schedule(
      'sms-crop-wed',
      '30 6 * * 3',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := '{"Content-Type":"application/json","Authorization":"Bearer PLACEHOLDER_SERVICE_ROLE"}'::jsonb,
          body := '{"kind":"crop","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher')
    );

    PERFORM cron.schedule(
      'sms-market-fri',
      '0 7 * * 5',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := '{"Content-Type":"application/json","Authorization":"Bearer PLACEHOLDER_SERVICE_ROLE"}'::jsonb,
          body := '{"kind":"market","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher')
    );

    PERFORM cron.schedule(
      'sms-scheme-sun',
      '0 8 * * 0',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := '{"Content-Type":"application/json","Authorization":"Bearer PLACEHOLDER_SERVICE_ROLE"}'::jsonb,
          body := '{"kind":"scheme","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher')
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.billing_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES public.sms_subscribers(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'individual',
  plan_tier text NOT NULL DEFAULT 'free',
  billing_status text NOT NULL DEFAULT 'placeholder',
  monthly_budget_paise integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_accounts_type_check CHECK (account_type IN ('individual', 'panchayat', 'fpo', 'enterprise')),
  CONSTRAINT billing_accounts_plan_check CHECK (plan_tier IN ('free', 'basic', 'pro', 'institutional'))
);

CREATE INDEX IF NOT EXISTS idx_billing_accounts_subscriber_id ON public.billing_accounts(subscriber_id);

CREATE TRIGGER trg_billing_accounts_updated
BEFORE UPDATE ON public.billing_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.billing_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access billing_accounts" ON public.billing_accounts;
CREATE POLICY "Admins full access billing_accounts" ON public.billing_accounts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_account_id uuid REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
  amount_paise integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  payment_provider text NOT NULL DEFAULT 'placeholder',
  provider_ref text,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CONSTRAINT payment_status_check CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  CONSTRAINT payment_provider_check CHECK (payment_provider IN ('placeholder', 'razorpay', 'cashfree', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_account ON public.payment_transactions(billing_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access payment_transactions" ON public.payment_transactions;
CREATE POLICY "Admins full access payment_transactions" ON public.payment_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.missed_call_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  provider text NOT NULL DEFAULT 'placeholder',
  provider_call_id text,
  status text NOT NULL DEFAULT 'received',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  subscriber_id uuid REFERENCES public.sms_subscribers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT missed_call_status_check CHECK (status IN ('received', 'processed', 'ignored', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_missed_call_events_phone ON public.missed_call_events(phone);
CREATE INDEX IF NOT EXISTS idx_missed_call_events_status ON public.missed_call_events(status);

ALTER TABLE public.missed_call_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access missed_call_events" ON public.missed_call_events;
CREATE POLICY "Admins full access missed_call_events" ON public.missed_call_events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.sms_opt_out_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES public.sms_subscribers(id) ON DELETE SET NULL,
  phone text NOT NULL,
  keyword text NOT NULL,
  source text NOT NULL DEFAULT 'sms_reply',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_opt_out_events_phone ON public.sms_opt_out_events(phone);
CREATE INDEX IF NOT EXISTS idx_sms_opt_out_events_subscriber ON public.sms_opt_out_events(subscriber_id);

ALTER TABLE public.sms_opt_out_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access sms_opt_out_events" ON public.sms_opt_out_events;
CREATE POLICY "Admins full access sms_opt_out_events" ON public.sms_opt_out_events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

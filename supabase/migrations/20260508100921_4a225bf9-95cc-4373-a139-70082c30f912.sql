CREATE TABLE public.sms_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  state text NOT NULL,
  district text NOT NULL,
  crop text,
  language text NOT NULL DEFAULT 'hi',
  source text NOT NULL DEFAULT 'web',
  registered_by uuid,
  consent_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sms_subscribers_phone ON public.sms_subscribers(phone);
CREATE INDEX idx_sms_subscribers_district ON public.sms_subscribers(state, district);
CREATE INDEX idx_sms_subscribers_registered_by ON public.sms_subscribers(registered_by);

ALTER TABLE public.sms_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can self-register" ON public.sms_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (source IN ('web','missed_call'));

CREATE POLICY "Users view own subscription" ON public.sms_subscribers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own subscription" ON public.sms_subscribers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access subscribers" ON public.sms_subscribers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_sms_subscribers_updated
BEFORE UPDATE ON public.sms_subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.sms_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES public.sms_subscribers(id) ON DELETE CASCADE,
  template_key text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  provider_msg_id text,
  cost_paise int,
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sms_log_subscriber ON public.sms_log(subscriber_id);
CREATE INDEX idx_sms_log_status ON public.sms_log(status);

ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access sms_log" ON public.sms_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  language text NOT NULL,
  body text NOT NULL,
  dlt_template_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read templates" ON public.sms_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage templates" ON public.sms_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_sms_templates_updated
BEFORE UPDATE ON public.sms_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
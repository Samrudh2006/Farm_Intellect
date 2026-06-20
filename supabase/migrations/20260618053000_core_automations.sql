-- Pipeline #2: Mandi Prices
CREATE TABLE IF NOT EXISTS mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop TEXT NOT NULL,
    market TEXT NOT NULL,
    min_price INTEGER NOT NULL,
    max_price INTEGER NOT NULL,
    modal_price INTEGER NOT NULL,
    unit TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pipeline #3: Crop Diseases
CREATE TABLE IF NOT EXISTS crop_diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    symptoms JSONB DEFAULT '[]'::jsonb,
    causes JSONB DEFAULT '[]'::jsonb,
    organic_treatments JSONB DEFAULT '[]'::jsonb,
    chemical_treatments JSONB DEFAULT '[]'::jsonb,
    prevention JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pipeline #5: FAQs
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('scheme', 'disease')),
    entity_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pipeline #9: Farmer Feedback
CREATE TABLE IF NOT EXISTS farmer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    category TEXT CHECK (category IN ('bug', 'feature', 'complaint', 'general', 'pending')) DEFAULT 'pending',
    content TEXT NOT NULL,
    github_issue_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pipeline #10: Social Posts & Content
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('tip', 'alert', 'calendar', 'advisory')),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on mandi_prices" ON mandi_prices;
CREATE POLICY "Allow public read on mandi_prices" ON mandi_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on crop_diseases" ON crop_diseases;
CREATE POLICY "Allow public read on crop_diseases" ON crop_diseases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on faqs" ON faqs;
CREATE POLICY "Allow public read on faqs" ON faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on farmer_feedback" ON farmer_feedback;
CREATE POLICY "Allow public insert on farmer_feedback" ON farmer_feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on social_posts" ON social_posts;
CREATE POLICY "Allow public read on social_posts" ON social_posts FOR SELECT USING (true);

-- Setup Webhooks for faqs and analyze-feedback
CREATE OR REPLACE FUNCTION public.handle_new_scheme_or_disease() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://' || current_setting('custom.project_ref', true) || '.supabase.co/functions/v1/generate-faqs',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('custom.service_role_key', true)),
    body := jsonb_build_object('record', row_to_json(NEW), 'table', TG_TABLE_NAME)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_scheme_created ON schemes;
CREATE TRIGGER on_scheme_created
  AFTER INSERT ON schemes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_scheme_or_disease();

DROP TRIGGER IF EXISTS on_disease_created ON crop_diseases;
CREATE TRIGGER on_disease_created
  AFTER INSERT ON crop_diseases
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_scheme_or_disease();

CREATE OR REPLACE FUNCTION public.handle_new_feedback() 
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://' || current_setting('custom.project_ref', true) || '.supabase.co/functions/v1/analyze-feedback',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('custom.service_role_key', true)),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_feedback_created ON farmer_feedback;
CREATE TRIGGER on_feedback_created
  AFTER INSERT ON farmer_feedback
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_feedback();

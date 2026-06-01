CREATE TABLE IF NOT EXISTS public.market_prices ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, commodity TEXT NOT NULL, market TEXT NOT NULL, state TEXT NOT NULL, min_price NUMERIC NOT NULL, max_price NUMERIC NOT NULL, modal_price NUMERIC NOT NULL, date DATE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view prices" ON public.market_prices;
CREATE POLICY "Anyone can view prices" ON public.market_prices FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.knowledge_articles ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view knowledge articles" ON public.knowledge_articles;
CREATE POLICY "Anyone can view knowledge articles" ON public.knowledge_articles FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.forum_posts ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Users can create forum posts" ON public.forum_posts;
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.polls ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, question TEXT NOT NULL, options JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view polls" ON public.polls;
DROP POLICY IF EXISTS "Users can create polls" ON public.polls;
DROP POLICY IF EXISTS "Users can update polls" ON public.polls;
CREATE POLICY "Anyone can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update polls" ON public.polls FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.iot_sensors ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, value NUMERIC NOT NULL, unit TEXT NOT NULL, status TEXT NOT NULL, battery INTEGER NOT NULL, last_updated TIMESTAMPTZ DEFAULT NOW() );
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view sensors" ON public.iot_sensors;
CREATE POLICY "Anyone can view sensors" ON public.iot_sensors FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.weather_logs ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, location TEXT NOT NULL, temperature NUMERIC NOT NULL, humidity NUMERIC NOT NULL, condition TEXT NOT NULL, wind_speed NUMERIC NOT NULL, date DATE NOT NULL );
ALTER TABLE public.weather_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view weather" ON public.weather_logs;
CREATE POLICY "Anyone can view weather" ON public.weather_logs FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.field_maps ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, field_name TEXT NOT NULL, crop TEXT NOT NULL, area NUMERIC NOT NULL, coordinates JSONB NOT NULL, status TEXT NOT NULL );
ALTER TABLE public.field_maps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view maps" ON public.field_maps;
CREATE POLICY "Anyone can view maps" ON public.field_maps FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.ai_recommendations ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, priority TEXT NOT NULL, type TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view recommendations" ON public.ai_recommendations;
CREATE POLICY "Anyone can view recommendations" ON public.ai_recommendations FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.calendar_events ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, type TEXT NOT NULL, description TEXT );
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view calendar" ON public.calendar_events;
CREATE POLICY "Anyone can view calendar" ON public.calendar_events FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.merchant_profiles ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, company TEXT NOT NULL, rating NUMERIC NOT NULL, verified BOOLEAN DEFAULT false, crops_bought JSONB NOT NULL );
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view merchants" ON public.merchant_profiles;
CREATE POLICY "Anyone can view merchants" ON public.merchant_profiles FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.field_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_description TEXT,
    field_name TEXT,
    event_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.field_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their events" ON public.field_events;
CREATE POLICY "Users view their events" ON public.field_events FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their tasks" ON public.user_tasks;
CREATE POLICY "Users view their tasks" ON public.user_tasks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.scheme_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    eligibility_score NUMERIC NOT NULL,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'matched'
);
ALTER TABLE public.scheme_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their schemes" ON public.scheme_matches;
CREATE POLICY "Users view their schemes" ON public.scheme_matches FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    action_type TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their logs" ON public.activity_log;
CREATE POLICY "Users view their logs" ON public.activity_log FOR ALL USING (auth.uid() = user_id);

INSERT INTO public.market_prices (commodity, market, state, min_price, max_price, modal_price, date)
VALUES 
    ('Wheat', 'Pune', 'Maharashtra', 2100, 2300, 2200, CURRENT_DATE),
    ('Corn', 'Nagpur', 'Maharashtra', 1800, 2000, 1900, CURRENT_DATE),
    ('Soybeans', 'Indore', 'Madhya Pradesh', 4500, 4800, 4650, CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO public.knowledge_articles (title, content, category, image_url)
VALUES 
    ('How to Prevent Leaf Blight', 'Leaf blight can destroy up to 30% of your crop...', 'disease_management', 'https://images.unsplash.com/photo-1599580667500-a4a350117b3a?w=800&q=80'),
    ('Organic Fertilizers for Tomatoes', 'Using vermicompost instead of urea...', 'fertilizer', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80')
ON CONFLICT DO NOTHING;

INSERT INTO public.iot_sensors (name, type, value, unit, status, battery)
VALUES 
    ('Field 1 Moisture', 'moisture', 42.5, '%', 'active', 85),
    ('Pump 1 Controller', 'pump', 1, 'status', 'active', 100),
    ('Soil Temp Sensor', 'temperature', 24.5, '°C', 'warning', 15)
ON CONFLICT DO NOTHING;

INSERT INTO public.weather_logs (location, temperature, humidity, condition, wind_speed, date)
VALUES 
    ('Pune, MH', 32, 65, 'Sunny', 12, CURRENT_DATE),
    ('Pune, MH', 34, 60, 'Partly Cloudy', 15, CURRENT_DATE + 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.ai_recommendations (title, description, priority, type)
VALUES 
    ('Irrigation Needed', 'Soil moisture in Field 1 is below optimal threshold. Schedule irrigation within 24 hours.', 'high', 'alert'),
    ('Pest Warning', 'High probability of aphid infestation due to recent humidity levels.', 'medium', 'warning')
ON CONFLICT DO NOTHING;

INSERT INTO public.calendar_events (title, date, type, description)
VALUES 
    ('Wheat Harvesting', CURRENT_DATE + 15, 'harvest', 'Expected date for wheat harvest in North Field'),
    ('Fertilizer Application', CURRENT_DATE + 2, 'task', 'Apply NPK to tomato crops')
ON CONFLICT DO NOTHING;

INSERT INTO public.merchant_profiles (name, company, rating, verified, crops_bought)
VALUES 
    ('Ramesh Trader', 'AgriBuy Corp', 4.8, true, '["Wheat", "Corn"]'::jsonb),
    ('Suresh Merchants', 'Fresh Foods Ltd', 4.5, true, '["Tomatoes", "Onions"]'::jsonb)
ON CONFLICT DO NOTHING;

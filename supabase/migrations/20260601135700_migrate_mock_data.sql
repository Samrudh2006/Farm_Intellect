-- 1. Create user_crops table
CREATE TABLE IF NOT EXISTS public.user_crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    area NUMERIC NOT NULL,
    planting_date DATE NOT NULL,
    expected_yield NUMERIC,
    status TEXT DEFAULT 'growing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own crops" ON public.user_crops
    FOR ALL USING (auth.uid() = user_id);

-- 2. Create market_requirements table
CREATE TABLE IF NOT EXISTS public.market_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    crop TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    price_per_unit NUMERIC NOT NULL,
    quality TEXT,
    deadline DATE,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.market_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchants can manage their requirements" ON public.market_requirements
    FOR ALL USING (auth.uid() = merchant_id);
CREATE POLICY "Anyone can view requirements" ON public.market_requirements
    FOR SELECT USING (true);

-- 3. Create market_prices table
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commodity TEXT NOT NULL,
    market TEXT NOT NULL,
    state TEXT NOT NULL,
    min_price NUMERIC NOT NULL,
    max_price NUMERIC NOT NULL,
    modal_price NUMERIC NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view prices" ON public.market_prices
    FOR SELECT USING (true);

-- 4. Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
    FOR SELECT USING (true);
CREATE POLICY "Users can create forum posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view polls" ON public.polls
    FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- 6. Create knowledge_articles table
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view knowledge articles" ON public.knowledge_articles
    FOR SELECT USING (true);

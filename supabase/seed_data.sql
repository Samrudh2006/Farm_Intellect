-- SEED DATA SCRIPT
-- Run this in your Supabase SQL Editor to populate the tables so your app isn't blank!

-- 1. Seed Market Prices (market_prices)
INSERT INTO public.market_prices (commodity, market, state, min_price, max_price, modal_price, date)
VALUES 
    ('Wheat', 'Pune', 'Maharashtra', 2100, 2300, 2200, CURRENT_DATE),
    ('Wheat', 'Nashik', 'Maharashtra', 2050, 2250, 2150, CURRENT_DATE),
    ('Corn', 'Nagpur', 'Maharashtra', 1800, 2000, 1900, CURRENT_DATE),
    ('Soybeans', 'Indore', 'Madhya Pradesh', 4500, 4800, 4650, CURRENT_DATE),
    ('Tomatoes', 'Pune', 'Maharashtra', 1500, 2500, 2000, CURRENT_DATE),
    ('Onions', 'Lasalgaon', 'Maharashtra', 1200, 1800, 1500, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 2. Seed Knowledge Articles (knowledge_articles)
INSERT INTO public.knowledge_articles (title, content, category, image_url)
VALUES 
    ('How to Prevent Leaf Blight in Wheat', 'Leaf blight can destroy up to 30% of your crop. Ensure proper spacing between plants and apply fungicide at the first sign of yellowing.', 'disease_management', 'https://images.unsplash.com/photo-1599580667500-a4a350117b3a?w=800&q=80'),
    ('Organic Fertilizers for Tomatoes', 'Using vermicompost instead of urea can improve soil retention and produce sweeter tomatoes. Apply 500kg per acre during soil prep.', 'fertilizer', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80'),
    ('Water Management in Summer', 'Drip irrigation uses 60% less water than flood irrigation. Consider installing a basic drip system to survive the upcoming drought months.', 'irrigation', 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&q=80')
ON CONFLICT DO NOTHING;

-- Note: forum_posts and polls require a user_id (creator_id) which we don't have hardcoded. 
-- We will let the app users create forum posts and polls through the UI instead of seeding them here.

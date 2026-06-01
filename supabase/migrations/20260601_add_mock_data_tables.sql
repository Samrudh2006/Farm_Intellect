-- Create crops table for user crops
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  health_status TEXT DEFAULT 'Healthy',
  planting_date DATE,
  expected_harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_demands table for market requirements
CREATE TABLE public.market_demands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  crop_name TEXT NOT NULL,
  quantity_needed NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  price_per_unit NUMERIC,
  buyer_location TEXT,
  deadline DATE,
  status TEXT DEFAULT 'Active',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advisory_articles table for knowledge hub
CREATE TABLE public.advisory_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  crop_type TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  featured_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create merchants table for merchants directory
CREATE TABLE public.merchants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  rating NUMERIC DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  website_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_prices table for mandi prices
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  mandi_name TEXT NOT NULL,
  state TEXT,
  price_per_unit NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_posts table for community forum
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table to track votes
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crops (user-scoped)
CREATE POLICY "Users can view their own crops" ON public.crops
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create crops" ON public.crops
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops" ON public.crops
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops" ON public.crops
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for market_demands (everyone can view, authenticated can create)
CREATE POLICY "Everyone can view market demands" ON public.market_demands
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create market demands" ON public.market_demands
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own market demands" ON public.market_demands
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own market demands" ON public.market_demands
FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for advisory_articles (everyone can view)
CREATE POLICY "Everyone can view advisory articles" ON public.advisory_articles
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create articles" ON public.advisory_articles
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own articles" ON public.advisory_articles
FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for merchants (everyone can view)
CREATE POLICY "Everyone can view merchants" ON public.merchants
FOR SELECT USING (true);

-- RLS Policies for market_prices (everyone can view)
CREATE POLICY "Everyone can view market prices" ON public.market_prices
FOR SELECT USING (true);

-- RLS Policies for forum_posts (everyone can view)
CREATE POLICY "Everyone can view forum posts" ON public.forum_posts
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.forum_posts
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for forum_comments (everyone can view)
CREATE POLICY "Everyone can view forum comments" ON public.forum_comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.forum_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.forum_comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.forum_comments
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for polls (everyone can view)
CREATE POLICY "Everyone can view polls" ON public.polls
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls" ON public.polls
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for poll_options (everyone can view)
CREATE POLICY "Everyone can view poll options" ON public.poll_options
FOR SELECT USING (true);

-- RLS Policies for poll_votes (authenticated can vote)
CREATE POLICY "Everyone can view poll votes count" ON public.poll_votes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on polls" ON public.poll_votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_crops_user_id ON public.crops(user_id);
CREATE INDEX idx_market_demands_created_by ON public.market_demands(created_by);
CREATE INDEX idx_market_demands_status ON public.market_demands(status);
CREATE INDEX idx_advisory_articles_author_id ON public.advisory_articles(author_id);
CREATE INDEX idx_advisory_articles_category ON public.advisory_articles(category);
CREATE INDEX idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_comments_post_id ON public.forum_comments(post_id);
CREATE INDEX idx_forum_comments_user_id ON public.forum_comments(user_id);
CREATE INDEX idx_polls_user_id ON public.polls(user_id);
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX idx_market_prices_crop_name ON public.market_prices(crop_name);
CREATE INDEX idx_market_prices_date ON public.market_prices(date);

-- Update timestamp triggers
CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_demands_updated_at
  BEFORE UPDATE ON public.market_demands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisory_articles_updated_at
  BEFORE UPDATE ON public.advisory_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at
  BEFORE UPDATE ON public.market_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
  BEFORE UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

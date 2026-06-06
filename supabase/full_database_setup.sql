-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'merchant', 'expert', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, phone, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'state'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TYPE public.notification_type AS ENUM ('info', 'warning', 'error', 'success', 'reminder');

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
-- Fix privilege escalation: Remove self-serve INSERT policy and add secure role assignment function

-- Drop the insecure INSERT policy that allows users to assign themselves any role
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Create a secure function for role assignment (only allows 'farmer' as default)
CREATE OR REPLACE FUNCTION public.assign_default_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only insert if user doesn't already have a role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'farmer');
  END IF;
END;
$$;

-- Create a secure admin-only function to change roles
CREATE OR REPLACE FUNCTION public.admin_assign_role(_target_user_id uuid, _new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to assign roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Update or insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
-- Create farmer dashboard data tables

-- Crop plans table
CREATE TABLE IF NOT EXISTS public.crop_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crop_name text NOT NULL,
  season text NOT NULL,
  sowing_date date,
  expected_harvest date,
  area_acres numeric(10,2),
  status text DEFAULT 'planned',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Field events table (history timeline)
CREATE TABLE IF NOT EXISTS public.field_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_description text NOT NULL,
  field_name text,
  event_date timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User tasks/reminders
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Scheme matches
CREATE TABLE IF NOT EXISTS public.scheme_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheme_name text NOT NULL,
  scheme_type text,
  eligibility_score integer DEFAULT 0,
  matched_at timestamptz DEFAULT now(),
  status text DEFAULT 'matched'
);

-- Activity log for dashboard
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  action_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crop_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for crop_plans
CREATE POLICY "Users can view own crop plans" ON public.crop_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crop plans" ON public.crop_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own crop plans" ON public.crop_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own crop plans" ON public.crop_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for field_events
CREATE POLICY "Users can view own field events" ON public.field_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own field events" ON public.field_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own field events" ON public.field_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own field events" ON public.field_events FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for user_tasks
CREATE POLICY "Users can view own tasks" ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.user_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.user_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.user_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for scheme_matches
CREATE POLICY "Users can view own scheme matches" ON public.scheme_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheme matches" ON public.scheme_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheme matches" ON public.scheme_matches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheme matches" ON public.scheme_matches FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for activity_log
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Fix 1: Prevent admin privilege escalation - always assign 'farmer' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  -- Always assign 'farmer' â€” admins must be promoted server-side only
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'farmer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: Allow admins to read all profiles and user_roles for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 3: Allow admins to view all activity logs
CREATE POLICY "Admins can view all activity"
ON public.activity_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Notifications table for all roles
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Consultations table for expert queue
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL,
  expert_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'general',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view own consultations"
ON public.consultations FOR SELECT TO authenticated
USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own consultations"
ON public.consultations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Experts can view assigned consultations"
ON public.consultations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'expert'));

CREATE POLICY "Experts can update assigned consultations"
ON public.consultations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'expert'));

CREATE POLICY "Admins can view all consultations"
ON public.consultations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Orders table for merchant workflow
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL,
  farmer_id UUID,
  crop_name TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL DEFAULT 0,
  price_per_kg NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (quantity_kg * price_per_kg) STORED,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can insert own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update own orders"
ON public.orders FOR UPDATE TO authenticated
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete own orders"
ON public.orders FOR DELETE TO authenticated
USING (auth.uid() = merchant_id);

CREATE POLICY "Farmers can view their orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = farmer_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT 'false'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select settings"
  ON public.admin_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
  ON public.admin_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
  ON public.admin_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_settings (key, value) VALUES
  ('enableRegistration', 'true'),
  ('enableNotifications', 'true'),
  ('enableMaintenance', 'false'),
  ('enableAnalytics', 'true'),
  ('autoApproveExperts', 'false'),
  ('enableEmailVerification', 'true'),
  ('sessionTimeout', '30'),
  ('maxLoginAttempts', '5'),
  ('minPasswordLength', '8'),
  ('smtpServer', '""'),
  ('smtpPort', '587'),
  ('fromEmail', '""');

-- Allow merchants to view farmer profiles (for partner network)
CREATE POLICY "Merchants can view farmer profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'merchant') 
    AND EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_roles.user_id = profiles.user_id AND user_roles.role = 'farmer'
    )
  );

-- Allow merchants to read farmer roles (to identify farmers)
CREATE POLICY "Merchants can view farmer roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'merchant'));

CREATE TABLE public.knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Everyone can read published articles
CREATE POLICY "Anyone can view published articles"
  ON public.knowledge_articles FOR SELECT TO authenticated
  USING (status = 'published');

-- Experts can see their own drafts
CREATE POLICY "Experts can view own articles"
  ON public.knowledge_articles FOR SELECT TO authenticated
  USING (auth.uid() = author_id AND public.has_role(auth.uid(), 'expert'));

-- Experts can insert
CREATE POLICY "Experts can insert articles"
  ON public.knowledge_articles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'expert') AND auth.uid() = author_id);

-- Experts can update own
CREATE POLICY "Experts can update own articles"
  ON public.knowledge_articles FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND public.has_role(auth.uid(), 'expert'));

-- Experts can delete own
CREATE POLICY "Experts can delete own articles"
  ON public.knowledge_articles FOR DELETE TO authenticated
  USING (auth.uid() = author_id AND public.has_role(auth.uid(), 'expert'));

-- Admins can do everything
CREATE POLICY "Admins full access articles"
  ON public.knowledge_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 1: Expert consultation policies - restrict to assigned consultations
DROP POLICY IF EXISTS "Experts can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Experts can update assigned consultations" ON public.consultations;

CREATE POLICY "Experts can view assigned consultations"
ON public.consultations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'expert'::app_role) AND (auth.uid() = expert_id OR expert_id IS NULL));

CREATE POLICY "Experts can update assigned consultations"
ON public.consultations FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'expert'::app_role) AND (auth.uid() = expert_id OR expert_id IS NULL));

-- Fix 2: Merchant role visibility - only see farmer roles
DROP POLICY IF EXISTS "Merchants can view farmer roles" ON public.user_roles;

CREATE POLICY "Merchants can view farmer roles"
ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'merchant'::app_role) AND (role = 'farmer'::app_role));

-- ============================================================
-- FIX: Convert ALL 52 RESTRICTIVE policies to PERMISSIVE
-- RESTRICTIVE = AND logic (all must pass) â€” BREAKS multi-policy tables
-- PERMISSIVE = OR logic (any can pass) â€” CORRECT behavior
-- ============================================================

-- ==================== activity_log ====================
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_log;

CREATE POLICY "Admins can view all activity" ON public.activity_log FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own activity" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== admin_settings ====================
DROP POLICY IF EXISTS "Admins can insert settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can select settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;

CREATE POLICY "Admins can insert settings" ON public.admin_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can select settings" ON public.admin_settings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update settings" ON public.admin_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ==================== consultations ====================
DROP POLICY IF EXISTS "Admins can view all consultations" ON public.consultations;
DROP POLICY IF EXISTS "Experts can update assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Experts can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Farmers can insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Farmers can view own consultations" ON public.consultations;

CREATE POLICY "Admins can view all consultations" ON public.consultations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Experts can update assigned consultations" ON public.consultations FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'expert'::app_role) AND (auth.uid() = expert_id OR expert_id IS NULL));
CREATE POLICY "Experts can view assigned consultations" ON public.consultations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'expert'::app_role) AND (auth.uid() = expert_id OR expert_id IS NULL));
CREATE POLICY "Farmers can insert own consultations" ON public.consultations FOR INSERT TO authenticated WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can view own consultations" ON public.consultations FOR SELECT TO authenticated USING (auth.uid() = farmer_id);

-- ==================== crop_plans ====================
DROP POLICY IF EXISTS "Users can delete own crop plans" ON public.crop_plans;
DROP POLICY IF EXISTS "Users can insert own crop plans" ON public.crop_plans;
DROP POLICY IF EXISTS "Users can update own crop plans" ON public.crop_plans;
DROP POLICY IF EXISTS "Users can view own crop plans" ON public.crop_plans;

CREATE POLICY "Users can delete own crop plans" ON public.crop_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crop plans" ON public.crop_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own crop plans" ON public.crop_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own crop plans" ON public.crop_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== field_events ====================
DROP POLICY IF EXISTS "Users can delete own field events" ON public.field_events;
DROP POLICY IF EXISTS "Users can insert own field events" ON public.field_events;
DROP POLICY IF EXISTS "Users can update own field events" ON public.field_events;
DROP POLICY IF EXISTS "Users can view own field events" ON public.field_events;

CREATE POLICY "Users can delete own field events" ON public.field_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own field events" ON public.field_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own field events" ON public.field_events FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own field events" ON public.field_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== knowledge_articles ====================
DROP POLICY IF EXISTS "Admins full access articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Experts can delete own articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Experts can insert articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Experts can update own articles" ON public.knowledge_articles;
DROP POLICY IF EXISTS "Experts can view own articles" ON public.knowledge_articles;

CREATE POLICY "Admins full access articles" ON public.knowledge_articles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view published articles" ON public.knowledge_articles FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Experts can delete own articles" ON public.knowledge_articles FOR DELETE TO authenticated USING (auth.uid() = author_id AND has_role(auth.uid(), 'expert'::app_role));
CREATE POLICY "Experts can insert articles" ON public.knowledge_articles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = author_id);
CREATE POLICY "Experts can update own articles" ON public.knowledge_articles FOR UPDATE TO authenticated USING (auth.uid() = author_id AND has_role(auth.uid(), 'expert'::app_role));
CREATE POLICY "Experts can view own articles" ON public.knowledge_articles FOR SELECT TO authenticated USING (auth.uid() = author_id AND has_role(auth.uid(), 'expert'::app_role));

-- ==================== notifications ====================
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Admins can view all notifications" ON public.notifications FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== orders ====================
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Farmers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Merchants can delete own orders" ON public.orders;
DROP POLICY IF EXISTS "Merchants can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Merchants can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Merchants can view own orders" ON public.orders;

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Farmers can view their orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = farmer_id);
CREATE POLICY "Merchants can delete own orders" ON public.orders FOR DELETE TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchants can update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = merchant_id);
CREATE POLICY "Merchants can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = merchant_id);

-- ==================== profiles ====================
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Merchants can view farmer profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Merchants can view farmer profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'merchant'::app_role) AND EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.user_id AND user_roles.role = 'farmer'::app_role));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== scheme_matches ====================
DROP POLICY IF EXISTS "Users can delete own scheme matches" ON public.scheme_matches;
DROP POLICY IF EXISTS "Users can insert own scheme matches" ON public.scheme_matches;
DROP POLICY IF EXISTS "Users can update own scheme matches" ON public.scheme_matches;
DROP POLICY IF EXISTS "Users can view own scheme matches" ON public.scheme_matches;

CREATE POLICY "Users can delete own scheme matches" ON public.scheme_matches FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheme matches" ON public.scheme_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheme matches" ON public.scheme_matches FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own scheme matches" ON public.scheme_matches FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== user_roles ====================
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Merchants can view farmer roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Merchants can view farmer roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'merchant'::app_role) AND role = 'farmer'::app_role);
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ==================== user_tasks ====================
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.user_tasks;

CREATE POLICY "Users can delete own tasks" ON public.user_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.user_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.user_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tasks" ON public.user_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- FIX: Prevent privilege escalation â€” only admins can write to user_roles
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- FIX: Merchants can only see farmer profiles they have orders with
DROP POLICY IF EXISTS "Merchants can view farmer profiles" ON public.profiles;
CREATE POLICY "Merchants can view farmer profiles with orders" ON public.profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'merchant'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.merchant_id = auth.uid() 
    AND orders.farmer_id = profiles.user_id
  )
);

-- FIX: Expert consultations â€” remove NULL branch so experts only see assigned
DROP POLICY IF EXISTS "Experts can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Experts can update assigned consultations" ON public.consultations;

CREATE POLICY "Experts can view assigned consultations" ON public.consultations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id);
CREATE POLICY "Experts can update assigned consultations" ON public.consultations FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id);

CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No public RLS policies - only edge functions (service role) can access this table
CREATE INDEX idx_otp_codes_phone_purpose ON public.otp_codes (phone, purpose);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes (expires_at);
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
-- Fix 1: Add WITH CHECK to consultations expert update policy
DROP POLICY IF EXISTS "Experts can update assigned consultations" ON public.consultations;
CREATE POLICY "Experts can update assigned consultations"
ON public.consultations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id)
WITH CHECK (has_role(auth.uid(), 'expert'::app_role) AND auth.uid() = expert_id);

-- Fix 2: otp_codes â€” explicit deny-all policies for authenticated users.
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

-- Fix 4: Realtime authorization â€” restrict realtime.messages so users can only
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

-- Harden notifications UPDATE: prevent ownership reassignment
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Per-user notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  crop_enabled boolean NOT NULL DEFAULT true,
  weather_enabled boolean NOT NULL DEFAULT true,
  market_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notif prefs" ON public.notification_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notif prefs" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notif prefs" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all notif prefs" ON public.notification_preferences
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_notif_prefs_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications updates/deletes
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END$$;
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
  service_role_token text := current_setting('app.settings.service_role_key', true);
BEGIN
  IF to_regnamespace('cron') IS NOT NULL
    AND to_regnamespace('net') IS NOT NULL
    AND project_url IS NOT NULL
    AND service_role_token IS NOT NULL
    AND service_role_token <> '' THEN
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
          headers := %L::jsonb,
          body := '{"kind":"weather","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher',
      '{"Content-Type":"application/json","Authorization":"Bearer ' || service_role_token || '"}')
    );

    PERFORM cron.schedule(
      'sms-crop-wed',
      '30 6 * * 3',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := %L::jsonb,
          body := '{"kind":"crop","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher',
      '{"Content-Type":"application/json","Authorization":"Bearer ' || service_role_token || '"}')
    );

    PERFORM cron.schedule(
      'sms-market-fri',
      '0 7 * * 5',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := %L::jsonb,
          body := '{"kind":"market","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher',
      '{"Content-Type":"application/json","Authorization":"Bearer ' || service_role_token || '"}')
    );

    PERFORM cron.schedule(
      'sms-scheme-sun',
      '0 8 * * 0',
      format($fmt$
        SELECT net.http_post(
          url := %L,
          headers := %L::jsonb,
          body := '{"kind":"scheme","limit":5000}'::jsonb
        );
      $fmt$, project_url || '/functions/v1/sms-dispatcher',
      '{"Content-Type":"application/json","Authorization":"Bearer ' || service_role_token || '"}')
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
-- Add audit fields, public UUID-like ids, and basic indexes for core tables

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS public_id uuid DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.comments
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS public_id uuid DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.documents
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS public_id uuid DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_public_id ON public.posts(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_comments_public_id ON public.comments(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_public_id ON public.documents(public_id);

CREATE INDEX IF NOT EXISTS idx_posts_author_created_at ON public.posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON public.comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_created_at ON public.documents(user_id, created_at DESC);
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

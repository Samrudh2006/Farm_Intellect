ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language_preference text NOT NULL DEFAULT 'en';

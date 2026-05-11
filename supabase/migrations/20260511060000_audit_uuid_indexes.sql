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

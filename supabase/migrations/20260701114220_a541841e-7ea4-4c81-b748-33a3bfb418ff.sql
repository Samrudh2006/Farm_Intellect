
-- Add preferred voice to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_voice text NOT NULL DEFAULT 'alloy';

-- Voice conversation history
CREATE TABLE IF NOT EXISTS public.voice_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_conversations TO authenticated;
GRANT ALL ON public.voice_conversations TO service_role;

ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own voice conversations select"
  ON public.voice_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own voice conversations insert"
  ON public.voice_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own voice conversations update"
  ON public.voice_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own voice conversations delete"
  ON public.voice_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS voice_conversations_user_updated_idx
  ON public.voice_conversations (user_id, updated_at DESC);

CREATE TRIGGER voice_conversations_updated_at
  BEFORE UPDATE ON public.voice_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

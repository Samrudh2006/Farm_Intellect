-- Create the schemes table to auto-update government schemes
CREATE TABLE IF NOT EXISTS public.schemes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('subsidy', 'loan', 'insurance', 'training', 'equipment')),
    amount TEXT NOT NULL,
    eligibility TEXT[] NOT NULL DEFAULT '{}',
    deadline TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'ending_soon', 'upcoming')),
    state TEXT NOT NULL DEFAULT 'All India',
    documents TEXT[] NOT NULL DEFAULT '{}',
    target_farmer_types TEXT[] NOT NULL DEFAULT '{}',
    interest_focus TEXT[] NOT NULL DEFAULT '{}',
    irrigation_needs TEXT[] NOT NULL DEFAULT '{}',
    min_land_holding NUMERIC,
    max_land_holding NUMERIC,
    requires_documents BOOLEAN DEFAULT true,
    crop_focus TEXT[] DEFAULT '{}',
    apply_url TEXT NOT NULL,
    learn_more_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for schemes" ON public.schemes;
-- Allow public read access to schemes
CREATE POLICY "Public read access for schemes"
    ON public.schemes
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Service role full access on schemes" ON public.schemes;
-- Allow service role to manage schemes
CREATE POLICY "Service role full access on schemes"
    ON public.schemes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert a trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_scheme_update ON public.schemes;
CREATE TRIGGER on_scheme_update
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

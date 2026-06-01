DO $$
DECLARE
    t_name text;
    tables text[] := ARRAY[
        'users', 'farmer_profiles', 'merchant_profiles', 'expert_profiles',
        'documents', 'otp_codes', 'notifications', 'comments', 'chat_messages',
        'crop_calendar', 'sensors', 'activities', 'fields', 'merchants',
        'crop_demand', 'polls', 'poll_votes', 'notification_preferences',
        'dataset_metadata', 'device_tokens', 'mandi_prices', 'weather_snapshots',
        'ingestion_logs', 'ai_recommendations', 'posts', 'poll_options'
    ];
BEGIN
    FOREACH t_name IN ARRAY tables LOOP
        -- 1. Enable RLS on the table
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', t_name);
        
        -- 2. Allow logged-in users to read and write (Blocks anonymous hackers)
        EXECUTE format('
            DO $policy$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = %L AND policyname = ''Allow authenticated users full access''
                ) THEN
                    CREATE POLICY "Allow authenticated users full access" ON public.%I
                        FOR ALL
                        TO authenticated
                        USING (true)
                        WITH CHECK (true);
                END IF;
            END $policy$;
        ', t_name, t_name);
        
        -- 3. Allow anyone to read data (Necessary for public pages like Market Prices)
        EXECUTE format('
            DO $policy$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = %L AND policyname = ''Allow public read access''
                ) THEN
                    CREATE POLICY "Allow public read access" ON public.%I
                        FOR SELECT
                        TO public
                        USING (true);
                END IF;
            END $policy$;
        ', t_name, t_name);
    END LOOP;
END $$;

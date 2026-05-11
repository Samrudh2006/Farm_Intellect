import { createClient } from '@supabase/supabase-js';
import { getScopedEnv } from './environment.js';

const supabaseUrl = getScopedEnv('SUPABASE_URL') || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = getScopedEnv('SUPABASE_ANON_KEY') || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseAuthConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseAuthClient = hasSupabaseAuthConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

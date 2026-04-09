import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client safely. 
// We use placeholder values if the real ones are missing to avoid 'Application Error' crashes during build/SSR.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'masjidfund-v3-auth',
      }
    })
  : createClient('https://placeholder-url.supabase.co', 'placeholder-key');

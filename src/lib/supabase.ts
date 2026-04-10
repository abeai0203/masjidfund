import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback storage that specifically lacks locking capabilities to satisfy the silenced environment.
// Note: navigator.locks is silenced globally in src/app/layout.tsx for maximum stability.
const noLockStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

// Initialize the Supabase client
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Maintain manual refresh strategy for maximum stability
        detectSessionInUrl: true,
        storageKey: 'masjidfund-v3-auth',
        storage: noLockStorage,
      }
    })
  : createClient('https://placeholder-url.supabase.co', 'placeholder-key');

// Reliability helpers (backward compatibility)
export const getSupabase = () => supabase;
export const resetSupabase = () => {};

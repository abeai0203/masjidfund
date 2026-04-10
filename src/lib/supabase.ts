import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage wrapper to bypass the unstable 'navigator.locks' API which causes 'Lock broken' errors in Next.js
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

// Singleton instance that can be 'reset' if poisoned by AbortErrors
let clientInstance: SupabaseClient | null = null;

/**
 * Returns the Supabase client instance. 
 * If the client was previously reset (due to lock errors), a fresh one is created.
 */
export const getSupabase = (): SupabaseClient => {
  if (clientInstance) return clientInstance;

  if (supabaseUrl && supabaseKey) {
    clientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Disabling auto-refresh to prevent background competition
        detectSessionInUrl: true,
        storageKey: 'masjidfund-v3-auth',
        storage: noLockStorage,
      }
    });
  } else {
    clientInstance = createClient('https://placeholder-url.supabase.co', 'placeholder-key');
  }

  return clientInstance;
};

/**
 * Forces the singleton to be cleared. 
 * Use this when an 'AbortError' is detected to allow the next request to start fresh.
 */
export const resetSupabase = () => {
  console.warn("[Supabase] Resetting client instance due to lock conflict.");
  clientInstance = null;
};

// Legacy export for backward compatibility during transition
export const supabase = getSupabase();

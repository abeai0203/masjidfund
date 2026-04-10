import { createClient } from '@supabase/supabase-js';

// --- THE NUCLEAR SILENCER ---
// This is the absolute final remedy for 'AbortError: Lock broken'.
// We physically delete the unstable Navigator Locks API before Supabase initializes.
// This forces the library to fall back to standard storage without any locking competition.
if (typeof window !== 'undefined' && window.navigator) {
  try {
    // @ts-ignore
    if (window.navigator.locks) {
      Object.defineProperty(window.navigator, 'locks', { value: undefined, configurable: true });
      console.log("[Supabase] Navigator Locks silenced to prevent AbortError.");
    }
  } catch (e) {
    console.warn("[Supabase] Failed to silence Navigator Locks, falling back to storage bypass.");
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback storage that specifically lacks locking capabilities to satisfy the silenced environment
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

// Initialize the Supabase client with the silenced environment
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

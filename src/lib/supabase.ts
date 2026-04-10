import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// The Surgical Fix: A custom storage that disables Supabase's internal Navigator Locks.
// By providing a dummy 'lock' implementation, we bypass the library's use of the 
// unstable 'navigator.locks' API which causes 'Lock broken' errors in Next.js.
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
  // Bypass internal locking mechanism by providing a no-op lock
  // Supabase checks if storage.lock exists; if so, it uses it instead of navigator.locks
  lock: {
    acquire: () => Promise.resolve(() => {}), // Dummy lock acquisition returns a no-op release function
  }
};

// Initialize the Supabase client with the Null-Lock storage
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Keep disabled to further minimize any parallel competition
        detectSessionInUrl: true,
        storageKey: 'masjidfund-v3-auth',
        storage: noLockStorage as any, 
      }
    })
  : createClient('https://placeholder-url.supabase.co', 'placeholder-key');

// Convenience aliases (not needed but kept for backward compatibility)
export const getSupabase = () => supabase;
export const resetSupabase = () => {
  console.warn("[Supabase] Reset requested, but Null-Lock is now active. No action needed.");
};

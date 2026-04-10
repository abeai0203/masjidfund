"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Contributor } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Proactive check for initial session to speed up recovery on refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        syncContributor(session.user);
      }
    });

    // 2. Single source of truth for all subsequent auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setContributor(null);
        setLoading(false);
      } else if (currentUser) {
        setUser(currentUser);
        // Only mark loading as false AFTER contributor is synced
        await syncContributor(currentUser);
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial load with no user
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Manual Session Refresher (to replace disabled autoRefreshToken)
  // Refreshes the token every 10 minutes to maintain session without background competition
  useEffect(() => {
    if (!user) return;
    
    const refreshTimer = setInterval(() => {
      console.log("[useAuth] Performing manual session maintenance...");
      supabase.auth.refreshSession().catch(err => {
        console.warn("[useAuth] Periodic refresh failed (expected if offline):", err.message);
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, [user]);

  const syncContributor = async (supabaseUser: User) => {
    try {
      // 1. First, try to just fetch the existing contributor
      const { data: existing, error: fetchError } = await supabase
        .from('contributors')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (existing) {
        setContributor(existing as Contributor);
        setLoading(false);
        return;
      }

      // 2. If not found, then perform the upsert (first time login)
      const { data: upserted, error: upsertError } = await supabase
        .from('contributors')
        .upsert({
          user_id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0],
          avatar_url: supabaseUser.user_metadata.avatar_url || supabaseUser.user_metadata.picture,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (upsertError) {
        console.error("Error syncing contributor:", upsertError);
      } else {
        setContributor(upserted as Contributor);
      }
    } catch (err) {
      console.error("Failed to sync contributor:", err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  const signOut = async () => {
    try {
      // 1. Terminate session globally in Supabase
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error("Supabase sign out error:", err);
    } finally {
      // 2. Local state cleanup
      setUser(null);
      setContributor(null);
      
      // 3. Manual Storage Purge (Nuclear Option)
      // This ensures any stuck keys are removed regardless of Supabase client behavior
      if (typeof window !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        sessionStorage.clear(); // Safe to clear entire session storage for logout
        
        // 4. Force a hard redirect with a cache-buster
        window.location.replace("/?logout=" + Date.now());
      }
    }
  };

  return {
    user,
    contributor,
    loading,
    signInWithGoogle,
    signOut,
  };
}

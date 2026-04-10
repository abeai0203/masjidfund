import { useEffect, useState } from 'react';
import { getSupabase, resetSupabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Contributor } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getSupabase();
    
    // 1. Proactive check for initial session to speed up recovery on refresh
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        syncContributor(session.user);
      }
    }).catch(err => {
      // If initial getSession fails due to lock, trigger a reset
      if (err?.name === 'AbortError') {
        resetSupabase();
      }
    });

    // 2. Single source of truth for all subsequent auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
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
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 3. Manual Session Refresher (to replace disabled autoRefreshToken)
  useEffect(() => {
    if (!user) return;
    
    const refreshTimer = setInterval(() => {
      const client = getSupabase();
      console.log("[useAuth] Performing manual session maintenance...");
      client.auth.refreshSession().catch(err => {
        if (err?.name === 'AbortError') {
          resetSupabase();
        }
        console.warn("[useAuth] Periodic refresh failed:", err.message);
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, [user]);

  const syncContributor = async (supabaseUser: User) => {
    const client = getSupabase();
    try {
      const { data: existing, error: fetchError } = await client
        .from('contributors')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (existing) {
        setContributor(existing as Contributor);
        setLoading(false);
        return;
      }

      const { data: upserted, error: upsertError } = await client
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
    const client = getSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) console.error("Login error:", error.message);
  };

  const signOut = async () => {
    const client = getSupabase();
    try {
      await client.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error("Supabase sign out error:", err);
    } finally {
      setUser(null);
      setContributor(null);
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
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

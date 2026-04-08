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
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncContributor(session.user);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await syncContributor(currentUser);
      } else {
        setContributor(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    await supabase.auth.signOut();
    setUser(null);
    setContributor(null);
    window.location.href = "/";
  };

  return {
    user,
    contributor,
    loading,
    signInWithGoogle,
    signOut,
  };
}

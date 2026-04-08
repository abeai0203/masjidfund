"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase will automatically handle the code exchange on the client side
    // when using supabase-js. We just need to wait for the session and redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // If they were on the submit page, maybe we want to go back there
        // For now, simpler to just go to home or submission
        router.push('/submit');
      }
    });

    // Timeout fallback just in case
    const timeout = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-lg font-bold text-foreground">Sedang memproses log masuk...</h2>
      <p className="text-sm text-foreground/50">Sila tunggu sebentar.</p>
    </div>
  );
}

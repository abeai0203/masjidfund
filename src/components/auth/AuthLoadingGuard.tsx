"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Global guard that prevents the application from rendering its UI shell
 * until the Supabase authentication session has been fully synchronized.
 * Includes a 3.5s failsafe timeout to prevent 'Eternal Hang' on lock errors.
 */
export default function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    // Failsafe: If auth sync hangs for more than 5.5s, force render anyway
    // This gives more time for SSO sessions to recover on slower networks
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("[AuthGuard] Session sync timed out. Forcing render.");
        setIsTimedOut(true);
      }
    }, 5500);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !isTimedOut) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface animate-in fade-in duration-300">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-emerald-100 rounded-full" />
          {/* Inner spinning ring */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-600/20" />
        </div>
        
        {/* Aesthetic Branding */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-[10px]">M</span>
            </div>
            <span className="font-black text-xl tracking-tighter text-emerald-600">MasjidFund</span>
          </div>
          <p className="text-[10px] font-black text-emerald-900/40 uppercase tracking-[0.4em] animate-pulse">Mengesahkan Sesi...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

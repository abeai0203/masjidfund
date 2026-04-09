"use client";

import { useAuth } from "@/hooks/useAuth";

/**
 * Global guard that prevents the application from rendering its UI shell
 * until the Supabase authentication session has been fully synchronized.
 * This is the ultimate solution to prevent 'ghost' empty states or 0 statistics
 * during page reloads in an SSO environment.
 */
export default function AuthLoadingGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
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

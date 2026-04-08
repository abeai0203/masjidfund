"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, contributor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in at all
        router.push("/");
      } else if (contributor && contributor.role !== 'admin') {
        // Logged in but not an admin
        router.push("/");
      }
    }
  }, [user, contributor, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-bold text-foreground/40 uppercase tracking-widest">Mengesahkan Akses...</p>
      </div>
    );
  }

  // Only render children if user is logged in AND is an admin
  if (user && contributor?.role === 'admin') {
    return <>{children}</>;
  }

  // Otherwise, return null or a placeholder while redirecting
  return null;
}

"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function UserNav() {
  const { user, contributor, loading, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <button 
        onClick={signInWithGoogle}
        className="flex items-center gap-2 bg-primary text-white rounded-full px-5 py-2 text-sm font-bold hover:bg-primary-hover transition-all shadow-md active:scale-95"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            fillOpacity="0.8"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            fillOpacity="0.8"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            fillOpacity="0.8"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Masuk</span>
      </button>
    );
  }

  const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;
  const displayName = user.user_metadata.full_name || user.email?.split('@')[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white border border-border shadow-sm hover:shadow-md transition-all active:scale-95 group overflow-hidden"
      >
        <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-primary/10 bg-surface-muted group-hover:border-primary/30 transition-colors">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover text-white text-xs font-black uppercase">
              {displayName?.[0]}
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left text-xs font-black text-foreground truncate max-w-[100px]">
          {displayName}
        </div>
        <svg 
          className={`w-4 h-4 text-foreground/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-border/10 bg-surface-muted/30">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Log Masuk Sebagai</p>
            <p className="text-sm font-black text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-foreground/40 truncate">{user.email}</p>
          </div>
          <div className="p-2">
            {contributor?.role === 'admin' && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-primary/5 hover:text-primary rounded-xl transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dashboard Admin
              </Link>
            )}
            <button 
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
          <div className="p-3 bg-surface-muted/50 text-center">
             <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em]">MasjidFund v4.2</p>
          </div>
        </div>
      )}
    </div>
  );
}

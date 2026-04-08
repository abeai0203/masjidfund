"use client";

import Link from "next/link";
import { useState } from "react";
import UserNav from "./UserNav";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Temui Projek", href: "/projects" },
    { name: "Agih Derma", href: "/donate" },
    { name: "Hantar Kempen", href: "/submit" },
    { name: "Dashboard", href: "/admin" },
  ];

  return (
    <nav className="bg-surface border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xl leading-none">M</span>
              </div>
              <span className="font-black text-2xl tracking-tighter text-emerald-600">MasjidFund</span>
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden sm:flex sm:space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <UserNav />
            
            <Link href="/donate" className="group hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-md hover:shadow-xl hover:-translate-y-1">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Derma
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden p-2 rounded-md text-foreground hover:bg-surface-muted transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="sm:hidden bg-surface border-t border-border px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-base font-semibold text-foreground hover:bg-surface-muted rounded-xl transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="/donate" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-4 mt-4 text-center text-base font-black text-white bg-primary rounded-xl"
          >
            Derma Sekarang
          </Link>
        </div>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

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
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">M</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-primary-hover">MasjidFund</span>
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
            <Link href="/donate" className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
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

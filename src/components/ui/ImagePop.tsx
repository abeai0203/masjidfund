"use client";

import React, { useState, useEffect } from 'react';

interface ImagePopProps {
  src: string;
  alt: string;
  className?: string;
}

const ImagePop: React.FC<ImagePopProps> = ({ src, alt, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className={`relative cursor-zoom-in group ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          
          <button 
            className="absolute top-6 right-6 z-[110] bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div 
            className="relative z-[105] max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={src} 
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300"
            />
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">{alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePop;

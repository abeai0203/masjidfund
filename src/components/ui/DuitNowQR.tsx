"use client";

import React from "react";

interface DuitNowQRProps {
  qrUrl: string;
  className?: string;
}

export default function DuitNowQR({ qrUrl, className = "" }: DuitNowQRProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Pink Brand Frame */}
      <div className="bg-[#eb2a68] p-4 rounded-[2.5rem] relative shadow-2xl overflow-visible">
        
        {/* Logo Cut-out at Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md z-10">
          <div className="bg-[#eb2a68] w-12 h-12 rounded-full flex flex-col items-center justify-center text-white">
            {/* Simple SVG DuitNow "d" logo representation */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v10h-2V7z" />
            </svg>
            <span className="text-[6px] font-black leading-none uppercase tracking-tighter -mt-1">DuitNow</span>
            <span className="text-[6px] font-black leading-none uppercase tracking-tighter">QR</span>
          </div>
        </div>

        {/* Inner White Plate */}
        <div className="bg-white rounded-3xl p-4 flex items-center justify-center aspect-square shadow-inner">
          <img 
            src={qrUrl} 
            alt="DuitNow QR Code" 
            className="w-full h-full object-contain mix-blend-multiply" 
          />
        </div>
      </div>
      
      {/* Subtle Bottom Accent for Depth */}
      <div className="h-2 w-4/5 bg-black/10 blur-xl absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full -z-10"></div>
    </div>
  );
}

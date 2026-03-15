import React from "react";

interface DuitNowLogoProps {
  className?: string;
  size?: number | string;
}

/**
 * Replaced SVG implementation with official image as per user request.
 * Ensure /public/images/branding/duitnow-official.png exists.
 */
export default function DuitNowLogo({ className = "", size = 24 }: DuitNowLogoProps) {
  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src="/images/branding/duitnow-logo-v2.png" 
        alt="DuitNow Official" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}

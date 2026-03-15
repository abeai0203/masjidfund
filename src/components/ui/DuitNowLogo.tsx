import React from "react";

interface DuitNowLogoProps {
  className?: string;
  variant?: "pink" | "white" | "white-outline";
  size?: number | string;
}

export default function DuitNowLogo({ className = "", variant = "pink", size = 24 }: DuitNowLogoProps) {
  const getColors = () => {
    switch (variant) {
      case "white":
        return { bg: "#ffffff", brand: "#ed005d", text: "#ffffff" };
      case "white-outline":
        return { bg: "transparent", brand: "#ffffff", text: "#ffffff" };
      default:
        return { bg: "#ed005d", brand: "#ffffff", text: "#ffffff" };
    }
  };

  const colors = getColors();

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Rounded Square Background if not transparent */}
        {variant !== "white-outline" && (
          <rect width="100" height="100" rx="30" fill={colors.bg} />
        )}
        
        {/* The 'D' Shape */}
        <path 
          d="M72.5 50C72.5 65.1878 60.1878 77.5 45 77.5C29.8122 77.5 17.5 65.1878 17.5 50C17.5 34.8122 29.8122 22.5 45 22.5C60.1878 22.5 72.5 34.8122 72.5 50Z" 
          fill={colors.brand} 
        />
        <path 
          d="M45 61.5C51.3513 61.5 56.5 56.3513 56.5 50C56.5 43.6487 51.3513 38.5 45 38.5C38.6487 38.5 33.5 43.6487 33.5 50C33.5 56.3513 38.6487 61.5 45 61.5Z" 
          fill={colors.bg} 
        />
        
        {/* Inner Pin Drop Shape */}
        <path 
          d="M45 54C47.2091 54 49 52.2091 49 50C49 47.7909 47.2091 46 45 46C42.7909 46 41 47.7909 41 50C41 52.2091 42.7909 54 45 54Z" 
          fill={colors.brand} 
        />
      </svg>
    </div>
  );
}

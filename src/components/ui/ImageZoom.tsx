"use client";

import React, { useState, useRef } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className = "" }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState('0% 0%');
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate background position for the zoomed image
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    setZoomPos({ x, y });
    setBgPos(`${bgX}% ${bgY}%`);
  };

  return (
    <div 
      className={`relative cursor-crosshair overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img 
        ref={imgRef}
        src={src} 
        alt={alt}
        className="w-full h-full object-contain"
      />
      
      {showZoom && (
        <div 
          className="pointer-events-none absolute border-2 border-white/50 rounded-full shadow-2xl z-20 overflow-hidden"
          style={{
            width: '200px',
            height: '200px',
            top: zoomPos.y - 100,
            left: zoomPos.x - 100,
            backgroundImage: `url(${src})`,
            backgroundPosition: bgPos,
            backgroundSize: '400%', // Zoom level
            backgroundRepeat: 'no-repeat',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)', // Darken surroundings
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;

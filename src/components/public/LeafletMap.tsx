"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";

// Stylized Custom Marker Icon
const customIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin"><div class="marker-dot"></div></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

interface MapProps {
  projects: {
    slug: string;
    mosque_name: string;
    target_amount: number;
    lat: number;
    lng: number;
  }[];
}

export default function LeafletMap({ projects }: MapProps) {
  const router = useRouter();

  const formatAmount = (num: number) => {
    if (num >= 1000000) return `RM${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `RM${(num / 1000).toFixed(0)}k`;
    return `RM${num}`;
  };

  return (
    <div className="relative h-[600px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-900">
      <MapContainer 
        center={[4.2105, 108.6753]} 
        zoom={6} 
        scrollWheelZoom={false}
        className="h-full w-full dark-map-theme"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {projects.map((project) => (
          <Marker 
            key={project.slug} 
            position={[project.lat, project.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => {
                router.push(`/projects/${project.slug}`);
              },
            }}
          >
            <Tooltip permanent direction="top" className="premium-tooltip" offset={[0, -20]}>
              <div className="flex flex-col items-center group cursor-pointer">
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter mb-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {project.mosque_name}
                </span>
                <span className="text-sm font-black text-white bg-primary px-3 py-1 rounded-lg shadow-lg transform group-hover:scale-110 transition-transform">
                  {formatAmount(project.target_amount)}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}

      </MapContainer>

      {/* Floating Instructions */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
         Klik Pada Harga Untuk Infaq Terus
      </div>

      <style jsx global>{`
        .dark-map-theme .leaflet-tile-container {
          filter: saturate(0) contrast(1.2) brightness(0.8);
        }
        .premium-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .premium-tooltip:before {
          display: none !important;
        }
        
        .marker-pin {
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          background: #059669;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -10px;
          box-shadow: 0 0 15px rgba(5, 150, 105, 0.5);
          animation: pulseMarker 2s infinite;
        }
        
        .marker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 6px;
          left: 6px;
        }

        @keyframes pulseMarker {
          0% { transform: rotate(-45deg) scale(1); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
          70% { transform: rotate(-45deg) scale(1.1); box-shadow: 0 0 0 10px rgba(5, 150, 105, 0); }
          100% { transform: rotate(-45deg) scale(1); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";

// Simplified Clean Marker Icon
const customIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-dot-simple"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
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
    <div className="relative h-[550px] w-full rounded-2xl overflow-hidden border border-border shadow-md bg-[#f0f9f4]">
      <MapContainer 
        center={[4.2105, 108.6753]} 
        zoom={6} 
        scrollWheelZoom={false}
        className="h-full w-full green-tint-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
            <Tooltip permanent direction="top" className="modern-label" offset={[0, -5]}>
              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-[9px] font-bold text-foreground/60 uppercase tracking-tighter mb-0.5 group-hover:text-primary transition-colors">
                  {project.mosque_name}
                </span>
                <span className="text-xs font-black text-white bg-primary px-2.5 py-1 rounded-full shadow-sm group-hover:bg-primary-hover group-hover:scale-110 transition-all border border-white/20">
                  {formatAmount(project.target_amount)}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}

      </MapContainer>

      {/* Simplified Helper */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border text-[9px] font-bold text-primary flex items-center gap-2 shadow-sm">
         <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
         Klik Label Untuk Infaq
      </div>

      <style jsx global>{`
        /* Apply a subtle green tint to the whole map */
        .green-tint-map .leaflet-tile-container {
          filter: sepia(0.3) hue-rotate(80deg) saturate(0.6) brightness(1.05);
        }
        
        .modern-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        
        .modern-label:before {
          display: none !important;
        }

        .marker-dot-simple {
          width: 8px;
          height: 8px;
          background: #059669;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(5, 150, 105, 0.4);
        }
        
        .leaflet-container {
           background: #f0f9f4 !important;
        }
      `}</style>
    </div>
  );
}

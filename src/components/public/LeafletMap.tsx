"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import malaysiaGeoJSON from "@/lib/malaysia.json";

// Fix Leaflet icon issue in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  points: {
    name: string;
    amount: number;
    lat: number;
    lng: number;
  }[];
}

const STATE_COORDINATES: Record<string, [number, number]> = {
  "Selangor": [3.0738, 101.5183],
  "Kuala Lumpur": [3.1390, 101.6869],
  "Johor": [1.4854, 103.7618],
  "Pulau Pinang": [5.4141, 100.3288],
  "Perak": [4.5921, 101.0901],
  "Perlis": [6.4449, 100.2048],
  "Kedah": [6.1184, 100.3686],
  "Pahang": [3.8126, 103.3256],
  "Terengganu": [5.3117, 103.1324],
  "Kelantan": [6.1254, 102.2386],
  "Melaka": [2.1896, 102.2501],
  "Negeri Sembilan": [2.7258, 101.9424],
  "Sarawak": [1.5533, 110.3592],
  "Sabah": [5.9788, 116.0753],
};

function SetViewOnLocate({ location }: { location: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (location && STATE_COORDINATES[location]) {
      map.setView(STATE_COORDINATES[location], 9, { animate: true });
    }
  }, [location, map]);
  return null;
}

export default function LeafletMap({ points }: MapProps) {
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  const formatAmount = (num: number) => {
    if (num >= 1000000) return `RM${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `RM${(num / 1000).toFixed(0)}k`;
    return `RM${num}`;
  };

  return (
    <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-border shadow-inner bg-slate-50">
      <MapContainer 
        center={[4.2105, 108.6753]} 
        zoom={6} 
        scrollWheelZoom={false}
        className="h-full w-full leaflet-custom-filter"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <GeoJSON 
          data={malaysiaGeoJSON as any} 
          style={{
            fillColor: "#059669",
            fillOpacity: 0.1,
            color: "#059669",
            weight: 1,
          }}
        />

        {points.map((point) => (
          <Marker 
            key={point.name} 
            position={[point.lat, point.lng]} 
            icon={icon}
          >
            <Tooltip permanent direction="top" className="custom-tooltip">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-primary leading-none mb-1">{point.name}</span>
                <span className="text-xs font-black text-foreground">{formatAmount(point.amount)}</span>
              </div>
            </Tooltip>
          </Marker>
        ))}

        <SetViewOnLocate location={detectedLocation} />
      </MapContainer>

      {/* Manual Locality Trigger overlay */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button 
          onClick={() => setDetectedLocation("Selangor")}
          className="bg-white border border-border shadow-lg text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-muted transition-all flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
          Gunakan Lokaliti Saya
        </button>
      </div>

      <style jsx global>{`
        .leaflet-custom-filter .leaflet-tile-container {
          filter: grayscale(100%) brightness(1.1) contrast(1);
        }
        .custom-tooltip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 9999px !important;
          padding: 6px 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .custom-tooltip:before {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getPublicProjects } from "@/lib/api";

const LeafletMap = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-surface-muted animate-pulse rounded-2xl flex items-center justify-center text-foreground/40 font-medium">
      Memuatkan Peta Malaysia...
    </div>
  )
});

interface MapPoint {
  name: string;
  amount: number;
  lat: number;
  lng: number;
}

const STATE_COORDINATES: Record<string, { lat: number, lng: number }> = {
  "Selangor": { lat: 3.0738, lng: 101.5183 },
  "Kuala Lumpur": { lat: 3.1390, lng: 101.6869 },
  "Johor": { lat: 1.4854, lng: 103.7618 },
  "Pulau Pinang": { lat: 5.4141, lng: 100.3288 },
  "Perak": { lat: 4.5921, lng: 101.0901 },
  "Perlis": { lat: 6.4449, lng: 100.2048 },
  "Kedah": { lat: 6.1184, lng: 100.3686 },
  "Pahang": { lat: 3.8126, lng: 103.3256 },
  "Terengganu": { lat: 5.3117, lng: 103.1324 },
  "Kelantan": { lat: 6.1254, lng: 102.2386 },
  "Melaka": { lat: 2.1896, lng: 102.2501 },
  "Negeri Sembilan": { lat: 2.7258, lng: 101.9424 },
  "Sarawak": { lat: 1.5533, lng: 110.3592 },
  "Sabah": { lat: 5.9788, lng: 116.0753 },
};

export default function InteractiveMap() {
  const [points, setPoints] = useState<MapPoint[]>([]);

  useEffect(() => {
    async function loadRealData() {
      const projects = await getPublicProjects();
      
      const stateData: Record<string, number> = {};
      projects.forEach(p => {
        if (!stateData[p.state]) stateData[p.state] = 0;
        stateData[p.state] += p.target_amount;
      });

      const mappedPoints: MapPoint[] = Object.entries(stateData).map(([state, total]) => {
        const coords = STATE_COORDINATES[state] || { lat: 4, lng: 102 };
        return {
          name: state,
          amount: total,
          lat: coords.lat,
          lng: coords.lng
        };
      });

      setPoints(mappedPoints);
    }
    loadRealData();
  }, []);

  return (
    <div className="w-full bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-muted/50">
        <div>
          <h3 className="text-xl font-bold text-foreground">Peta Infaq Malaysia (Live)</h3>
          <p className="text-sm text-foreground/60">Data sasaran dana sebenar yang diperlukan bagi setiap negeri.</p>
        </div>
      </div>

      <div className="w-full">
        <LeafletMap points={points} />
      </div>
      
      <div className="px-6 py-4 bg-surface border-t border-border flex flex-wrap gap-4 items-center justify-center text-xs text-foreground/50">
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary rounded-full"></span> Projek Aktif Sebenar</span>
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary/40 rounded-full border border-primary/20"></span> Geo-Sempadan Malaysia</span>
         <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Data Berasaskan Pangkalan Data</span>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getPublicProjects } from "@/lib/api";

const LeafletMap = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-3xl flex items-center justify-center text-white/20 font-black text-2xl tracking-tighter italic">
      MASJID FUND EXPLORER
    </div>
  )
});

// Helper for approximate coordinates based on district/state if coordinates are missing in DB
const COORDINATE_MAP: Record<string, { lat: number, lng: number }> = {
  "Selangor": { lat: 3.0738, lng: 101.5183 },
  "Hazelton Eco Forest": { lat: 3.2505, lng: 101.5303 },
  "Lestari Putra": { lat: 2.9805, lng: 101.6603 },
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
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadRealData() {
      const publicProjects = await getPublicProjects();
      
      const mapped = publicProjects.map(p => {
        // Use mosque name specific coords if available, else state coords with a small random jitter to avoid overlap
        const base = COORDINATE_MAP[p.mosque_name] || COORDINATE_MAP[p.state] || { lat: 4, lng: 102 };
        return {
          slug: p.slug,
          mosque_name: p.mosque_name,
          target_amount: p.target_amount,
          lat: base.lat + (Math.random() - 0.5) * 0.1, // Jitter
          lng: base.lng + (Math.random() - 0.5) * 0.1  // Jitter
        };
      });

      setProjects(mapped);
    }
    loadRealData();
  }, []);

  return (
    <div className="w-full bg-slate-950 rounded-[2.5rem] p-4 lg:p-8 border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span> Live Peta Infaq
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight">Pilih & Infaq Terus</h3>
          <p className="text-white/40 text-sm max-w-sm font-medium">Klik pada harga untuk melihat butiran penuh setiap masjid.</p>
        </div>
        
        <div className="flex items-center gap-8 text-white/40 text-[10px] font-bold uppercase tracking-widest border-l border-white/10 pl-8">
           <div className="flex flex-col gap-1">
             <span className="text-primary text-lg leading-none font-black">{projects.length}</span>
             <span>Projek Aktif</span>
           </div>
           <div className="flex flex-col gap-1">
             <span className="text-white text-lg leading-none font-black">RM{(projects.reduce((acc, p) => acc + p.target_amount, 0) / 1000000).toFixed(1)}M</span>
             <span>Jumlah Sasaran</span>
           </div>
        </div>
      </div>

      <div className="w-full">
        <LeafletMap projects={projects} />
      </div>
    </div>
  );
}

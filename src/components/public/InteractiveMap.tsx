"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getPublicProjects } from "@/lib/api";

const LeafletMap = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full bg-surface-muted animate-pulse rounded-2xl flex items-center justify-center text-primary/40 font-bold text-xl italic">
      MASJID FUND MAP
    </div>
  )
});

const COORDINATE_MAP: Record<string, { lat: number, lng: number }> = {
  "Selangor": { lat: 3.0738, lng: 101.5183 },
  "Hazelton Eco Forest": { lat: 3.1205, lng: 101.5303 },
  "Lestari Putra": { lat: 2.9805, lng: 101.6603 },
  "Al-Hidayah": { lat: 3.1505, lng: 101.7103 },
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
        const base = COORDINATE_MAP[p.mosque_name] || COORDINATE_MAP[p.state] || { lat: 4, lng: 102 };
        return {
          slug: p.slug,
          mosque_name: p.mosque_name,
          target_amount: p.target_amount,
          lat: base.lat + (Math.random() - 0.5) * 0.08,
          lng: base.lng + (Math.random() - 0.5) * 0.08
        };
      });

      setProjects(mapped);
    }
    loadRealData();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">Eksplorasi Infaq Terus</h3>
          <p className="text-foreground/60 text-sm">Klik pada nama masjid untuk melihat butiran sumbangan.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
             <span className="block text-[10px] uppercase font-bold text-primary/60">Projek Aktif</span>
             <span className="text-lg font-black text-primary leading-none">{projects.length}</span>
           </div>
        </div>
      </div>

      <LeafletMap projects={projects} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicProjects } from "@/lib/api";
import { Project } from "@/lib/types";

interface MapPoint {
  id: string;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  amount: number;
}

const STATE_COORDINATES: Record<string, { x: number, y: number }> = {
  "Selangor": { x: 22, y: 55 },
  "Kuala Lumpur": { x: 25, y: 60 },
  "Johor": { x: 35, y: 80 },
  "Pulau Pinang": { x: 18, y: 30 },
  "Perak": { x: 20, y: 40 },
  "Perlis": { x: 15, y: 15 },
  "Kedah": { x: 17, y: 22 },
  "Pahang": { x: 30, y: 50 },
  "Terengganu": { x: 38, y: 35 },
  "Kelantan": { x: 32, y: 25 },
  "Melaka": { x: 30, y: 72 },
  "Negeri Sembilan": { x: 28, y: 66 },
  "Sarawak": { x: 70, y: 70 },
  "Sabah": { x: 88, y: 35 },
};

export default function InteractiveMap() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  useEffect(() => {
    async function loadRealData() {
      const projects = await getPublicProjects();
      
      // Group by state and sum target_amount
      const stateData: Record<string, number> = {};
      projects.forEach(p => {
        if (!stateData[p.state]) stateData[p.state] = 0;
        stateData[p.state] += p.target_amount;
      });

      const mappedPoints: MapPoint[] = Object.entries(stateData).map(([state, total]) => {
        const coords = STATE_COORDINATES[state] || { x: 50, y: 50 };
        return {
          id: state.toLowerCase().replace(/\s+/g, '-'),
          name: state,
          amount: total,
          x: coords.x,
          y: coords.y
        };
      });

      setPoints(mappedPoints);
    }
    loadRealData();
  }, []);

  const handleDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setDetectedLocation("Selangor");
      setActivePoint("selangor");
    }, 1500);
  };

  const formatAmount = (num: number) => {
    if (num >= 1000000) return `RM${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `RM${(num / 1000).toFixed(0)}k`;
    return `RM${num}`;
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-muted/50">
        <div>
          <h3 className="text-xl font-bold text-foreground">Terokai Infaq Malaysia (Data Sebenar)</h3>
          <p className="text-sm text-foreground/60">Data dikemaskini terus daripada pangkalan data projek aktif.</p>
        </div>
        <button 
          onClick={handleDetect}
          disabled={isDetecting}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-50"
        >
          {isDetecting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          )}
          {detectedLocation ? `Lokasi: ${detectedLocation}` : "Temui Projek Berdekatan Saya"}
        </button>
      </div>

      <div className="relative aspect-[21/9] w-full bg-[#f8fafc] p-4 sm:p-8">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
           <span className="text-[15rem] font-black italic">MASJID FUND</span>
        </div>

        <div className="relative w-full h-full max-w-5xl mx-auto">
          {/* Peninsular Malaysia Style */}
          <div className="absolute top-[10%] left-[10%] w-[35%] h-[80%] bg-primary/10 rounded-[20%_40%_20%_60%] border-2 border-green-500/20 shadow-inner overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </div>
          
          {/* East Malaysia Style */}
          <div className="absolute top-[30%] left-[55%] w-[40%] h-[55%] bg-primary/10 rounded-[40%_20%_60%_20%] border-2 border-green-500/20 shadow-inner">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </div>

          {/* Map Dots/Labels - Using Database Items */}
          {points.map((point) => (
            <div 
              key={point.id}
              className="absolute z-20 group"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onMouseEnter={() => setActivePoint(point.id)}
              onMouseLeave={() => setActivePoint(null)}
            >
              <Link href={`/states/${point.name.toLowerCase()}`} className="relative block transform transition-transform hover:scale-110 active:scale-95">
                <div className={`
                  bg-white px-3 py-1.5 rounded-full shadow-lg border border-border flex items-center gap-2 whitespace-nowrap transition-all
                  ${activePoint === point.id ? 'ring-4 ring-primary/20 border-primary' : ''}
                `}>
                  <div className={`w-2 h-2 rounded-full ${activePoint === point.id ? 'bg-primary animate-ping' : 'bg-primary'}`}></div>
                  <span className="text-xs font-black text-foreground">{formatAmount(point.amount)}</span>
                  {activePoint === point.id && (
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded ml-1">
                      {point.name}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-white to-transparent opacity-50"></div>
              </Link>
            </div>
          ))}

          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-md text-[10px] text-foreground/40 font-bold tracking-widest uppercase border border-border">
            Semenanjung & Borneo
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-surface border-t border-border flex flex-wrap gap-4 items-center justify-center text-xs text-foreground/50">
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary rounded-full"></span> Projek Aktif Sebenar</span>
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary/40 rounded-full"></span> Dana Diperlukan</span>
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span> Data Live</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

interface MapPoint {
  id: string;
  name: string;
  count: number;
  x: number; // percentage from left
  y: number; // percentage from top
  amount: string;
}

const POINTS: MapPoint[] = [
  { id: "selangor", name: "Selangor", count: 12, x: 22, y: 55, amount: "RM850k" },
  { id: "kl", name: "Kuala Lumpur", count: 8, x: 25, y: 60, amount: "RM620k" },
  { id: "johor", name: "Johor", count: 15, x: 35, y: 80, amount: "RM1.2M" },
  { id: "penang", name: "Pulau Pinang", count: 6, x: 18, y: 30, amount: "RM430k" },
  { id: "perak", name: "Perak", count: 9, x: 20, y: 40, amount: "RM510k" },
  { id: "perlis", name: "Perlis", count: 2, x: 15, y: 15, amount: "RM95k" },
  { id: "kedah", name: "Kedah", count: 7, x: 17, y: 22, amount: "RM340k" },
  { id: "pahang", name: "Pahang", count: 5, x: 30, y: 50, amount: "RM280k" },
  { id: "terengganu", name: "Terengganu", count: 4, x: 38, y: 35, amount: "RM190k" },
  { id: "kelantan", name: "Kelantan", count: 3, x: 32, y: 25, amount: "RM150k" },
  { id: "melaka", name: "Melaka", count: 4, x: 30, y: 72, amount: "RM210k" },
  { id: "n-sembilan", name: "N. Sembilan", count: 5, x: 28, y: 66, amount: "RM240k" },
  { id: "sarawak", name: "Sarawak", count: 11, x: 70, y: 70, amount: "RM760k" },
  { id: "sabah", name: "Sabah", count: 9, x: 88, y: 35, amount: "RM580k" },
];

export default function InteractiveMap() {
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);

  const handleDetect = () => {
    setIsDetecting(true);
    // Simulate locality detection
    setTimeout(() => {
      setIsDetecting(false);
      setDetectedLocation("Selangor");
      setActivePoint("selangor");
    }, 1500);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-muted/50">
        <div>
          <h3 className="text-xl font-bold text-foreground">Terokai Infaq Malaysia</h3>
          <p className="text-sm text-foreground/60">Klik pada label untuk melihat dana diperlukan bagi setiap negeri.</p>
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
        {/* Simple Horizontal Stylized Map of Malaysia */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
           <span className="text-[15rem] font-black italic">MASJID FUND</span>
        </div>

        {/* Map Illustration - Flat Green Stylized */}
        <div className="relative w-full h-full max-w-5xl mx-auto">
          {/* Peninsular Malaysia */}
          <div className="absolute top-[10%] left-[10%] w-[35%] h-[80%] bg-primary/10 rounded-[20%_40%_20%_60%] border-2 border-green-500/20 shadow-inner overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </div>
          
          {/* East Malaysia (Sarawak & Sabah) */}
          <div className="absolute top-[30%] left-[55%] w-[40%] h-[55%] bg-primary/10 rounded-[40%_20%_60%_20%] border-2 border-green-500/20 shadow-inner">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </div>

          {/* Map Dots/Labels */}
          {POINTS.map((point) => (
            <div 
              key={point.id}
              className="absolute z-20 group"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onMouseEnter={() => setActivePoint(point.id)}
              onMouseLeave={() => setActivePoint(null)}
            >
              <Link href={`/states/${point.id}`} className="relative block transform transition-transform hover:scale-110 active:scale-95">
                <div className={`
                  bg-white px-3 py-1.5 rounded-full shadow-lg border border-border flex items-center gap-2 whitespace-nowrap transition-all
                  ${activePoint === point.id ? 'ring-4 ring-primary/20 border-primary' : ''}
                `}>
                  <div className={`w-2 h-2 rounded-full ${activePoint === point.id ? 'bg-primary animate-ping' : 'bg-primary'}`}></div>
                  <span className="text-xs font-black text-foreground">{point.amount}</span>
                  {activePoint === point.id && (
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded ml-1">
                      {point.name}
                    </span>
                  )}
                </div>
                
                {/* Connector Line (Pulse) */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-white to-transparent opacity-50"></div>
              </Link>
            </div>
          ))}

          {/* Hover Card for Sabar/Sarawak connector info */}
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-md text-[10px] text-foreground/40 font-bold tracking-widest uppercase border border-border">
            Semenanjung & Borneo
          </div>
        </div>
      </div>
      
      {/* Footer info for Map */}
      <div className="px-6 py-4 bg-surface border-t border-border flex flex-wrap gap-4 items-center justify-center text-xs text-foreground/50">
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary rounded-full"></span> 10+ Masjid Disahkan</span>
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-primary/40 rounded-full"></span> Dana Diperlukan</span>
         <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-400 rounded-full"></span> Dana Kecemasan</span>
      </div>
    </div>
  );
}

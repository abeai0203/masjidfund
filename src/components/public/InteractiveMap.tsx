"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicProjects } from "@/lib/api";

const COORDINATES: Record<string, { x: number, y: number }> = {
  "Selangor": { x: 22, y: 55 },
  "Hazelton Eco Forest": { x: 25, y: 53 },
  "Lestari Putra": { x: 19, y: 58 },
  "Al-Hidayah": { lat: 3.1505, x: 23, y: 56 },
  "Kuala Lumpur": { x: 24, y: 58 },
  "Johor": { x: 38, y: 80 },
  "Pulau Pinang": { x: 15, y: 28 },
  "Perak": { x: 18, y: 42 },
  "Kedah": { x: 13, y: 20 },
  "Pahang": { x: 32, y: 52 },
  "Terengganu": { x: 38, y: 36 },
  "Kelantan": { x: 32, y: 24 },
  "Sarawak": { x: 70, y: 72 },
  "Sabah": { x: 88, y: 35 },
};

export default function InteractiveMap() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getPublicProjects();
      const mapped = data.map(p => {
        const coords = COORDINATES[p.mosque_name] || COORDINATES[p.state] || { x: 50, y: 50 };
        return {
          ...p,
          x: coords.x + (Math.random() - 0.5) * 4, // Jitter
          y: coords.y + (Math.random() - 0.5) * 4
        };
      });
      setProjects(mapped);
    }
    loadData();
  }, []);

  const formatAmount = (num: number) => {
    if (num >= 1000000) return `RM${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `RM${(num / 1000).toFixed(0)}k`;
    return `RM${num}`;
  };

  return (
    <div className="w-full bg-[#fdfbf7] p-4 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="space-y-3">
             <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary/10">
               <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span> Live Infaq Explorer
             </div>
             <h2 className="text-4xl font-black text-foreground tracking-tight">Cari Masjid Berdekatan.</h2>
             <p className="text-foreground/50 max-w-sm font-medium">Klik pada tag harga untuk melihat butiran & infaq terus.</p>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="text-right">
                <span className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest">Dana Diperlukan</span>
                <span className="text-3xl font-black text-primary">RM{(projects.reduce((acc, p) => acc + p.target_amount, 0) / 1000000).toFixed(1)}M</span>
             </div>
             <div className="w-px h-12 bg-border"></div>
             <div className="text-right">
                <span className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest">Masjid Aktif</span>
                <span className="text-3xl font-black text-foreground">{projects.length}</span>
             </div>
          </div>
        </div>

        {/* The "Map" - Custom SVG Look */}
        <div className="relative aspect-[21/9] w-full bg-white rounded-[3rem] border border-border shadow-2xl shadow-primary/5 overflow-hidden group">
           {/* Abstract Malaysia Background */}
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] grayscale brightness-125 pointer-events-none transition-transform duration-1000 group-hover:scale-105">
              <svg className="w-full h-full p-20" viewBox="0 0 1000 450" fill="currentColor">
                 {/* Simplified Peninsular */}
                 <path d="M100 50 Q 150 20, 200 50 T 250 150 Q 280 250, 220 350 T 150 400 Q 80 350, 60 250 T 100 50 Z" />
                 {/* Simplified Borneo */}
                 <path d="M550 200 Q 650 150, 800 180 T 900 250 Q 850 350, 700 380 T 550 300 Z" />
              </svg>
           </div>

           {/* Floating Grid pattern */}
           <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03]"></div>

           {/* Live Project Tags */}
           <div className="relative w-full h-full p-12">
              {projects.map((project) => (
                <div 
                  key={project.slug}
                  className="absolute z-20 transition-all duration-300 transform"
                  style={{ left: `${project.x}%`, top: `${project.y}%` }}
                  onMouseEnter={() => setActiveProject(project.slug)}
                  onMouseLeave={() => setActiveProject(null)}
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="relative group/tag">
                       {/* Connection Line */}
                       <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-t from-primary/30 to-transparent"></div>
                       
                       {/* The Tag */}
                       <div className={`
                         flex flex-col items-center whitespace-nowrap transition-all duration-500
                         ${activeProject === project.slug ? '-translate-y-2' : ''}
                       `}>
                          <span className={`
                            text-[10px] font-black text-foreground/40 uppercase tracking-tighter mb-1 transition-opacity
                            ${activeProject === project.slug ? 'opacity-100' : 'opacity-0'}
                          `}>
                            {project.mosque_name}
                          </span>
                          <div className={`
                            px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 border-2 transition-all
                            ${activeProject === project.slug 
                              ? 'bg-primary border-primary text-white scale-110 shadow-primary/30' 
                              : 'bg-white border-white text-foreground hover:border-primary/20'}
                          `}>
                             <div className={`w-2 h-2 rounded-full ${activeProject === project.slug ? 'bg-white animate-pulse' : 'bg-primary'}`}></div>
                             <span className="text-sm font-black tracking-tight">{formatAmount(project.target_amount)}</span>
                          </div>
                       </div>
                    </div>
                  </Link>
                </div>
              ))}
           </div>

           {/* Map Legend */}
           <div className="absolute bottom-8 left-8 flex items-center gap-6 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-sm pointer-events-none">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                 <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Projek Terkini</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-primary/20 rounded-full border border-primary/40"></div>
                 <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest">Sokongan Diperlukan</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

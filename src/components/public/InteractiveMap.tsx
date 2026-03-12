"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import * as d3 from "d3-geo";
import { getPublicProjects } from "@/lib/api";
import malaysiaGeoJSON from "@/lib/malaysia.json";

interface ProjectPoint {
  slug: string;
  mosque_name: string;
  target_amount: number;
  x: number;
  y: number;
}

export default function InteractiveMap() {
  const [projects, setProjects] = useState<ProjectPoint[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  // Setup D3 Projection to match the reference image style
  const projection = useMemo(() => {
    return d3.geoMercator()
      .center([109.5, 4.2]) // Centered between Semenanjung and Borneo
      .scale(2800)         // Adjusted for a good fit
      .translate([500, 225]); // Half of 1000x450
  }, []);

  const pathGenerator = d3.geoPath().projection(projection);

  useEffect(() => {
    async function loadData() {
      const publicProjects = await getPublicProjects();
      
      const mapped = publicProjects.map(p => {
        // Find center of the state in GeoJSON to place the label generally
        const stateFeature = (malaysiaGeoJSON as any).features.find((f: any) => 
          f.properties.name.toLowerCase().includes(p.state.toLowerCase()) ||
          p.state.toLowerCase().includes(f.properties.name.toLowerCase())
        );

        let coords: [number, number] = [101.9758, 4.2105]; // Default center
        if (stateFeature) {
          const center = d3.geoCentroid(stateFeature);
          coords = [center[0], center[1]];
        }

        const [x, y] = projection(coords) || [0, 0];

        return {
          slug: p.slug,
          mosque_name: p.mosque_name,
          target_amount: p.target_amount,
          x: x / 10, // Scale to % for absolute positioning
          y: y / 4.5
        };
      });

      setProjects(mapped);
    }
    loadData();
  }, [projection]);

  const formatAmount = (num: number) => {
    if (num >= 1000000) return `RM${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `RM${(num / 1000).toFixed(0)}k`;
    return `RM${num}`;
  };

  return (
    <div className="w-full bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 bg-[#88b2b6]/10 text-[#88b2b6] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#88b2b6]/20">
               Live Infaq Explorer
             </div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">Terokai Masjid di Malaysia</h2>
             <p className="text-slate-500 text-sm font-medium">Klik pada harga untuk butiran projek.</p>
          </div>
          
          <div className="flex gap-8">
             <div className="text-right border-r border-slate-100 pr-8">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dana Diperlukan</span>
                <span className="text-2xl font-black text-primary">RM{(projects.reduce((acc, p) => acc + p.target_amount, 0) / 1000000).toFixed(1)}M</span>
             </div>
             <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projek Aktif</span>
                <span className="text-2xl font-black text-slate-800">{projects.length}</span>
             </div>
          </div>
        </div>

        {/* The Map Component */}
        <div className="relative w-full aspect-[21/9] bg-slate-50/50 rounded-[40px] border border-slate-100 overflow-hidden group">
           
           {/* SVG Map Data (Matching the reference style) */}
           <svg 
             viewBox="0 0 1000 450" 
             className="absolute inset-0 w-full h-full drop-shadow-xl"
           >
             <g className="map-paths">
               {(malaysiaGeoJSON as any).features.map((feature: any, i: number) => (
                 <path
                   key={i}
                   d={pathGenerator(feature) || ""}
                   className="fill-[#88b2b6] stroke-white stroke-[0.8] hover:fill-[#7aa1a5] transition-colors duration-300"
                 />
               ))}
             </g>
           </svg>

           {/* Interactive Markers (Price Tags) */}
           <div className="absolute inset-0 pointer-events-none">
              {projects.map((project) => (
                <div 
                  key={project.slug}
                  className="absolute pointer-events-auto"
                  style={{ 
                    left: `${project.x}%`, 
                    top: `${project.y}%`,
                    transform: 'translate(-50%, -100%)' 
                  }}
                  onMouseEnter={() => setActiveProject(project.slug)}
                  onMouseLeave={() => setActiveProject(null)}
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="relative">
                       {/* Floating Label */}
                       <div className={`
                         flex flex-col items-center whitespace-nowrap transition-all duration-300
                         ${activeProject === project.slug ? '-translate-y-2' : ''}
                       `}>
                          <span className={`
                            text-[9px] font-black text-[#5a8084] uppercase tracking-tighter mb-1 transition-opacity
                            ${activeProject === project.slug ? 'opacity-100' : 'opacity-0'}
                          `}>
                            {project.mosque_name}
                          </span>
                          
                          <div className={`
                            px-3 py-1.5 rounded-xl shadow-lg border transition-all duration-300 flex items-center gap-2
                            ${activeProject === project.slug 
                              ? 'bg-primary border-primary text-white scale-110 shadow-primary/30' 
                              : 'bg-white/90 backdrop-blur-sm border-slate-200 text-slate-800'}
                          `}>
                             <div className={`w-1.5 h-1.5 rounded-full ${activeProject === project.slug ? 'bg-white animate-pulse' : 'bg-primary'}`}></div>
                             <span className="text-xs font-black tracking-tight">{formatAmount(project.target_amount)}</span>
                          </div>
                          
                          {/* Anchor Pointer */}
                          <div className={`
                            w-2 h-2 rotate-45 -mt-1 border-r border-b transition-colors
                            ${activeProject === project.slug ? 'bg-primary border-primary' : 'bg-white/90 border-slate-200'}
                          `}></div>
                       </div>
                    </div>
                  </Link>
                </div>
              ))}
           </div>

           {/* Custom Instructions */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 text-[10px] font-bold text-[#5a8084] uppercase tracking-widest shadow-sm">
             Klik pada masjid untuk infaq
           </div>
        </div>
      </div>

      <style jsx global>{`
        .map-paths path {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

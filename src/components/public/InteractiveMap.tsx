"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import * as d3 from "d3-geo";
import { getPublicProjects } from "@/lib/api";
import malaysiaGeoJSON from "@/lib/malaysia.json";
import { Project } from "@/lib/types";

interface ProjectPoint extends Project {
  x: number;
  y: number;
}

export default function InteractiveMap() {
  const [projects, setProjects] = useState<ProjectPoint[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [foundProject, setFoundProject] = useState<ProjectPoint | null>(null);
  const [zoomState, setZoomState] = useState({ x: 500, y: 225, scale: 1 });

  // Setup D3 Projection
  const projection = useMemo(() => {
    return d3.geoMercator()
      .center([109.5, 4.2])
      .scale(2800)
      .translate([500, 225]);
  }, []);

  const pathGenerator = d3.geoPath().projection(projection);

  useEffect(() => {
    async function loadData() {
      const publicProjects = await getPublicProjects();
      const mapped = publicProjects.map(p => {
        const stateFeature = (malaysiaGeoJSON as any).features.find((f: any) => 
          f.properties.name.toLowerCase().includes(p.state.toLowerCase()) ||
          p.state.toLowerCase().includes(f.properties.name.toLowerCase())
        );

        let coords: [number, number] = [101.9758, 4.2105];
        if (stateFeature) {
          const center = d3.geoCentroid(stateFeature);
          coords = [center[0], center[1]];
        }
        const [x, y] = projection(coords) || [0, 0];
        return { ...p, x, y };
      });
      setProjects(mapped as ProjectPoint[]);
    }
    loadData();
  }, [projection]);

  const handleLocalitySearch = () => {
    setIsSearching(true);
    setFoundProject(null);
    setZoomState({ x: 500, y: 225, scale: 1 });
    
    // Simulate finding the nearest (usually Selangor/KL for demo)
    setTimeout(() => {
      const target = projects.find(p => p.state === "Selangor") || projects[0];
      if (target) {
        setIsSearching(false);
        setFoundProject(target);
        // Zoom in to the coordinates
        setZoomState({ x: target.x, y: target.y, scale: 2.5 });
      }
    }, 2000);
  };

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
               Infaq Berasaskan Lokasi
             </div>
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">Carian Lokaliti Anda.</h2>
             <p className="text-slate-500 text-sm font-medium">Klik butang untuk menemui projek masjid paling dekat dengan anda.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
             <button 
                onClick={handleLocalitySearch}
                disabled={isSearching}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
             >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                {isSearching ? "Mencari Lokasi..." : "Temui Projek Berdekatan Saya"}
             </button>

             {zoomState.scale !== 1 && (
               <button 
                 onClick={() => { setZoomState({ x: 500, y: 225, scale: 1 }); setFoundProject(null); }}
                 className="text-slate-400 hover:text-slate-800 font-bold text-xs uppercase tracking-widest"
               >
                 Reset Peta
               </button>
             )}
          </div>
        </div>

        {/* The Map Component */}
        <div className="relative w-full aspect-[21/9] min-h-[500px] md:min-h-0 bg-slate-50/50 rounded-[40px] border border-slate-100 overflow-hidden shadow-inner">
           
           {/* SVG Map Container for Zooming */}
           <div 
             className="absolute inset-0 transition-transform duration-1000 ease-in-out"
             style={{ 
               transform: `scale(${zoomState.scale}) translate(${(500 - zoomState.x)}px, ${(225 - zoomState.y)}px)`,
               transformOrigin: '500px 225px'
             }}
           >
             <svg 
               viewBox="0 0 1000 450" 
               className="w-full h-full"
             >
               <g className="map-paths">
                 {(malaysiaGeoJSON as any).features.map((feature: any, i: number) => (
                   <path
                     key={i}
                     d={pathGenerator(feature) || ""}
                     className="fill-[#88b2b6] stroke-white stroke-[0.8] transition-colors duration-300"
                   />
                 ))}
               </g>

               {isSearching && (
                 <circle 
                   cx="220" cy="300" r="10" 
                   className="fill-primary/20 stroke-primary animate-ping" 
                   strokeWidth="2"
                 />
               )}
             </svg>

             {/* Dynamic Markers */}
             {projects.map((project) => (
               <div 
                 key={project.slug}
                 className="absolute z-20"
                 style={{ 
                   left: `${(project.x / 1000) * 100}%`, 
                   top: `${(project.y / 450) * 100}%`,
                   transform: 'translate(-50%, -100%)' 
                 }}
               >
                 <Link href={`/projects/${project.slug}`} className="block">
                    <div 
                      className={`
                        transition-all duration-300 flex flex-col items-center
                        ${activeProject === project.slug || (foundProject && foundProject.slug === project.slug) ? 'scale-110' : 'scale-100'}
                      `}
                      onMouseEnter={() => setActiveProject(project.slug)}
                      onMouseLeave={() => setActiveProject(null)}
                    >
                       <div className={`
                         px-2 py-1 rounded-lg shadow-lg border text-[8px] font-black transition-all flex items-center gap-1
                         ${foundProject && foundProject.slug === project.slug 
                           ? 'bg-primary border-primary text-white' 
                           : 'bg-white border-slate-200 text-slate-800'}
                       `}>
                          <span>{formatAmount(project.target_amount)}</span>
                       </div>
                    </div>
                 </Link>
               </div>
             ))}
           </div>

           {/* Locality Info Popup (The "Spotlight") */}
           {foundProject && !isSearching && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-sm animate-in fade-in zoom-in duration-500">
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-primary/20 overflow-hidden relative group">
                   <div className="absolute top-0 right-0 p-4">
                      <button onClick={() => { setFoundProject(null); setZoomState({ x: 500, y: 225, scale: 1 }); }} className="text-slate-300 hover:text-slate-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                   </div>
                   
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      </div>
                      <div>
                         <span className="block text-[10px] font-black text-primary uppercase tracking-widest">Berdekatan Anda</span>
                         <h4 className="text-lg font-black text-slate-800 leading-tight">{foundProject.mosque_name}</h4>
                      </div>
                   </div>

                   <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                      <div className="flex justify-between items-end">
                         <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Sasaran Dana</span>
                            <span className="text-xl font-black text-slate-800">{formatAmount(foundProject.target_amount)}</span>
                         </div>
                         <div className="text-right">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Negeri</span>
                            <span className="text-sm font-black text-slate-800">{foundProject.state}</span>
                         </div>
                      </div>
                   </div>

                   <Link 
                     href={`/projects/${foundProject.slug}`}
                     className="block w-full bg-primary hover:bg-primary-hover text-white text-center py-3 rounded-xl font-black text-sm transition-all"
                   >
                     Lihat Butiran & Infaq
                   </Link>
                </div>
             </div>
           )}

           {/* Search Overlay */}
           {isSearching && (
             <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[50] flex items-center justify-center">
                <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4">
                   <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                   <div className="text-center">
                      <span className="block text-sm font-black text-slate-800 uppercase tracking-widest">Mencari Masjid...</span>
                      <span className="text-xs text-slate-400 font-medium">Mengesan lokasi GPS berdekatan</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

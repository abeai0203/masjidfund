"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { getPublicProjects } from "@/lib/api";
import { Project } from "@/lib/types";

// ─── Custom pill marker factory ────────────────────────────────────────────────
function createPillIcon(label: string, isActive: boolean) {
  return L.divIcon({
    className: "",
    html: `
      <div class="airbnb-pill ${isActive ? "airbnb-pill--active" : ""}">
        <span>${label}</span>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function formatAmt(num: number) {
  if (num >= 1_000_000) return `RM${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `RM${(num / 1_000).toFixed(0)}k`;
  return `RM${num}`;
}

// ─── Map fly-to helper ─────────────────────────────────────────────────────────
function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { animate: true, duration: 1.4 });
  }, [coords, map]);
  return null;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function InteractiveMap() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // State → rough coordinates for fallback
  const STATE_COORDS: Record<string, [number, number]> = {
    "Selangor": [3.0738, 101.5183],
    "Kuala Lumpur": [3.1390, 101.6869],
    "W.P. Kuala Lumpur": [3.1390, 101.6869],
    "Perak": [4.5921, 101.0901],
    "Kedah": [6.1184, 100.3685],
    "Kelantan": [5.8474, 102.2260],
    "Terengganu": [5.3117, 103.1324],
    "Pahang": [3.8126, 103.3256],
    "Negeri Sembilan": [2.7258, 101.9424],
    "Melaka": [2.1896, 102.2501],
    "Johor": [1.9344, 103.3587],
    "Pulau Pinang": [5.4141, 100.3288],
    "Perlis": [6.4449, 100.2048],
    "Sabah": [5.9788, 116.0753],
    "Sarawak": [1.5533, 110.3592],
  };

  useEffect(() => {
    // Fix Leaflet default icons (must run client-side only)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    getPublicProjects().then((ps) => {
      const withCoords = ps.filter((p) => {
        const c = STATE_COORDS[p.state] || STATE_COORDS[Object.keys(STATE_COORDS).find(k => p.state.includes(k) || k.includes(p.state)) || ""];
        return !!c;
      }).map((p) => {
        const key = Object.keys(STATE_COORDS).find(k => p.state === k || p.state.includes(k) || k.includes(p.state));
        const coords = key ? STATE_COORDS[key] : null;
        return coords ? { ...p, _lat: coords[0], _lng: coords[1] } : null;
      }).filter(Boolean) as (Project & { _lat: number; _lng: number })[];

      // Slight jitter so overlapping state pins don't stack
      const jittered = withCoords.map((p, i) => ({
        ...p,
        _lat: p._lat + (Math.random() - 0.5) * 0.15,
        _lng: p._lng + (Math.random() - 0.5) * 0.15,
      }));
      setProjects(jittered as any);
    });
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    setSelectedProject(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        // Find nearest
        let nearest = projects[0] as any;
        let minDist = Infinity;
        (projects as any[]).forEach((p) => {
          const d = Math.hypot(p._lat - lat, p._lng - lng);
          if (d < minDist) { minDist = d; nearest = p; }
        });
        setIsLocating(false);
        if (nearest) {
          setFlyTarget([nearest._lat, nearest._lng]);
          setSelectedProject(nearest);
          setActiveSlug(nearest.slug);
        }
      },
      () => {
        setIsLocating(false);
        // Fallback: show first project
        const p = projects[0] as any;
        if (p) { setFlyTarget([p._lat, p._lng]); setSelectedProject(p); setActiveSlug(p.slug); }
      }
    );
  };

  return (
    <div className="w-full bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              Infaq Berasaskan Lokasi
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Carian Lokaliti Anda.</h2>
            <p className="text-slate-500 text-sm font-medium">Klik butang untuk menemui projek masjid paling dekat dengan anda.</p>
          </div>

          <button
            onClick={handleLocate}
            disabled={isLocating || projects.length === 0}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50 whitespace-nowrap"
          >
            {isLocating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {isLocating ? "Mengesan Lokasi…" : "Temui Projek Berdekatan Saya"}
          </button>
        </div>

        {/* Map + Popup wrapper */}
        <div className="relative w-full h-[520px] rounded-[32px] overflow-hidden border border-slate-100 shadow-lg">

          {/* OpenStreetMap via Leaflet */}
          <MapContainer
            center={[4.2, 109.5]}
            zoom={6}
            scrollWheelZoom
            zoomControl={false}
            className="h-full w-full"
            whenReady={() => setMapReady(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {flyTarget && <FlyTo coords={flyTarget} />}

            {(projects as any[]).map((project) => (
              <Marker
                key={project.slug}
                position={[project._lat, project._lng]}
                icon={createPillIcon(formatAmt(project.target_amount), activeSlug === project.slug)}
                ref={(ref) => { if (ref) markerRefs.current[project.slug] = ref; }}
                eventHandlers={{
                  click: () => {
                    setSelectedProject(project);
                    setActiveSlug(project.slug);
                    setFlyTarget([project._lat, project._lng]);
                  },
                  mouseover: () => setActiveSlug(project.slug),
                  mouseout: () => { if (selectedProject?.slug !== project.slug) setActiveSlug(null); },
                }}
              />
            ))}
          </MapContainer>

          {/* Airbnb-style popup card */}
          {selectedProject && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">{selectedProject.state}</p>
                    <h4 className="font-black text-slate-800 text-sm leading-tight truncate">{selectedProject.mosque_name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{selectedProject.title}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedProject(null); setActiveSlug(null); setFlyTarget(null); }}
                    className="text-slate-300 hover:text-slate-600 flex-shrink-0 mt-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="flex items-center border-t border-slate-100">
                  <div className="flex-1 px-4 py-3">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Sasaran Dana</span>
                    <span className="text-base font-black text-slate-800">{formatAmt(selectedProject.target_amount)}</span>
                  </div>
                  <div className="flex-1 px-4 py-3 border-l border-slate-100">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Terkumpul</span>
                    <span className="text-base font-black text-primary">{formatAmt(selectedProject.collected_amount)}</span>
                  </div>
                  <Link
                    href={`/projects/${selectedProject.slug}`}
                    className="flex-shrink-0 mx-4 bg-primary hover:bg-primary-hover text-white text-[11px] font-black px-4 py-1.5 rounded-xl transition-all"
                  >
                    Infaq →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Locate loader overlay */}
          {isLocating && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
              <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Mengesan Lokasi…</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pill & map styles */}
      <style jsx global>{`
        .airbnb-pill {
          position: relative;
          background: white;
          color: #1e293b;
          font-size: 11px;
          font-weight: 900;
          padding: 5px 10px;
          border-radius: 20px;
          border: 1.5px solid rgba(0,0,0,0.12);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
          transform: translate(-50%, -100%);
          display: inline-block;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .airbnb-pill::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: white;
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08));
        }
        .airbnb-pill:hover,
        .airbnb-pill--active {
          background: #1e293b;
          color: white;
          border-color: #1e293b;
          transform: translate(-50%, -100%) scale(1.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          z-index: 999;
        }
        .airbnb-pill--active::after {
          border-top-color: #1e293b;
        }
        .leaflet-container {
          font-family: inherit;
        }
        /* Hide default leaflet attribution branding a bit */
        .leaflet-control-attribution {
          font-size: 9px !important;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

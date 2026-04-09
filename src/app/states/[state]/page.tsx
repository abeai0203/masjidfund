"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { getProjectsByState } from "@/lib/api";
import ProjectCard from "@/components/public/ProjectCard";
import { Project } from "@/lib/types";

export default function StateProjectsPage({ params }: { params: Promise<{ state: string }> }) {
  const resolvedParams = use(params);
  const stateParam = decodeURIComponent(resolvedParams.state);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format the state name for display (e.g. "kuala lumpur" -> "Kuala Lumpur")
  const displayState = stateParam.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getProjectsByState(stateParam);
        setProjects(data);
      } catch (err) {
        console.error("Failed to load state projects:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [stateParam]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <div className="mb-6">
        <Link 
          href="/projects" 
          className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke senarai projek
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Projek Masjid di {displayState}</h1>
        <p className="text-foreground/80 max-w-2xl">
          Sokong pembinaan masjid, pengubahsuaian, dan keperluan penyelenggaraan yang disahkan di negeri {displayState}. 
          Setiap sumbangan membantu mengukuhkan komuniti setempat.
        </p>
      </div>

      <div>
        <div className="mb-6 flex justify-between items-center text-sm text-foreground/60 font-medium tracking-wide">
          <span>{isLoading ? "MEMUAT TURUN..." : `MENUNJUKKAN ${projects.length} PROJEK`}</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-surface-muted animate-pulse rounded-2xl border border-border"></div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-muted border border-border rounded-xl flex flex-col items-center justify-center p-12 text-center h-64">
             <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <svg className="w-8 h-8 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Tiada projek ditemui di {displayState}</h3>
            <p className="text-foreground/60 max-w-md">
              Buat masa ini, kami tidak mempunyai kempen aktif yang disahkan di negeri ini. Sila semak semula nanti atau lihat projek di negeri-negeri lain.
            </p>
            <Link 
              href="/projects"
              className="mt-6 text-primary font-medium hover:text-primary-hover px-6 py-2 bg-primary/5 border border-primary/20 rounded-lg transition-colors"
            >
              Lihat semua wilayah
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

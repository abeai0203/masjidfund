"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjectCard from "@/components/public/ProjectCard";
import ProjectFilters, { FilterState } from "@/components/public/ProjectFilters";
import { getPublicProjects } from "@/lib/api";
import { Project } from "@/lib/types";

function ProjectsContent() {
  const searchParams = useSearchParams();
  const urlState = searchParams.get('state');
  
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    state: urlState || "",
    projectType: "",
    verificationStatus: "",
  });
  
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync filter when URL param changes (e.g. clicking different state buttons while on the page)
  useEffect(() => {
    if (urlState !== null) {
      setFilters(prev => ({ ...prev, state: urlState }));
    }
  }, [urlState]);

  useEffect(() => {
    async function loadData() {
      const data = await getPublicProjects();
      setAllProjects(data);
      setIsLoading(false);
    }
    loadData();
  }, []);
  
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        !searchTerm || 
        project.mosque_name.toLowerCase().includes(searchTerm) || 
        project.title.toLowerCase().includes(searchTerm);

      // Extract state display name from project
      const projectState = (project.state || "").trim().toLowerCase();
      const filterState = filters.state.toLowerCase();
      
      const matchesState = !filters.state || 
        projectState === filterState || 
        projectState.includes(filterState) || 
        filterState.includes(projectState);

      const matchesType = !filters.projectType || project.project_type === filters.projectType;
      const matchesStatus = !filters.verificationStatus || project.verification_status === filters.verificationStatus;

      return matchesSearch && matchesState && matchesType && matchesStatus;
    });
  }, [filters, allProjects]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Temui Projek</h1>
        <p className="text-foreground/80">Lihat semua kempen derma masjid yang disahkan di seluruh Malaysia.</p>
      </div>
      
      <div className="mb-10">
        <ProjectFilters filters={filters} onFilterChange={setFilters} allProjects={allProjects} />
      </div>

      <div>
        <div className="mb-4 flex justify-between items-center text-sm text-foreground/60 font-medium tracking-wide">
          <span>{isLoading ? "Memuatkan..." : `Menunjukkan ${filteredProjects.length} projek`}</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-border"></div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-muted border border-border rounded-xl h-64 flex flex-col items-center justify-center p-8 text-center">
            <svg className="w-12 h-12 text-foreground/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-bold text-foreground mb-1">Tiada projek ditemui</h3>
            <p className="text-foreground/60 max-w-sm">Kami tidak menemui sebarang projek yang sepadan dengan penapis anda. Cuba laras semula kriteria carian anda.</p>
            <button 
              onClick={() => setFilters({ search: "", state: "", projectType: "", verificationStatus: "" })}
              className="mt-4 text-primary font-medium hover:text-primary-hover px-4 py-2 bg-primary/5 rounded-lg transition-colors"
            >
              Kosongkan semua penapis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AllProjectsPage() {
  return (
    <Suspense fallback={
       <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
          <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg mb-8"></div>
          <div className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-border"></div>
       </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}

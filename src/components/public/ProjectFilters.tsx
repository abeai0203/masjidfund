"use client";

import { ProjectType, Project } from "@/lib/types";
import { useEffect, useState } from "react";
import { getAllStates } from "@/lib/api";

export interface FilterState {
  search: string;
  state: string;
  projectType: string;
  verificationStatus: string;
}

interface ProjectFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  allProjects: Project[];
}

export default function ProjectFilters({ filters, onFilterChange, allProjects }: ProjectFiltersProps) {
  const [states, setStates] = useState<string[]>([]);
  
  useEffect(() => {
    getAllStates().then(setStates);
  }, []);
  
  // Extract unique filter options from mock data
  const projectTypes = Array.from(new Set(allProjects.map(p => p.project_type))).sort();
  const verificationStatuses = ["Verified", "Basic Checked", "Pending"]; // Enforced order

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-5 space-y-4">
      {/* Search Bar */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-foreground/80 mb-1">
          Cari
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            placeholder="Cari mengikut nama masjid atau projek..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State Filter */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-foreground/80 mb-1">
            Negeri
          </label>
          <select
            id="state"
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
            value={filters.state}
            onChange={(e) => updateFilter("state", e.target.value)}
          >
            <option value="">Semua Negeri</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Project Type Filter */}
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-foreground/80 mb-1">
            Jenis Projek
          </label>
          <select
            id="projectType"
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
            value={filters.projectType}
            onChange={(e) => updateFilter("projectType", e.target.value)}
          >
            <option value="">Semua Jenis</option>
            {projectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Verification Status Filter */}
        <div>
          <label htmlFor="verificationStatus" className="block text-sm font-medium text-foreground/80 mb-1">
            Pengesahan
          </label>
          <select
            id="verificationStatus"
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-shadow"
            value={filters.verificationStatus}
            onChange={(e) => updateFilter("verificationStatus", e.target.value)}
          >
            <option value="">Semua Status</option>
            {verificationStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Clear Filters Button (only shows if filters active) */}
      {(filters.search || filters.state || filters.projectType || filters.verificationStatus) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onFilterChange({ search: "", state: "", projectType: "", verificationStatus: "" })}
            className="text-sm text-foreground/60 hover:text-primary font-medium transition-colors focus:outline-none"
          >
            Set Semula Semua Penapis
          </button>
        </div>
      )}
    </div>
  );
}

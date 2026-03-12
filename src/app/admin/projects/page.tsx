"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminProjects } from "@/lib/api";
import { Project } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import StatusPill from "@/components/admin/StatusPill";

export default function AdminProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    getAdminProjects().then(data => {
      setAllProjects(data);
      setIsLoading(false);
    });
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredProjects = allProjects.filter(project => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Published" || statusFilter === "Draft") {
       return project.publish_status === statusFilter;
    }
    return project.verification_status === statusFilter;
  });



  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengurusan Projek</h1>
          <p className="text-foreground/70 text-sm mt-1">Urus, edit, dan terbitkan kempen masjid yang disahkan.</p>
        </div>
        
        <div className="flex flex-wrap bg-surface-muted p-1 rounded-lg border border-border gap-1">
          {["All", "Published", "Draft", "Verified", "Pending"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                statusFilter === status 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {status === "All" ? "Semua" : status === "Published" ? "Diterbitkan" : status === "Draft" ? "Draf" : status === "Verified" ? "Disahkan" : "Menunggu"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="bg-surface-muted border-b border-border text-xs uppercase font-semibold text-foreground/60">
              <tr>
                <th className="px-6 py-4">Tajuk / Masjid</th>
                <th className="px-6 py-4">Wilayah</th>
                <th className="px-6 py-4">Kemajuan</th>
                <th className="px-6 py-4">Pengesahan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-4 text-center text-sm text-foreground/50">
                    Memuatkan projek...
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.slug} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground line-clamp-1">{project.title}</div>
                      <div className="text-xs text-foreground/60 mt-1">
                        {project.mosque_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{project.state}</div>
                      <div className="text-xs text-foreground/60 mt-0.5">{project.district}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">{project.completion_percent.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden border border-border">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${Math.min(project.completion_percent, 100)}%` }}
                            ></div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={project.verification_status} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={project.publish_status} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <Link 
                        href={`/admin/projects/${project.slug}`}
                        className="text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground/60">
                    Tiada projek yang sepadan dengan penapis yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

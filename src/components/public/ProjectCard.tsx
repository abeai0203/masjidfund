import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { Project } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col hover:border-primary/50">
        <div className="relative h-56 w-full bg-surface-muted overflow-hidden">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={project.image_url} 
              alt={project.mosque_name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50">
              <span className="text-emerald-700/40 font-black text-xl px-8 text-center">{project.mosque_name}</span>
            </div>
          )}
          
          {/* Mockup Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground shadow-xl">
              {project.state}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-xl border border-emerald-100/20">
              {project.project_type}
            </div>
          </div>
          
          {project.collected_amount >= project.target_amount && (
            <div className="absolute inset-0 bg-emerald-600/20 backdrop-blur-[2px] flex items-center justify-center p-4">
               <div className="bg-white text-emerald-600 px-6 py-2 rounded-full text-xs font-black shadow-2xl border-2 border-emerald-100 animate-pulse">
                 DANA MENCUKUPI
               </div>
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-2">
            <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {project.title}
            </h3>
            <p className="text-sm font-medium text-foreground/60 mt-1">{project.mosque_name}</p>
          </div>
          
          <div className="mb-4">
            <Badge status={project.verification_status} />
          </div>
          
          <p className="text-sm text-foreground/80 line-clamp-2 mb-6">
            {project.short_description}
          </p>
          
          <div className="mt-auto pt-4 border-t border-border-subtle">
             <ProgressBar 
                targetAmount={project.target_amount} 
                collectedAmount={project.collected_amount} 
                percentage={project.completion_percent} 
             />
          </div>
        </div>
      </div>
    </Link>
  );
}

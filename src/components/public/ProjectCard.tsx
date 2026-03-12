import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { Project } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col hover:border-primary/50">
        <div className="relative h-48 w-full bg-surface-muted border-b border-border">
          {project.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={project.image_url} 
              alt={project.mosque_name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <span className="text-primary/40 font-medium whitespace-nowrap px-4 font-xs break-all">{project.mosque_name}</span>
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-foreground shadow-sm">
            {project.state}
          </div>
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-primary shadow-sm">
            {project.project_type}
          </div>
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

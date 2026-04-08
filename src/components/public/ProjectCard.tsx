import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { Project } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";

function shareToWhatsApp(e: React.MouseEvent, project: Project) {
  e.preventDefault();
  e.stopPropagation();
  const url = `https://masjidfund.pages.dev/projects/${project.slug}`;
  const pct = project.target_amount > 0 ? Math.round((project.collected_amount / project.target_amount) * 100) : 0;
  const msg = `🕌 *${project.mosque_name}* memerlukan bantuan anda!\n\n📋 *${project.title}*\n📍 ${project.district}, ${project.state}\n💰 Sasaran: RM${project.target_amount.toLocaleString()}\n✅ Terkumpul: ${pct}%\n\nMari kita sama-sama menyuburkan rumah Allah 🤲\n\n👉 ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

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
            <div className="bg-surface px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground shadow-xl border border-border">
              {project.state.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-surface px-3 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 shadow-xl border border-border">
              {project.project_type.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
            {/* WhatsApp share — visible on hover */}
            <button
              onClick={(e) => shareToWhatsApp(e, project)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#25D366] text-white p-1.5 rounded-lg shadow-xl flex items-center justify-center"
              title="Kongsi ke WhatsApp"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.656zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </button>
          </div>
          
          {project.collected_amount >= project.target_amount && (
            <div className="absolute inset-0 bg-emerald-600/20 backdrop-blur-[2px] flex items-center justify-center p-4">
               <div className="bg-surface text-emerald-600 px-6 py-2 rounded-full text-xs font-bold shadow-2xl border-2 border-primary/20 animate-pulse">
                 Dana Mencukupi
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

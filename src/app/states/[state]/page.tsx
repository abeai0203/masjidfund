import Link from "next/link";
import { getProjectsByState } from "@/lib/api";
import ProjectCard from "@/components/public/ProjectCard";

export default async function StateProjectsPage({ params }: { params: Promise<{ state: string }> }) {
  const resolvedParams = await params;
  const stateParam = decodeURIComponent(resolvedParams.state);
  
  // Format the state name for display (e.g. "kuala lumpur" -> "Kuala Lumpur")
  const displayState = stateParam.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const projects = await getProjectsByState(stateParam);

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
          Back to all projects
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Mosque Projects in {displayState}</h1>
        <p className="text-foreground/80 max-w-2xl">
          Support verified mosque construction, renovation, and maintenance needs in the state of {displayState}. 
          Every contribution helps strengthen the local community.
        </p>
      </div>

      <div>
        <div className="mb-6 flex justify-between items-center text-sm text-foreground/60 font-medium tracking-wide">
          <span>SHOWING {projects.length} PROJECT{projects.length !== 1 ? 'S' : ''}</span>
        </div>

        {projects.length > 0 ? (
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
            <h3 className="text-lg font-bold text-foreground mb-2">No projects found in {displayState}</h3>
            <p className="text-foreground/60 max-w-md">
              We currently don&apos;t have active verified campaigns running in this state. Please check back later or explore projects in other states.
            </p>
            <Link 
              href="/projects"
              className="mt-6 text-primary font-medium hover:text-primary-hover px-6 py-2 bg-primary/5 border border-primary/20 rounded-lg transition-colors"
            >
              Explore all regions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

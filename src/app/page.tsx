import Link from "next/link";
import ProjectCard from "@/components/public/ProjectCard";
import { getPublicProjects, getAllStates } from "@/lib/api";

export default async function Home() {
  const publicProjects = await getPublicProjects();
  const featuredProjects = publicProjects.slice(0, 3);
  const states = await getAllStates();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="bg-surface-muted py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            Empower Communities Through <span className="text-primary">Trusted Giving</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover and support verified mosque construction, renovation, and urgent funding needs across Malaysia. Ensure your charitable giving reaches those who truly need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects"
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg text-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              Discover Projects
            </Link>
            <Link
              href="/submit"
              className="bg-surface border border-border text-foreground hover:bg-surface-muted px-8 py-3 rounded-lg text-lg font-medium transition-all shadow-sm"
            >
              Submit a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Projects</h2>
              <p className="text-foreground/70">Support these urgent mosque needs today.</p>
            </div>
            <Link href="/projects" className="hidden sm:inline-flex items-center text-primary font-medium hover:text-primary-hover">
              View all &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          
          <div className="mt-10 sm:hidden flex justify-center">
            <Link href="/projects" className="inline-flex items-center text-primary font-medium hover:text-primary-hover">
              View all projects &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-muted border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Browse Projects by State</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {states.map(state => (
              <Link 
                key={state} 
                href={`/states/${state.toLowerCase()}`}
                className="bg-surface border border-border hover:border-primary hover:text-primary px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm"
              >
                {state}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Verification Banner */}
      <section className="bg-primary/5 py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-primary/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Trust MasjidFund?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <div className="flex flex-col items-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary text-2xl font-bold border border-primary/10">✓</div>
              <h3 className="font-semibold text-lg mb-2">Verified Committees</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">We ensure direct contact is established with official mosque committee representatives before listing.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary text-2xl font-bold border border-primary/10">🔒</div>
              <h3 className="font-semibold text-lg mb-2">Direct Donations</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">Donations go directly to official bank accounts. We never hold your funds or take a percentage cut.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary text-2xl font-bold border border-primary/10">👁</div>
              <h3 className="font-semibold text-lg mb-2">Transparent Status</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">Clear badge indicators showing exactly what level of verification has been completed for every project.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

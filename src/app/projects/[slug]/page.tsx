"use client";

export const runtime = 'edge';
import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/api";
import { Project } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import DonationModal from "@/components/public/DonationModal";

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadProject() {
      const resolvedParams = await params;
      const data = await getProjectBySlug(resolvedParams.slug);
      setProject(data);
      setIsLoading(false);
    }
    loadProject();
  }, [params]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 w-full flex-grow flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-surface-muted rounded mb-4"></div>
          <div className="h-4 w-64 bg-surface-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) return notFound();

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full flex-grow">
      {/* Breadcrumb / Back Navigation */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge status={project.verification_status} />
              <div className="text-xs font-semibold px-2.5 py-1 bg-surface-muted border border-border rounded-md text-foreground">
                {project.state} • {project.district}
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md">
                {project.project_type}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
              {project.title}
            </h1>
            <p className="text-lg text-foreground/70 font-medium pb-6 border-b border-border">
              {project.mosque_name}
            </p>
          </div>

          {/* Featured Image */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-surface-muted border border-border">
            {project.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.image_url} alt={project.mosque_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <span className="text-primary/40 font-medium">Tiada Imej Tersedia</span>
              </div>
            )}
          </div>

          {/* Full Description & Story */}
          <section className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4">Mengenai Kempen Ini</h2>
            <div className="prose prose-sm sm:prose-base max-w-none prose-p:text-foreground/80 prose-p:leading-relaxed">
              <p>{project.full_description}</p>
            </div>
            
            {/* Trust Info */}
            <div className="mt-8 bg-surface-muted rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground flex items-center mb-3">
                <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Amanah & Pengesahan
              </h3>
              <p className="text-sm text-foreground/70 mb-3">
                Kempen ini telah disemak oleh platform. Butiran jawatankuasa telah disahkan berbanding daftar majlis tempatan rasmi di mana yang berkenaan.
              </p>
              <Link href="/about/trust" className="text-sm text-primary hover:text-primary-hover font-medium">
                Ketahui lebih lanjut tentang proses pengesahan kami &rarr;
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column - Sticky Donation Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface rounded-2xl p-6 border border-border shadow-lg">
            
            {/* Progress Area */}
            <div className="mb-6">
              <ProgressBar 
                targetAmount={project.target_amount}
                collectedAmount={project.collected_amount}
                percentage={project.completion_percent}
              />
            </div>

            {/* Status indicators */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm border-b border-border-subtle pb-3">
                <span className="text-foreground/60">Status Pengesahan</span>
                <span className="font-semibold">{
                  project.verification_status === "Verified" ? "Disahkan" : 
                  project.verification_status === "Basic Checked" ? "Semakan Asas" : "Menunggu"
                }</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border-subtle pb-3">
                <span className="text-foreground/60">Keperluan Kempen</span>
                <span className="font-semibold text-primary">{project.needs_donation ? "Aktif" : "Dana Mencukupi"}</span>
              </div>
            </div>

            {/* Sticky Action Button */}
            <div className="bg-surface-muted -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-border mt-auto">
              {project.needs_donation ? (
                <>
                  <p className="text-sm text-foreground/70 mb-4 text-center">
                    Derma terus ke akaun rasmi masjid.
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    Derma Sekarang
                  </button>
                </>
              ) : (
                <div className="w-full bg-surface border border-border text-foreground/60 font-bold py-3.5 px-4 rounded-xl text-center flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sasaran Dicapai. Terima kasih!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Donation Modal Logic */}
      <DonationModal 
        project={project} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

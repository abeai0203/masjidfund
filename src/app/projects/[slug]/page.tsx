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
            <div className="prose prose-sm sm:prose-base max-w-none prose-p:text-foreground prose-p:leading-relaxed">
              <p className="whitespace-pre-wrap">{project.full_description}</p>
            </div>
            
            {/* Trust Info */}
            <div className="mt-8 bg-surface-muted rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground flex items-center mb-3">
                <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Amanah & Pengesahan
              </h3>
              <p className="text-sm text-foreground/70 mb-5 leading-relaxed">
                Kempen ini telah disemak oleh platform. Butiran projek telah disahkan sama dengan paparan iklan berkenaan. Jika ada sebarang khilaf/keraguan boleh hubungi kami segera.
              </p>
              <Link 
                href={`/feedback?project_id=${project.id}&project_name=${encodeURIComponent(project.title)}`} 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-green-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Hubungi Kami
              </Link>
              <Link href="/about/trust" className="text-sm text-primary hover:text-primary-hover font-medium">
                Ketahui lebih lanjut tentang proses pengesahan kami &rarr;
              </Link>
            </div>
          </section>

          {/* Contact & Location Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PIC Info */}
            <section className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Maklumat Hubungi
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-foreground/60 uppercase tracking-widest block mb-1">Orang Bertanggungjawab</label>
                  <p className="font-bold text-foreground">{project.contact_person || "Pihak Pengurusan Masjid"}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-foreground/60 uppercase tracking-widest block mb-1">No. Telefon</label>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-foreground">{project.contact_phone || "-"}</p>
                    {project.contact_phone && (
                      <Link 
                        href={`https://wa.me/${(() => {
                          const cleaned = project.contact_phone.replace(/[^0-9]/g, '');
                          return cleaned.startsWith('01') ? `6${cleaned}` : cleaned.startsWith('60') ? cleaned : cleaned.startsWith('6') ? cleaned : `60${cleaned}`;
                        })()}`} 
                        target="_blank"
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.656zm6.29-4.131c1.517.9 3.313 1.381 5.143 1.382 5.61 0 10.169-4.559 10.173-10.17.001-2.716-1.058-5.271-2.982-7.195a10.024 10.024 0 0 0-7.195-2.981c-5.611 0-10.17 4.559-10.174 10.173a10.141 10.141 0 0 0 1.514 5.32l-.993 3.654 3.707-.975zM17.47 15.3c-.308-.154-1.821-.898-2.103-1-s-.487-.154-.692.154-.795 1-1.012 1.244-.411.231-.718.077c-.308-.154-1.299-.478-2.474-1.527-.913-.815-1.53-1.821-1.71-2.129-.179-.308-.019-.475.134-.627.139-.136.308-.359.461-.538.154-.179.205-.308.308-.513s.051-.385-.026-.538c-.077-.154-.692-1.667-.948-2.282-.25-.601-.502-.519-.691-.529-.179-.009-.385-.011-.59-.011a1.14 1.14 0 0 0-.821.385c-.282.308-1.077 1.051-1.077 2.564s1.103 2.974 1.256 3.179c.154.205 2.167 3.308 5.248 4.641.733.318 1.305.508 1.748.648.736.234 1.406.201 1.936.12.59-.09 1.821-.744 2.077-1.462.256-.718.256-1.333.179-1.462-.076-.128-.282-.205-.59-.359z" />
                        </svg>
                        WhatsApp
                      </Link>
                    )}
                  </div>
                </div>
                {project.source_url && (
                  <div>
                    <label className="text-xs font-black text-foreground/60 uppercase tracking-widest block mb-1">Pautan Sumber</label>
                    <Link 
                      href={project.source_url} 
                      target="_blank"
                      className="text-sm text-primary hover:text-primary-hover font-bold flex items-center gap-2 break-all group"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Buka Pautan Asal
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Address */}
            <section className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <svg className="w-5 h-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Alamat & Lokasi
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-foreground/60 uppercase tracking-widest block mb-1">Alamat Penuh</label>
                  <p className="font-bold text-foreground">{project.address || `${project.mosque_name}, ${project.district}, ${project.state}`}</p>
                </div>
                {project.google_maps_url && (
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border">
                    <iframe 
                      src={project.google_maps_url}
                      className="w-full h-full border-0"
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                )}
              </div>
            </section>
          </div>
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

            <div className="bg-surface-muted -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-border mt-auto">
              {project.collected_amount >= project.target_amount ? (
                 <div className="w-full bg-surface border border-border text-foreground/60 font-bold py-3.5 px-4 rounded-xl text-center flex items-center justify-center">
                   <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   Dana Mencukupi. Terima kasih!
                 </div>
              ) : project.needs_donation ? (
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

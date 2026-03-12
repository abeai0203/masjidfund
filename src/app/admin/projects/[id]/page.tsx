"use client";

export const runtime = 'edge';
import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import StatusPill from "@/components/admin/StatusPill";
import { getProjectBySlug } from "@/lib/api";
import { Project } from "@/lib/types";

export default function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then(resolved => {
      getProjectBySlug(resolved.id).then(data => {
        setProject(data);
        setIsLoading(false);
      });
    });
  }, [params]);

  if (isLoading) return <div>Memuatkan...</div>;
  if (!project) return notFound();

  const handleSave = (e: React.FormEvent, isPublish: boolean) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert(`Simpanan MOCK: Projek ${isPublish ? "diterbitkan" : "disimpan sebagai draf"}.`);
      router.push('/admin/projects');
    }, 600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link 
          href="/admin/projects" 
          className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Projek
        </Link>
        <StatusPill status={project.publish_status} />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Edit Projek</h1>
        <p className="text-foreground/70 text-sm mt-1">{project.title}</p>
      </div>

      <form className="space-y-8" onSubmit={(e) => handleSave(e, false)}>
        
        {/* Basic Info Section */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Maklumat Asas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Tajuk Kempen</label>
              <input 
                type="text" 
                defaultValue={project.title}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Nama Masjid</label>
              <input 
                type="text" 
                defaultValue={project.mosque_name}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Jenis Projek</label>
              <select 
                defaultValue={project.project_type}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Construction">Pembinaan</option>
                <option value="Renovation">Pengubahsuaian</option>
                <option value="Maintenance">Penyelenggaraan</option>
                <option value="Emergency Fund">Tabung Kecemasan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Negeri</label>
              <input 
                type="text" 
                defaultValue={project.state}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Daerah / Kawasan</label>
              <input 
                type="text" 
                defaultValue={project.district}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Butiran Kempen</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Ringkasan pendek (untuk kad)</label>
              <textarea 
                defaultValue={project.short_description}
                rows={2}
                maxLength={150}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-foreground/50 mt-1">Pastikan bawah 150 aksara.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Cerita Penuh / Penerangan</label>
              <textarea 
                defaultValue={project.full_description}
                rows={8}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
               <label className="block text-sm font-semibold text-foreground/80 mb-2">URL Imej Pengepala</label>
              <input 
                type="url" 
                defaultValue={project.image_url}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Verification & Financials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Trust Area */}
          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Pengesahan</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Tahap Status</label>
                <select 
                  defaultValue={project.verification_status}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="Pending">Menunggu Pengesahan</option>
                  <option value="Basic Checked">Semakan Asas (Atas Talian)</option>
                  <option value="Verified">Disahkan Sepenuhnya (AJK Dihubungi)</option>
                </select>
                <p className="text-xs text-foreground/50 mt-2 leading-relaxed">Pastikan semua dokumen berkaitan telah dirujuk dalam sistem semakan dalaman sebelum menaik taraf ke Disahkan Sepenuhnya.</p>
              </div>
            </div>
          </div>

          {/* Money Area */}
          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Data Kewangan</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Jumlah Sasaran (RM)</label>
                <input 
                  type="number" 
                  defaultValue={project.target_amount}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Dikumpul (RM)</label>
                <input 
                  type="number" 
                  defaultValue={project.collected_amount}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="col-span-2 pt-2 border-t border-border mt-2">
                 <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={project.needs_donation}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50 bg-surface-muted" 
                  />
                   <span className="text-sm font-semibold text-foreground/80">Sedang aktif mencari derma</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm mb-8">
           <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Kaedah Pembayaran Rasmi</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Modaliti Aktif</label>
                <select 
                  defaultValue={project.donation_method_type}
                  className="w-full md:w-1/2 bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="DuitNow QR">Hanya DuitNow QR</option>
                  <option value="Bank Transfer">Hanya Pindahan Bank Terus</option>
                  <option value="Both">Kedua-duanya Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Nama Bank</label>
                <input 
                  type="text" 
                  defaultValue={project.bank_name}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Nombor Akaun</label>
                <input 
                  type="text" 
                  defaultValue={project.account_number}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Nama Akaun Berdaftar</label>
                <input 
                  type="text" 
                  defaultValue={project.account_name}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground/80 mb-2">URL Imej DuitNow QR</label>
                <input 
                  type="url" 
                  defaultValue={project.duitnow_qr_url}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
           </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg flex justify-end gap-3 z-50">
           <button 
             type="button"
             onClick={(e) => handleSave(e, false)}
             disabled={isSaving}
             className="px-6 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-sm font-medium transition-colors"
           >
             {isSaving ? "Menyimpan..." : "Simpan Draf"}
           </button>
           <button 
             type="button"
             onClick={(e) => handleSave(e, true)}
             disabled={isSaving}
             className="px-6 py-2.5 rounded-lg border border-primary/20 bg-primary hover:bg-primary-hover text-white text-sm font-medium shadow-sm transition-colors"
           >
             {isSaving ? "Menerbitkan..." : "Simpan & Terbit"}
           </button>
        </div>

      </form>
    </div>
  );
}

"use client";

export const runtime = 'edge';
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { getProjectBySlug, updateProject, deleteProject } from "@/lib/api";
import { Project, ProjectType } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";

export default function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [coords, setCoords] = useState<{lat: string, lng: string}>({lat: "", lng: ""});

  useEffect(() => {
    params.then(resolved => {
      getProjectBySlug(resolved.id).then(data => {
        setProject(data);
        if (data) {
          setCoords({
            lat: data.latitude?.toString() || "",
            lng: data.longitude?.toString() || ""
          });
        }
        setIsLoading(false);
      });
    });
  }, [params]);

  if (isLoading) return <div>Memuatkan...</div>;
  if (!project) return notFound();

  const handleSave = async (e: React.FormEvent, isPublish: boolean) => {
    e.preventDefault();
    if (!project || !formRef.current) return;
    setIsSaving(true);
    
    const formData = new FormData(formRef.current);
    const updates: Partial<Project> = {
      title: formData.get('title') as string,
      mosque_name: formData.get('mosque_name') as string,
      project_type: formData.get('project_type') as ProjectType,
      state: formData.get('state') as string,
      district: formData.get('district') as string,
      short_description: formData.get('short_description') as string,
      full_description: formData.get('full_description') as string,
      image_url: formData.get('image_url') as string,
      verification_status: formData.get('verification_status') as any,
      target_amount: Number(formData.get('target_amount')),
      collected_amount: Number(formData.get('collected_amount')),
      needs_donation: formData.get('needs_donation') === 'on',
      donation_method_type: formData.get('donation_method_type') as any,
      bank_name: formData.get('bank_name') as string,
      account_name: formData.get('account_name') as string,
      account_number: formData.get('account_number') as string,
      duitnow_qr_url: formData.get('duitnow_qr_url') as string,
      contact_person: formData.get('contact_person') as string,
      contact_phone: formData.get('contact_phone') as string,
      address: formData.get('address') as string,
      google_maps_url: formData.get('google_maps_url') as string,
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : undefined,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : undefined,
      source_url: formData.get('source_url') as string,
      publish_status: isPublish ? 'Published' : 'Draft'
    };

    try {
      await updateProject(project.slug, updates);
      setIsSaving(false);
      alert(`Berjaya: Projek telah ${isPublish ? "diterbitkan" : "disimpan sebagai draf"}.`);
      router.push('/admin/projects');
    } catch (error) {
      console.error("Failed to update project", error);
      setIsSaving(false);
      alert("Gagal mengemaskini projek. Sila cuba lagi.");
    }
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

      <form ref={formRef} className="space-y-8" onSubmit={(e) => handleSave(e, project.publish_status === 'Published')}>
        
        {/* Basic Info Section */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Maklumat Asas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Tajuk Kempen</label>
              <input 
                name="title"
                type="text" 
                defaultValue={project.title}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Nama Masjid</label>
              <input 
                name="mosque_name"
                type="text" 
                defaultValue={project.mosque_name}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Jenis Projek</label>
              <select 
                name="project_type"
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
                name="state"
                type="text" 
                defaultValue={project.state}
                list="admin-state-list"
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <datalist id="admin-state-list">
                {["Selangor", "Johor", "Perak", "Pahang", "Kedah", "Terengganu", "Kelantan", "Pulau Pinang", "Melaka", "Negeri Sembilan", "Sabah", "Sarawak", "Perlis", "W.P. Kuala Lumpur"].map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Daerah / Kawasan</label>
              <input 
                name="district"
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
                name="short_description"
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
                name="full_description"
                defaultValue={project.full_description}
                rows={8}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

             <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">URL Imej Pengepala</label>
               <input 
                 name="image_url"
                 type="url" 
                 defaultValue={project.image_url}
                 className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
               />
             </div>

             <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Pautan Sumber (Facebook/Post/Web)</label>
               <input 
                 name="source_url"
                 type="url" 
                 defaultValue={project.source_url}
                 className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                 placeholder="https://facebook.com/posts/..."
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
                  name="verification_status"
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
                  name="target_amount"
                  type="number" 
                  defaultValue={project.target_amount}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Dikumpul (RM)</label>
                <input 
                  name="collected_amount"
                  type="number" 
                  defaultValue={project.collected_amount}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="col-span-2 pt-2 border-t border-border mt-2">
                 <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    name="needs_donation"
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
                  name="donation_method_type"
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
                  name="bank_name"
                  type="text" 
                  defaultValue={project.bank_name}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Nombor Akaun</label>
                <input 
                  name="account_number"
                  type="text" 
                  defaultValue={project.account_number}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Nama Akaun Berdaftar</label>
                <input 
                  name="account_name"
                  type="text" 
                  defaultValue={project.account_name}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground/80 mb-2">URL Imej DuitNow QR</label>
                <input 
                  name="duitnow_qr_url"
                  type="url" 
                  defaultValue={project.duitnow_qr_url}
                  className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
           </div>
        </div>

        {/* Enriched Details Section */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6 pb-2 border-b border-border">Maklumat Hubungi & Lokasi (v5.0)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Orang Bertanggungjawab (PIC)</label>
              <input 
                name="contact_person"
                type="text" 
                defaultValue={project.contact_person}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Nama penuh wakil masjid"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">No. Telefon (WhatsApp)</label>
              <input 
                name="contact_phone"
                type="text" 
                defaultValue={project.contact_phone}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Contoh: 60123456789"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-foreground/80">Alamat Penuh</label>
                <button 
                  type="button"
                  onClick={async () => {
                    const address = (formRef.current?.elements.namedItem('address') as HTMLTextAreaElement)?.value || 
                                   `${project?.mosque_name}, ${project?.state}`;
                    if (!address || address.length < 5) {
                      alert("Sila masukkan alamat atau nama masjid yang lengkap.");
                      return;
                    }
                    try {
                      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
                      const data = await resp.json();
                      if (data && data.length > 0) {
                        const result = data[0];
                        if (formRef.current) {
                          setCoords({ lat: result.lat, lng: result.lon });
                          alert("Lokasi dijumpai & koordinat telah dikemaskini!");
                        }
                      } else {
                        alert("Lokasi tidak dijumpai.");
                      }
                    } catch (e) {
                      alert("Ralat mencari lokasi.");
                    }
                  }}
                  className="text-xs font-bold text-primary hover:underline uppercase flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Auto-Cari Lokasi
                </button>
              </div>
              <textarea 
                name="address"
                defaultValue={project.address}
                rows={2}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Latitude</label>
              <input 
                name="latitude"
                type="number" 
                step="any"
                value={coords.lat}
                onChange={(e) => setCoords(prev => ({ ...prev, lat: e.target.value }))}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Longitude</label>
              <input 
                name="longitude"
                type="number" 
                step="any"
                value={coords.lng}
                onChange={(e) => setCoords(prev => ({ ...prev, lng: e.target.value }))}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {coords.lat && coords.lng && (
              <div className="md:col-span-2">
                 <div className="aspect-video w-full rounded-xl overflow-hidden border border-border shadow-inner">
                    <iframe 
                      src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    ></iframe>
                 </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground/80 mb-2">URL Google Maps Embed (iframe src)</label>
              <input 
                name="google_maps_url"
                type="url" 
                defaultValue={project.google_maps_url}
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
                <p className="text-[10px] text-foreground/50 mt-1 uppercase font-bold">Nota: Jika koordinat diisi, sistem akan menggunakan koordinat secara automatik.</p>
            </div>
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-lg flex justify-between items-center gap-3 z-50">
           <button 
             type="button"
             onClick={async () => {
               if (confirm("Adakah anda pasti mahu memadam projek ini? Tindakan ini tidak boleh dibatalkan.")) {
                 setIsDeleting(true);
                 await deleteProject(project.slug);
                 setIsDeleting(false);
                 alert("Projek telah dipadam.");
                 router.push('/admin/projects');
               }
             }}
             disabled={isSaving || isDeleting}
             className="px-6 py-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
           >
             {isDeleting ? "Memadam..." : "Padam Projek"}
           </button>

           <div className="flex gap-3">
             <button 
               type="button"
               onClick={(e) => handleSave(e, false)}
               disabled={isSaving || isDeleting}
               className="px-6 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-sm font-medium transition-colors disabled:opacity-50"
             >
               {isSaving ? "Menyimpan..." : "Simpan Draf"}
             </button>
             <button 
               type="button"
               onClick={(e) => handleSave(e, true)}
               disabled={isSaving || isDeleting}
               className="px-6 py-2.5 rounded-lg border border-primary/20 bg-primary hover:bg-primary-hover text-white text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
             >
               {isSaving ? "Menerbitkan..." : "Simpan & Terbit"}
             </button>
           </div>
        </div>

      </form>
    </div>
  );
}

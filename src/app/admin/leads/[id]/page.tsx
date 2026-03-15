"use client";

export const runtime = 'edge';
import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { getLeadById, updateLead, updateLeadStatus, approveAndConvertToProject } from "@/lib/api";
import { Lead } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";
import DuitNowQR from "@/components/ui/DuitNowQR";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [editableLead, setEditableLead] = useState<Partial<Lead>>({});

  useEffect(() => {
    params.then(resolved => {
      getLeadById(resolved.id).then(data => {
        setLead(data);
        if (data) {
          setNotes(data.notes || "");
          setEditableLead({
            extracted_mosque_name: data.extracted_mosque_name || "",
            state: data.state || "",
            contact_name: data.contact_name || "",
            contact_phone: data.contact_phone || "",
            detected_bank_name: data.detected_bank_name || "",
            detected_acc_number: data.detected_acc_number || "",
            detected_acc_name: data.detected_acc_name || "",
            detected_project_type: data.detected_project_type || "Maintenance",
          });
        }
        setIsLoading(false);
      });
    });
  }, [params]);

  if (isLoading) return <div>Memuatkan...</div>;
  if (!lead) return notFound();

  const handleSave = async () => {
    setIsSaving(true);
    const resolvedParams = await params;
    const updated = await updateLead(resolvedParams.id, editableLead);
    setIsSaving(false);
    if (updated) {
      setLead(updated);
      alert("Berjaya kemaskini maklumat lead.");
    } else {
      alert("Gagal mengemaskini maklumat lead.");
    }
  };

  const handleAction = async (action: string) => {
    setIsActing(true);
    const resolvedParams = await params;
    
    // First save the current editable data before approving
    if (action === "Approved") {
      await updateLead(resolvedParams.id, editableLead);
      const success = await approveAndConvertToProject(resolvedParams.id, notes);
      setIsActing(false);
      if (success) {
        alert("Berjaya: Lead diluluskan dan projek baru telah diterbitkan secara automatik!");
        router.push('/admin/projects');
      } else {
        alert("Gagal: Ralat berlaku semasa menukar lead kepada projek. Sila periksa log atau database.");
      }
      return;
    }
    
    // Others: Needs Manual Check, Rejected
    let status = action === "Rejected" ? "Rejected" : "Needs Manual Check";
    
    await updateLeadStatus(resolvedParams.id, status, notes);
    
    setIsActing(false);
    const actionMsg = status === "Needs Manual Check" ? "Semakan Manual Diperlukan" : "Ditolak";
    alert(`Berjaya: Lead ditandakan sebagai ${actionMsg}.`);
    router.push('/admin/leads');
  };

  const updateField = (field: keyof Lead, value: string) => {
    setEditableLead(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl pb-20">
      <div className="mb-6 flex justify-between items-center">
        <Link 
          href="/admin/leads" 
          className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Peti Masuk
        </Link>
        <StatusPill status={lead.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col - Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Maklumat Lead Mentah</h2>
            <div className="mb-4">
              <h1 className="text-xl font-bold text-foreground mb-2">{lead.raw_title}</h1>
              <div className="p-4 bg-surface-muted rounded-lg text-sm text-foreground/80 leading-relaxed border border-border whitespace-pre-wrap">
                {lead.raw_summary}
              </div>
            </div>

            {lead.source_url && (
              <div className="mt-4">
                 <p className="text-xs font-semibold text-foreground/60 mb-1">Pautan Sumber</p>
                <a href={lead.source_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm break-all">
                  {lead.source_url}
                </a>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider">Data Diekstrak (Boleh Edit)</h2>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-full font-bold transition-colors disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Nama Masjid</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.extracted_mosque_name || ""}
                  onChange={(e) => updateField('extracted_mosque_name', e.target.value)}
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">PIC (Wakil)</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.contact_name || ""}
                  onChange={(e) => updateField('contact_name', e.target.value)}
                 />
              </div>
              
              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">No. Telefon</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.contact_phone || ""}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Negeri</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.state || ""}
                  onChange={(e) => updateField('state', e.target.value)}
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Jenis Projek</label>
                 <select 
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.detected_project_type || "Maintenance"}
                  onChange={(e) => updateField('detected_project_type', e.target.value)}
                 >
                   <option value="Construction">Construction</option>
                   <option value="Renovation">Renovation</option>
                   <option value="Maintenance">Maintenance</option>
                   <option value="Emergency Fund">Emergency Fund</option>
                 </select>
              </div>

              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Nama Bank</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.detected_bank_name || ""}
                  onChange={(e) => updateField('detected_bank_name', e.target.value)}
                 />
              </div>

              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">No. Akaun</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.detected_acc_number || ""}
                  onChange={(e) => updateField('detected_acc_number', e.target.value)}
                 />
              </div>

              <div className="sm:col-span-2">
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Nama Akaun</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.detected_acc_name || ""}
                  onChange={(e) => updateField('detected_acc_name', e.target.value)}
                 />
              </div>

              {lead.detected_qr && (
                <div className="sm:col-span-1 mt-4 p-4 border border-border rounded-lg bg-surface-muted/50">
                   <p className="text-xs font-semibold text-foreground/60 mb-3 uppercase tracking-wider">QR Dikesan</p>
                   <div className="w-full max-w-[160px]">
                    <DuitNowQR qrUrl={lead.detected_qr} mosqueName={editableLead.extracted_mosque_name || lead.extracted_mosque_name} />
                   </div>
                </div>
              )}
              {lead.image_url && (
                <div className="sm:col-span-1 mt-4 p-4 border border-border rounded-lg bg-surface-muted/50">
                   <p className="text-xs font-semibold text-foreground/60 mb-3 uppercase tracking-wider">Imej Utama</p>
                   <img src={lead.image_url} alt="Main Image" className="w-full h-auto rounded-lg shadow-sm border border-border" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col - Meta & Actions */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Analisis</h2>
            
            <div className="mb-4">
               <p className="text-xs font-semibold text-foreground/60 mb-1">Jenis Sumber</p>
              <p className="text-sm font-medium">{lead.source_type}</p>
            </div>
            
            <div className="mb-4">
               <p className="text-xs font-semibold text-foreground/60 mb-1">Skor Keyakinan</p>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">{lead.lead_score}</span>
                <span className="text-xs text-foreground/60">/ 100</span>
              </div>
            </div>

            <div className="mb-4">
               <p className="text-xs font-semibold text-foreground/60 mb-2">Nota Semakan</p>
              <textarea 
                className="w-full bg-surface-muted border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-foreground/40"
                rows={4}
                placeholder="Tambah nota dalaman untuk penyemak lain..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Tindakan</h2>
            <div className="space-y-3">
              <button 
                onClick={() => handleAction("Approved")}
                disabled={isActing}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isActing ? "Memproses..." : "Luluskan & Terbitkan"}
              </button>
              <button 
                onClick={() => handleAction("Needs Manual Check")}
                disabled={isActing}
                className="w-full bg-orange-100 hover:bg-orange-200 border border-orange-200 text-orange-800 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isActing ? "Memproses..." : "Tandakan untuk Semakan Manual"}
              </button>
              <button 
                onClick={() => handleAction("Rejected")}
                disabled={isActing}
                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isActing ? "Memproses..." : "Tolak Lead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

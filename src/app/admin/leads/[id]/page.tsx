"use client";

export const runtime = 'edge';
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { getLeadById, updateLead, updateLeadStatus, approveAndConvertToProject, uploadImage } from "@/lib/api";
import { Lead } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";
import DuitNowQR from "@/components/ui/DuitNowQR";
import ImageEditor from "@/components/public/ImageEditor";
import jsQR from "jsqr";
import Tesseract from 'tesseract.js';
import DuitNowLogo from "@/components/ui/DuitNowLogo";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [editableLead, setEditableLead] = useState<Partial<Lead>>({});

  // Correction Tools State
  const [isCroppingQR, setIsCroppingQR] = useState(false);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrResults, setOcrResults] = useState<string[]>([]);
  const [ocrProgress, setOcrProgress] = useState(0);

  useEffect(() => {
    getLeadById(leadId).then(data => {
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
          detected_qr: data.detected_qr || "",
          address: data.address || "",
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
      setIsLoading(false);
    });
  }, [leadId]);

  const [isGeocoding, setIsGeocoding] = useState(false);

  const geocodeAddress = async () => {
    const addressQuery = editableLead.address?.trim();
    const mosqueName = editableLead.extracted_mosque_name?.trim();
    const state = editableLead.state?.trim();

    // List of queries to try in order of specificity
    const queries = [];
    if (addressQuery && addressQuery.length > 5) queries.push(addressQuery);
    if (mosqueName && state) queries.push(`${mosqueName}, ${state}`);
    if (mosqueName) queries.push(mosqueName);

    if (queries.length === 0) {
      alert("Sila masukkan alamat atau nama masjid.");
      return;
    }

    setIsGeocoding(true);
    let found = false;

    try {
      for (const q of queries) {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=my`);
        const data = await resp.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          setEditableLead(prev => ({
            ...prev,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: prev.address || result.display_name
          }));
          found = true;
          break; // Stop once we find a match
        }
      }

      if (!found) {
        alert("Lokasi tidak dijumpai. Sila cuba masukkan nama masjid yang lebih ringkas atau alamat yang lebih spesifik.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("Ralat teknikal semasa mencari lokasi.");
    } finally {
      setIsGeocoding(false);
    }
  };

  if (isLoading) return <div>Memuatkan...</div>;
  if (!lead) return notFound();

  const handleSave = async () => {
    setIsSaving(true);
    const updated = await updateLead(leadId, editableLead);
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
    
    // First save the current editable data before approving
    if (action === "Approved") {
      await updateLead(leadId, editableLead);
      const success = await approveAndConvertToProject(leadId, notes || lead?.notes);
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
    
    await updateLeadStatus(leadId, status, notes);
    
    setIsActing(false);
    const actionMsg = status === "Needs Manual Check" ? "Semakan Manual Diperlukan" : "Ditolak";
    alert(`Berjaya: Lead ditandakan sebagai ${actionMsg}.`);
    router.push('/admin/leads');
  };

  const decodeAndSetQr = async (imgSource: string, isUpload: boolean = false) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgSource;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // --- PASS 1: NATIVE BARCODE DETECTOR (Most Powerful) ---
      // @ts-ignore - BarcodeDetector is a newer API
      if ('BarcodeDetector' in window) {
        try {
          // @ts-ignore
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            setEditableLead(prev => ({ ...prev, detected_qr: barcodes[0].rawValue }));
            alert("Sempurna! Kod QR berjaya dikesan (Native).");
            setIsActing(false);
            return;
          }
        } catch (e) {
          console.error("Native detector failed, falling back...", e);
        }
      }

      // --- PASS 2: AGGRESSIVE JSQR WITH ADAPTIVE PREPROCESSING ---
      const tryDecode = (scale: number, threshold: number | null, paddingScale: number): string | null => {
        const padding = Math.max(img.width, img.height) * paddingScale;
        const targetWidth = (img.width + padding * 2) * scale;
        const targetHeight = (img.height + padding * 2) * scale;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding * scale, padding * scale, img.width * scale, img.height * scale);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply pre-processing based on pass
        if (threshold !== null) {
          // Channel selection: Use Green Channel for pink/black robustness
          for (let i = 0; i < data.length; i += 4) {
            const g = data[i+1];
            const val = g > threshold ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = val;
          }
        } else {
          // Just Green Channel Grayscale
          for (let i = 0; i < data.length; i += 4) {
            const g = data[i+1];
            data[i] = data[i+1] = data[i+2] = g;
          }
        }

        const code = jsQR(data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
        return code ? code.data : null;
      };

      // 24-pass Sweep Strategy (3 paddings x 2 scales x 4 thresholds)
      let detectedData = null;
      const paddings = [0.1, 0.25, 0.05];
      const scales = [1.0, 1.5];
      const thresholds = [128, 80, 180, null]; // Brightness thresholds

      outer: for (const p of paddings) {
        for (const s of scales) {
          for (const t of thresholds) {
            detectedData = tryDecode(s, t, p);
            if (detectedData) break outer;
          }
        }
      }

      if (detectedData) {
        setEditableLead(prev => ({ ...prev, detected_qr: detectedData }));
        alert("Sempurna! Kod QR berjaya dikesan.");
      } else {
        if (isUpload) {
          setEditableLead(prev => ({ ...prev, detected_qr: imgSource }));
          alert("Gagal: Kod QR masih gagal dikesan. Sila pastikan anda mengambil gambar secara tegak dan tepat.");
        } else {
          alert("Gagal: Sila cuba 'crop' semula dengan membiarkan lebih banyak ruang putih di sekeliling kod.");
        }
      }
      setIsActing(false);
    };
    img.onerror = () => {
      setIsActing(false);
      alert("Ralat memproses imej.");
    };
  };

  // QR Manual Selection Logic
  const handleQrCropComplete = async (croppedImage: string) => {
    setIsCroppingQR(false);
    setIsActing(true);
    decodeAndSetQr(croppedImage);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsActing(true);
    
    // 1. LOCAL-FIRST DECODING (Bypasses CORS & latency)
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        decodeAndSetQr(event.target.result as string, true);
      }
    };
    reader.readAsDataURL(file);

    // 2. BACKGROUND UPLOAD
    try {
      const { url, error } = await uploadImage(file, 'images');
      if (error) {
        console.error("Upload error:", error);
      }
    } catch (err) {
      console.error("Background upload catch:", err);
    }
  };

  // OCR Manual Logic
  const runOcrOnPoster = async () => {
    if (!lead?.image_url) return;
    setIsExtractingOcr(true);
    setOcrProgress(0);
    
    try {
        const { data } = await Tesseract.recognize(
        lead.image_url,
        'msa+eng',
        { 
          logger: m => {
            if (m.status === 'recognizing text') setOcrProgress(m.progress);
          }
        }
      );
      
      const cleanedLines = (data as any).lines
        .map((l: any) => l.text.trim())
        .filter((t: string) => t.length > 2);
        
      setOcrResults(cleanedLines);
    } catch (e) {
      console.error(e);
      alert("Gagal menjalankan OCR.");
    } finally {
      setIsExtractingOcr(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast would be better, but alert/indicator is fine for now
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

              <div>
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Nama Akaun</label>
                 <input 
                  type="text"
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  value={editableLead.detected_acc_name || ""}
                  onChange={(e) => updateField('detected_acc_name', e.target.value)}
                 />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-border mt-2">
                 <div className="flex justify-between items-center mb-2">
                   <label className="text-xs font-bold text-foreground/40 uppercase block">Alamat Penuh & Lokasi</label>
                   <button 
                    onClick={geocodeAddress}
                    disabled={isGeocoding}
                    className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-1"
                   >
                     {isGeocoding ? (
                       "Mencari..."
                     ) : (
                       <>
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                         </svg>
                         Auto-Cari Lokasi
                       </>
                     )}
                   </button>
                 </div>
                 <textarea 
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary outline-none min-h-[60px]"
                  placeholder="Masukkan alamat penuh masjid..."
                  value={editableLead.address || ""}
                  onChange={(e) => updateField('address', e.target.value)}
                 />
                 
                 <div className="sm:col-span-2 pt-2 mt-1">
                    <label className="text-[10px] font-bold text-primary uppercase mb-1 block">Tampal Koordinat (Pantas)</label>
                    <input 
                      type="text" 
                      placeholder="Tampal cth: 3.14, 101.69"
                      className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none placeholder:text-primary/30"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',')) {
                          const [lat, lng] = val.split(',').map(s => s.trim());
                          if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
                            setEditableLead(prev => ({ ...prev, latitude: parseFloat(lat), longitude: parseFloat(lng) }));
                          }
                        }
                      }}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-[10px] font-bold text-foreground/40 uppercase mb-1 block">Latitude</label>
                      <input 
                        type="number"
                        step="any"
                        className="w-full bg-surface-muted border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                        value={editableLead.latitude || ""}
                        onChange={(e) => updateField('latitude' as any, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-foreground/40 uppercase mb-1 block">Longitude</label>
                      <input 
                        type="number"
                        step="any"
                        className="w-full bg-surface-muted border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary outline-none"
                        value={editableLead.longitude || ""}
                        onChange={(e) => updateField('longitude' as any, e.target.value)}
                      />
                    </div>
                 </div>

                 {editableLead.latitude && editableLead.longitude && (
                   <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-border">
                     <iframe 
                        src={`https://www.google.com/maps?q=${editableLead.latitude},${editableLead.longitude}&z=15&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      ></iframe>
                   </div>
                 )}
              </div>

              <div className="sm:col-span-2">
                 <label className="text-xs font-bold text-foreground/40 uppercase mb-1 block">Kod QR (DuitNow String)</label>
                 <textarea 
                  className="w-full bg-surface-muted border border-border rounded-lg px-3 py-2 text-[11px] font-mono focus:ring-1 focus:ring-primary outline-none h-20"
                  placeholder="0002010102111531..."
                  value={editableLead.detected_qr || ""}
                  onChange={(e) => updateField('detected_qr', e.target.value)}
                 />
                 <p className="text-[10px] text-foreground/40 mt-1 italic">Peringatan: Jika menampal secara manual, pastikan kod adalah lengkap.</p>
              </div>

              <div className="sm:col-span-1 mt-4 p-4 border border-border rounded-lg bg-surface-muted/50">
                 <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">QR Preview</p>
                  <div className="flex gap-2">
                    <label className="text-[10px] font-bold text-emerald-600 hover:underline uppercase cursor-pointer">
                      Upload QR Imej
                      <input type="file" className="hidden" accept="image/*" onChange={handleQrUpload} />
                    </label>
                    <span className="text-foreground/20">|</span>
                    <button 
                      onClick={() => setIsCroppingQR(true)}
                      className="text-[10px] font-bold text-primary hover:underline uppercase"
                    >
                      Crop Poster
                    </button>
                  </div>
                 </div>
                 <div className="w-full max-w-[160px]">
                  {editableLead.detected_qr ? (
                    <DuitNowQR 
                      key={editableLead.detected_qr}
                      qrUrl={editableLead.detected_qr} 
                      initialValue={editableLead.detected_qr.startsWith('0002') ? editableLead.detected_qr : undefined}
                      mosqueName={editableLead.extracted_mosque_name || lead.extracted_mosque_name} 
                      accountName={editableLead.detected_acc_name || lead.detected_acc_name}
                      className="bg-white p-2 rounded-xl shadow-inner"
                    />
                  ) : (
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
                      <p className="text-[10px] text-slate-400 font-bold px-4 text-center">Kod QR Belum Disediakan</p>
                    </div>
                  )}
                 </div>
              </div>
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

          {/* Correction Tools */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-4 border-b border-border pb-2">Alatan Pembetulan</h2>
            <div className="space-y-4">
              <button 
                onClick={() => setIsCroppingQR(true)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-[#ed005d]/20 bg-[#ed005d]/5 text-[#ed005d] hover:bg-[#ed005d]/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DuitNowLogo size={24} />
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wide">Pilih Kawasan QR</p>
                    <p className="text-[10px] opacity-60">Crop area QR secara manual</p>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button 
                onClick={runOcrOnPoster}
                disabled={isExtractingOcr}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wide">Ekstrak Teks OCR</p>
                    <p className="text-[10px] opacity-60">
                      {isExtractingOcr ? `Memproses... ${Math.round(ocrProgress * 100)}%` : 'Salin-tampal teks dari poster'}
                    </p>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
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

      {/* OCR Results Panel */}
      {ocrResults.length > 0 && (
        <div className="mt-8 bg-surface border border-border rounded-xl p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider">Hasil Ekstraksi Teks (Klik untuk Salin)</h2>
            <button 
              onClick={() => setOcrResults([])}
              className="text-xs text-foreground/40 hover:text-red-500 font-bold"
            >
              Tutup Panel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {ocrResults.map((line, idx) => (
              <button
                key={idx}
                onClick={() => copyToClipboard(line)}
                className="text-left p-3 bg-surface-muted border border-border rounded-lg text-sm hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group flex items-start gap-2"
              >
                <svg className="w-3 h-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                <span className="line-clamp-2 break-words">{line}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual QR Cropper Modal */}
      {isCroppingQR && lead?.image_url && (
        <ImageEditor 
          image={lead.image_url}
          onCropComplete={handleQrCropComplete}
          onCancel={() => setIsCroppingQR(false)}
        />
      )}
    </div>
  );
}

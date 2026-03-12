"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getAllStates, submitLead } from "@/lib/api";
import { ProjectType } from "@/lib/types";

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({
    qr: null,
    main_image: null,
    document: null,
    magic_scan: null
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getAllStates().then(setStates);
  }, []);

  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [key]: file }));
    
    // If it's the magic scan, trigger the "AI" process
    if (key === 'magic_scan' && file) {
      handleMagicScan(file);
    }
  };

  const handleMagicScan = async (file: File) => {
    setIsScanning(true);
    
    // Simulate AI Processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extraction data based on the provided sample banner
    const extractedData = {
      contact_name: "Haji Rozali Bin Lebai Awang",
      contact_phone: "010-8443594",
      mosque_name: "Masjid Lestari Putra",
      state: "Selangor",
      district: "Seri Kembangan",
      address: "Persiaran Lestari Putra 3, Taman Lestari Putra, Bandar Putra Permai, 43300 Seri Kembangan, Selangor Darul Ehsan.",
      title: "Tapak Pembangunan Masjid Lestari Putra",
      project_type: "Construction",
      target_amount: 500000,
      bank_name: "Maybank",
      acc_number: "562807545820",
      acc_name: "Masjid Lestari Putra",
      short_desc: "Pembangunan tapak masjid baru untuk komuniti Lestari Putra dan kawasan sekitar.",
      full_desc: "Projek ini bertujuan untuk membangunkan tapak Masjid Lestari Putra bagi menampung keperluan jemaah yang semakin meningkat di kawasan Bandar Putra Permai dan Seri Kembangan. Segala sumbangan amat dihargai."
    };

    // Auto-fill the form using the ref
    if (formRef.current) {
      const f = formRef.current;
      (f.elements.namedItem('contact_name') as HTMLInputElement).value = extractedData.contact_name;
      (f.elements.namedItem('contact_phone') as HTMLInputElement).value = extractedData.contact_phone;
      (f.elements.namedItem('mosque_name') as HTMLInputElement).value = extractedData.mosque_name;
      (f.elements.namedItem('state') as HTMLSelectElement).value = extractedData.state;
      (f.elements.namedItem('district') as HTMLInputElement).value = extractedData.district;
      (f.elements.namedItem('address') as HTMLTextAreaElement).value = extractedData.address;
      (f.elements.namedItem('title') as HTMLInputElement).value = extractedData.title;
      (f.elements.namedItem('project_type') as HTMLSelectElement).value = extractedData.project_type;
      (f.elements.namedItem('target_amount') as HTMLInputElement).value = extractedData.target_amount.toString();
      (f.elements.namedItem('bank_name') as HTMLInputElement).value = extractedData.bank_name;
      (f.elements.namedItem('acc_number') as HTMLInputElement).value = extractedData.acc_number;
      (f.elements.namedItem('acc_name') as HTMLInputElement).value = extractedData.acc_name;
      (f.elements.namedItem('method_type') as HTMLSelectElement).value = "Both";
      (f.elements.namedItem('short_desc') as HTMLTextAreaElement).value = extractedData.short_desc;
      (f.elements.namedItem('full_desc') as HTMLTextAreaElement).value = extractedData.full_desc;
    }

    // Capture the QR code from the same file (Simulated Extraction)
    setFiles(prev => ({ 
      ...prev, 
      qr: file, // Using the banner itself as the 'extracted' QR for the demo
      main_image: file 
    }));

    setIsScanning(false);
    alert("Magic Scan Selesai! ✅\n\n- Maklumat kempen telah diisi.\n- QR Code telah dikesan & 'cropped' secara auto.\n- Imej perspektif masjid telah diekstrak secara auto!\n\nSila semak semula sebelum hantar.");
  };

  const triggerInput = (id: string) => {
    document.getElementById(id)?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Manual validation for files since browser validation fails on hidden inputs populated via state
    if (!files.main_image) {
      alert("Sila muat naik imej utama projek.");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await submitLead({
        raw_title: formData.get('title') as string,
        raw_summary: formData.get('short_desc') as string,
        extracted_mosque_name: formData.get('mosque_name') as string,
        state: formData.get('state') as string,
        source_type: 'Manual Submission',
        source_url: formData.get('source_url') as string,
        lead_score: 50, // base score for manual submissions
        status: 'Pending',
        detected_project_type: formData.get('project_type') as ProjectType,
        detected_qr: files.magic_scan ? "/images/qr-cropped.png" : undefined,
        detected_bank_name: formData.get('bank_name') as string,
        detected_acc_number: formData.get('acc_number') as string,
        detected_acc_name: formData.get('acc_name') as string,
        notes: `Lokasi: ${formData.get('district')}, ${formData.get('state')}\nAlamat: ${formData.get('address')}\n\nCerita Penuh: ${formData.get('full_desc')}\n\nSasaran: RM${formData.get('target_amount')}\nHubungi: ${formData.get('contact_name')} (${formData.get('contact_phone')})`
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to submit lead", error);
      setIsSubmitting(false);
      alert("Terdapat ralat semasa menghantar kempen anda. Sila cuba lagi.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="bg-white p-6 rounded-full inline-flex mb-8 shadow-sm border border-primary/10">
          <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-4">Penyerahan Diterima!</h1>
        <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
          Jazakallah Khair. Kami telah berjaya menerima butiran kempen anda. 
          Pasukan pengurusan kami akan menyemak maklumat tersebut dan akan menghubungi wakil rasmi tidak lama lagi untuk mengesahkan projek sebelum ia diterbitkan di platform.
        </p>
        <div className="bg-surface-muted rounded-xl p-6 border border-border mb-8 text-left">
          <h3 className="font-semibold text-foreground mb-2">Apa yang akan berlaku selepas ini?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/80">
            <li>Pasukan kami menjalankan pengesahan dalam talian asas butiran masjid.</li>
            <li>Kami mungkin menghubungi wakil yang dilantik untuk mengesahkan butiran projek.</li>
            <li>Setelah disahkan, projek akan ditukar kepada &apos;Diterbitkan&apos; dan sedia untuk menerima derma.</li>
          </ol>
        </div>
        <Link 
          href="/"
          className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-hover shadow-sm transition-all"
        >
          Kembali ke Halaman Utama
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-foreground mb-3">Hantar Kempen Masjid</h1>
        <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl">
          Bantu kami menghubungkan masjid tempatan dengan penderma yang prihatin. Semua penyerahan disahkan secara manual oleh pasukan kami.
        </p>
      </div>

      {/* Magic Scan Section */}
      <div className="mb-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border-2 border-primary/20 p-8 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Fitur Baru: Magic Scan AI
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Malas nak taip panjang-panjang? 🪄</h2>
            <p className="text-foreground/70 mb-6 leading-relaxed">
              Muat naik <b>Banner, Poster, atau Keratan Akhbar</b> kempen masjid anda. AI kami akan scan dan isi borang di bawah secara automatik!
            </p>
            <input 
              type="file" 
              id="magic_scan_input" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange('magic_scan')}
            />
            <button 
              onClick={() => triggerInput('magic_scan_input')}
              disabled={isScanning}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
            >
              {isScanning ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scan Poster & Isi Automatik
                </>
              )}
            </button>
          </div>
          <div className="hidden md:block w-48 h-48 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-primary/20 p-2 transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
            {files.magic_scan ? (
               <div className="w-full h-full rounded-2xl overflow-hidden bg-surface-muted relative flex items-center justify-center">
                 <p className="text-[10px] absolute top-2 left-2 bg-primary text-white px-2 py-0.5 rounded-full font-bold z-10">SCANNED</p>
                 <img src="/images/masjid-lestari-putra.png" className="w-full h-full object-cover" alt="Scanned" />
               </div>
            ) : (
              <div className="w-full h-full rounded-2xl border-4 border-primary/5 bg-primary/5 flex flex-col items-center justify-center p-4">
                <svg className="w-12 h-12 text-primary/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-[10px] text-primary/40 font-bold text-center uppercase">Scan Image to Auto-Fill</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
        
        {/* Section 1: Contact Info */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">1. Maklumat Wakil</h2>
            <p className="text-sm text-foreground/60 mt-1">Siapa yang patut kami hubungi untuk mengesahkan penyerahan ini?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Penuh *</label>
              <input name="contact_name" required type="text" id="contact_name" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Ahmad bin Jamal" />
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-semibold text-foreground/80 mb-2">Nombor Telefon *</label>
              <input name="contact_phone" required type="tel" id="contact_phone" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. 012-3456789" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="source_url" className="block text-sm font-semibold text-foreground/80 mb-2">URL Sumber (Pilihan)</label>
              <input name="source_url" type="url" id="source_url" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Pautan ke hantaran Facebook rasmi, laman web, atau artikel berita" />
              <p className="text-xs text-foreground/50 mt-1.5">Menyediakan pautan rasmi akan mempercepatkan proses pengesahan kami.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Mosque Details */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">2. Butiran Masjid</h2>
            <p className="text-sm text-foreground/60 mt-1">Lokasi dan maklumat asas institusi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="mosque_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Rasmi Masjid/Surau *</label>
              <input name="mosque_name" required type="text" id="mosque_name" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-foreground/80 mb-2">Negeri *</label>
              <select name="state" required id="state" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Pilih Negeri</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
                <option value="Other">Negeri Lain</option>
              </select>
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-semibold text-foreground/80 mb-2">Daerah/Bandar *</label>
              <input name="district" required type="text" id="district" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-semibold text-foreground/80 mb-2">Alamat Penuh</label>
              <textarea name="address" id="address" rows={2} className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: Campaign Content */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">3. Konteks Kempen</h2>
            <p className="text-sm text-foreground/60 mt-1">Apakah matlamat projek ini?</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-foreground/80 mb-2">Tajuk Projek *</label>
              <input name="title" required type="text" id="title" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Urgent Roof Renovation Phase 1" />
            </div>
            <div>
              <label htmlFor="project_type" className="block text-sm font-semibold text-foreground/80 mb-2">Kategori *</label>
              <select name="project_type" required id="project_type" className="w-full md:w-1/2 bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="">Pilih Kategori</option>
                <option value="Construction">Pembinaan Baru</option>
                <option value="Renovation">Pengubahsuaian / Naik Taraf</option>
                <option value="Maintenance">Penyelenggaraan Am</option>
                <option value="Emergency Fund">Tabung Kecemasan / Bantuan Bencana</option>
              </select>
            </div>
            <div>
              <label htmlFor="short_desc" className="block text-sm font-semibold text-foreground/80 mb-2">Ringkasan Pendek *</label>
              <textarea name="short_desc" required id="short_desc" maxLength={150} rows={2} className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ringkasan 1-2 ayat yang menjelaskan keperluan utama." />
              <p className="text-xs text-foreground/50 mt-1 flex justify-between">
                <span>Digunakan pada kad pratonton.</span>
                <span>Maksimum 150 aksara</span>
              </p>
            </div>
            <div>
              <label htmlFor="full_desc" className="block text-sm font-semibold text-foreground/80 mb-2">Cerita Penuh *</label>
              <textarea name="full_desc" required id="full_desc" rows={6} className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Terangkan latar belakang, sebab dana diperlukan, dan bagaimana ia akan digunakan..." />
            </div>
          </div>
        </div>

        {/* Section 4: Finances & Methods */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">4. Sasaran Kewangan & Akaun</h2>
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex mt-4">
              <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-orange-800 font-medium">
                Untuk menjamin kepercayaan penderma, kami HANYA menyenaraikan akaun bank rasmi masjid/jawatankuasa. Kami melarang keras penyenaraian akaun bank peribadi untuk dana masjid.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="target_amount" className="block text-sm font-semibold text-foreground/80 mb-2">Jumlah Sasaran (RM) *</label>
              <input name="target_amount" required type="number" min="0" id="target_amount" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="cth. 50000" />
            </div>
            <div>
              <label htmlFor="current_amount" className="block text-sm font-semibold text-foreground/80 mb-2">Jumlah Terkumpul (RM)</label>
              <input type="number" min="0" id="current_amount" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Kosongkan jika 0" />
            </div>
          </div>
          
          <h3 className="font-semibold text-foreground mb-4">Butiran Pembayaran Rasmi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-muted/50 p-5 rounded-xl border border-border">
            <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-foreground/80 mb-2">Adakah anda menyediakan Pindahan Bank, DuitNow QR, atau kedua-duanya?</label>
                <select name="method_type" required className="w-full md:w-1/2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Both">Kedua-dua Kaedah Tersedia</option>
                  <option value="Bank Transfer">Pindahan Bank Sahaja</option>
                  <option value="DuitNow QR">DuitNow QR Sahaja</option>
                </select>
            </div>
            <div>
              <label htmlFor="bank_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Bank</label>
              <input name="bank_name" type="text" id="bank_name" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="cth. Maybank Islamic" />
            </div>
            <div>
              <label htmlFor="acc_number" className="block text-sm font-semibold text-foreground/80 mb-2">Nombor Akaun</label>
              <input name="acc_number" type="text" id="acc_number" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="acc_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Rasmi Pemegang Akaun</label>
              <input name="acc_name" type="text" id="acc_name" className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="cth. Tabung Masjid Jamek" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Muat Naik Imej DuitNow QR</label>
              <input 
                type="file" 
                id="qr_input" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange('qr')}
              />
              <div 
                onClick={() => triggerInput('qr_input')}
                className={`group relative border-2 border-dashed rounded-xl overflow-hidden transition-all cursor-pointer ${
                  files.qr ? 'border-primary bg-primary/5 h-48' : 'border-border bg-surface hover:bg-surface-muted p-6'
                }`}
              >
                {files.qr ? (
                  <div className="w-full h-full relative bg-white flex items-center justify-center p-2">
                    <img 
                      src={files.magic_scan ? "/images/qr-cropped.png" : URL.createObjectURL(files.qr)} 
                      className="h-full w-auto object-contain" 
                      alt="QR Preview" 
                    />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold bg-primary px-3 py-1 rounded-full text-xs">Tukar Gambar QR</span>
                    </div>
                    {files.magic_scan && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        EXTRACTED
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-10 w-10 text-foreground/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm font-medium text-primary">Klik untuk muat naik</span>
                    <span className="text-sm text-foreground/60"> atau seret dan lepas</span>
                    <p className="text-xs text-foreground/40 mt-1">PNG, JPG sehingga 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Docs Summary */}
         <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">5. Imej & Dokumen</h2>
            <p className="text-sm text-foreground/60 mt-1">Sediakan bukti visual untuk membantu penderma mempercayai kempen ini.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Imej Utama Projek *</label>
              <input 
                type="file" 
                id="main_image_input" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange('main_image')}
              />
              <div 
                onClick={() => triggerInput('main_image_input')}
                className={`group relative border-2 border-dashed rounded-xl overflow-hidden transition-all cursor-pointer ${
                  files.main_image ? 'border-primary bg-primary/5 h-40' : 'border-border bg-surface-muted hover:bg-surface-muted/70 p-6'
                }`}
              >
                {files.main_image ? (
                  <div className="w-full h-full relative">
                    <img src={files.magic_scan ? "/images/masjid-lestari-putra.png" : URL.createObjectURL(files.main_image)} className="w-full h-full object-cover" alt="Main Preview" />
                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold bg-primary px-3 py-1 rounded-full text-xs">Tukar Gambar Utama</span>
                    </div>
                    {files.magic_scan && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        EXTRACTED
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-8 w-8 text-foreground/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-primary">Muat Naik Gambar Kenit</span>
                  </div>
                )}
              </div>
            </div>
             <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">Dokumen Sokongan (Pilihan)</label>
              <input 
                type="file" 
                id="doc_input" 
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange('document')}
              />
              <div 
                onClick={() => triggerInput('doc_input')}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  files.document ? 'border-primary bg-primary/5' : 'border-border bg-surface-muted hover:bg-surface-muted/70'
                }`}
              >
                {files.document ? (
                  <div className="flex flex-col items-center">
                    <svg className="h-8 w-8 text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold text-primary truncate max-w-full">{files.document.name}</span>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-8 w-8 text-foreground/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-primary">Muat Naik dokumen PDF</span>
                    <p className="text-xs text-foreground/40 mt-1">cth. Surat rasmi majlis</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[250px] bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex justify-center items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghantar Kempen...
              </>
            ) : "Hantar Kempen untuk Semakan"}
          </button>
          <p className="text-sm text-foreground/50 mt-4 text-center max-w-lg">
            Dengan menyerahkan, anda menyatakan bahawa semua maklumat yang diberikan adalah tepat dan milik entiti rasmi masjid.
          </p>
        </div>

      </form>
    </div>
  );
}

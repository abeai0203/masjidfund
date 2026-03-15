"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrustContent() {
  const [activeTab, setActiveTab] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const level = searchParams.get('level');
    if (level) {
      const levelIdx = parseInt(level) - 1;
      if (levelIdx >= 0 && levelIdx < 3) {
        setActiveTab(levelIdx);
        // Scroll to the verification section
        const section = document.getElementById('verification-levels');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [searchParams]);

  const verificationLevels = [
    // ... same levels ...
    {
      title: "1. Pemeriksaan Asas",
      status: "Basic Check",
      label: "Semakan asas selesai",
      description: "Apabila projek dihantar ke platform, pasukan kami akan melakukan semakan awal untuk memastikan kesahihan asas.",
      checkpoints: [
          "Nama masjid wujud dan dapat dikenal pasti",
          "Lokasi masjid adalah jelas",
          "Maklumat projek berkaitan keperluan sebenar",
          "Kaedah sumbangan dinyatakan dengan jelas"
      ],
      pros: "Projek boleh dipaparkan lebih cepat supaya bantuan dapat disalurkan segera.",
      cons: "Tahap pengesahan masih terhad.",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      title: "2. Pengesahan Dokumen",
      status: "Document Verified",
      label: "Dokumen disahkan",
      description: "Wakil masjid perlu memberikan bukti tambahan yang disemak secara manual oleh pasukan kami.",
      checkpoints: [
          "Surat jawatankuasa masjid",
          "Maklumat akaun bank rasmi masjid",
          "Dokumen kelulusan projek (jika ada)",
          "Maklumat pegawai/wakil yang boleh dihubungi"
      ],
      pros: "Memberi tahap keyakinan lebih tinggi kepada penderma.",
      cons: "Proses mengambil sedikit masa kerana semakan manual.",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-700"
    },
    {
      title: "3. Projek Dipercayai",
      status: "Trusted Project",
      label: "Projek dipercayai",
      description: "Status tertinggi untuk projek yang konsisten memberikan kemas kini dan mempunyai rekod yang jelas.",
      checkpoints: [
          "Telah lama berada di platform",
          "Aktif memberi kemas kini pembinaan/projek",
          "Mempunyai rekod sumbangan yang konsisten"
      ],
      pros: "Tahap keyakinan paling tinggi untuk penderma.",
      cons: "Tidak semua projek akan mencapai tahap ini dengan segera.",
      color: "bg-primary",
      lightColor: "bg-primary/10",
      textColor: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute top-0 right-0 -m-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -m-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:gap-3 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Laman Utama
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight">
              Sumbangan Anda, <span className="text-primary italic">Amanah</span> Kami.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
              Di MasjidFund, setiap projek melalui proses semakan untuk memastikan sumbangan anda sampai kepada pihak yang sah.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Journey Section */}
      <section id="verification-levels" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-800 mb-4">Sistem Pengesahan Berlapis</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                Kami menggunakan pendekatan hibrid — memudahkan urusan masjid, tetapi selamat untuk penderma.
              </p>
            </div>

            {/* Interactive Tabs */}
            <div className="bg-white rounded-[40px] p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Side Navigation */}
                <div className="md:w-1/3 flex flex-col gap-2">
                  {verificationLevels.map((lvl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`text-left p-6 rounded-3xl transition-all duration-300 flex items-center gap-4 group ${
                        activeTab === idx 
                        ? `${lvl.lightColor} border-2 border-${lvl.color}` 
                        : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                        activeTab === idx ? `${lvl.color} text-white scale-110` : 'bg-slate-100 text-slate-400 group-hover:scale-110'
                      }`}>
                        <span className="text-lg font-black">{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className={`font-black text-sm uppercase tracking-wider ${activeTab === idx ? lvl.textColor : 'text-slate-500'}`}>
                          {lvl.status}
                        </h3>
                        <p className={`text-xs font-bold ${activeTab === idx ? 'text-slate-600' : 'text-slate-400'}`}>
                          {lvl.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="md:w-2/3 p-6 md:p-10 bg-slate-50/50 rounded-[32px] border border-slate-100 relative overflow-hidden">
                   <div key={activeTab} className="animate-in fade-in slide-in-from-right-8 duration-500">
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${verificationLevels[activeTab].color}`}>
                          Level {activeTab + 1}
                        </span>
                        <h3 className="text-2xl font-black text-slate-800">{verificationLevels[activeTab].title}</h3>
                      </div>

                      <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                        {verificationLevels[activeTab].description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 text-sm">
                        <div className="space-y-4">
                          <h4 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                             <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                             Semakan Kami
                          </h4>
                          <ul className="space-y-2">
                            {verificationLevels[activeTab].checkpoints.map((p, i) => (
                              <li key={i} className="text-slate-500 font-medium flex items-start gap-2">
                                <span className="w-1 h-1 bg-slate-300 rounded-full mt-2 shrink-0"></span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-black text-emerald-600 uppercase tracking-tighter mb-2 italic">Kelebihan</h4>
                            <p className="text-slate-500 font-medium">{verificationLevels[activeTab].pros}</p>
                          </div>
                          <div>
                            <h4 className="font-black text-red-500 uppercase tracking-tighter mb-2 italic">Kekurangan</h4>
                            <p className="text-slate-500 font-medium">{verificationLevels[activeTab].cons}</p>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Psychology Section (Direct Giving) */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Amanah Tanpa Perantara</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Kami Tidak Memegang <span className="text-primary">Dana</span> Anda.
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Setiap sen sumbangan anda dihantar terus ke akaun rasmi masjid melalui DuitNow QR atau pemindahan bank. MasjidFund hanyalah pemudah cara (discovery platform).
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                  <span className="font-bold">Ketelusan 100% Akaun Masjid</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-bold">Tiada Caj Perkhidmatan (0% Fees)</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-800/80 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="font-black text-xl italic text-primary">MasjidFund</div>
                  <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">Safety Check</div>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                   </div>
                   <div>
                     <div className="text-xs font-black uppercase text-emerald-400">Status</div>
                     <div className="font-bold">Sambungan Terus Disah</div>
                   </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-white/5 rounded-full w-full"></div>
                  <div className="h-2 bg-white/5 rounded-full w-2/3"></div>
                  <div className="h-2 bg-white/5 rounded-full w-1/2"></div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/40 rounded-full blur-[60px]"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden">
        {/* Islamic Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute top-0 right-0 -tranislate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-[64px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                
                {/* Visual Section - Concept 3: Minaret & Scroll */}
                <div className="lg:w-5/12 bg-slate-50 relative p-12 flex items-center justify-center min-h-[400px]">
                  <div className="absolute inset-0 opacity-40" style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5.878 18.09h19.022l-15.389 11.18 5.878 18.09-15.389-11.18-15.389 11.18 5.878-18.09-15.389-11.18h19.022z' fill='%23059669' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                  }}></div>
                  
                  <div className="relative z-10 w-full max-w-sm transform hover:scale-105 transition-transform duration-700">
                    {/* Placeholder for Concept 3 Illustration */}
                    <img 
                      src="/images/illustrations/report-mosque.png" 
                      alt="Islamic Trust Illustration" 
                      className="w-full h-auto drop-shadow-2xl animate-in fade-in zoom-in duration-1000"
                    />
                    
                    {/* Floating Islamic Geometric Token */}
                    <div className="absolute -top-6 -left-6 w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:w-7/12 p-12 md:p-20 space-y-10">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sistem Amanah MasjidFund</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-slate-800 leading-[1.15] tracking-tight">
                      Laporkan Maklumat <br />
                      <span className="text-primary italic">Yang Meragukan</span>
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                      Integriti adalah tunggak utama kami. Jika anda mendapati sebarang maklumat projek yang tidak tepat, sila maklumkan kepada kami untuk tindakan segera demi menjaga amanah penderma.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link 
                      href="/feedback" 
                      className="group bg-slate-900 border-2 border-slate-900 hover:bg-black p-6 rounded-[32px] text-white transition-all shadow-xl shadow-slate-200 flex flex-col justify-between h-48"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-black">Hubungi Kami</div>
                        <div className="text-sm text-slate-400 font-medium">Buka tiket aduan segera</div>
                      </div>
                    </Link>

                    <div className="bg-white border-2 border-slate-100 hover:border-primary/20 p-6 rounded-[32px] text-slate-800 transition-all flex flex-col justify-between h-48 group">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-black tracking-tight">Polisi Keselamatan</div>
                        <div className="text-sm text-slate-500 font-medium">Lihat bagaimana kami menapis projek</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-500 underline decoration-primary/30 decoration-2 underline-offset-4">
                      Sertai 1,200+ pengguna yang membantu menjaga integriti platform kami.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-10 text-center pt-20">
         <div className="text-slate-300 font-black tracking-widest uppercase text-xs">Amanah & Ketelusan Digital</div>
      </footer>
    </div>
  );
}

export default function TrustPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuatkan...</div>}>
      <TrustContent />
    </Suspense>
  );
}

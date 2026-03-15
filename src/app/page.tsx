"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/public/ProjectCard";
import InteractiveMap from "@/components/public/InteractiveMap";
import { getPublicProjects, getAllStates } from "@/lib/api";
import { Project } from "@/lib/types";

export default function Home() {
  const [publicProjects, setPublicProjects] = useState<Project[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const projects = await getPublicProjects();
      const st = await getAllStates();
      setPublicProjects(projects);
      setStates(st);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const featuredProjects = publicProjects.slice(0, 3);

  return (
    <div className="flex flex-col min-h-full">
      {/* Magic CTA Banner - Primary Focus */}
      {/* Premium Hero Banner - Vector Emerald Theme */}
      <section className="relative bg-emerald-950 pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/images/mosque-banner-vector.png" 
            alt="Mosque Illustration" 
            className="w-full h-full object-cover opacity-30 md:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 via-emerald-600/60 to-transparent"></div>
        </div>

        {/* Large Aesthetic Wave/Hill Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-surface z-10 pointer-events-none" style={{ borderRadius: '100% 100% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.5)', marginBottom: '-1px' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-20 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left flex-1 max-w-2xl px-4">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
              Rebut <span className="text-yellow-400">Pahala</span> <br />
              <span className="underline decoration-white decoration-4 sm:decoration-8 underline-offset-8 sm:underline-offset-12">Tanpa Henti.</span>
            </h2>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Bina Masjid di Dunia, Dirikan Rumah di Syurga
            </h3>
            <p className="text-white text-sm sm:text-base mb-8 leading-relaxed font-medium max-w-lg">
              Gandakan pahala anda dengan menyumbang kepada pembinaan masjid. Setiap kali jemaah solat, Al-Quran dibaca, atau ilmu diajar, pahala anda terus mengalir berkekalan. <br />
              <span className="text-xs font-bold text-yellow-400/90 mt-2 inline-block">Sabda Rasulullah ﷺ</span>
            </p>

            {/* Hadith Quote Box - Glassmorphism */}
            <div className="flex items-start gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-5 rounded-[24px] max-w-xl shadow-2xl mt-6 sm:mt-0">
              <div className="text-2xl sm:text-3xl text-emerald-300 opacity-50 font-serif leading-none mt-1">“</div>
              <div>
                <p className="text-white text-xs sm:text-sm font-bold leading-relaxed">
                  “Sesiapa yang <span className="text-emerald-300">membina masjid kerana Allah</span>, Allah akan bina untuknya <span className="text-emerald-300">rumah di syurga</span>.”
                </p>
                <p className="text-white/50 text-[9px] uppercase font-black tracking-widest mt-1">(Bukhari & Muslim)</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center md:justify-end w-full">
            <div className="w-full max-w-sm bg-white/10 p-4 rounded-[40px] backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="bg-white p-10 rounded-[32px] shadow-xl text-center space-y-6">
                <Link
                  href="/donate"
                  className="group flex items-center justify-center gap-3 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-black text-2xl px-6 py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <svg className="w-6 h-6 fill-emerald-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  Derma Sekarang
                </Link>
                <div className="flex items-center justify-center gap-6 text-[11px] font-bold tracking-wide text-emerald-600/60 text-center">
                  <span className="flex items-center gap-2 text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
                    100% Ke Masjid
                  </span>
                  <span className="flex items-center gap-2 text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
                    Tiada Komisen
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Projek Pilihan</h2>
              <p className="text-foreground/70">Sokong keperluan segera masjid-masjid ini hari ini.</p>
            </div>
            <Link href="/projects" className="hidden sm:inline-flex items-center text-emerald-600 font-black hover:text-emerald-700 transition-colors">
              Lihat semua &rarr;
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-surface-muted animate-pulse rounded-2xl border border-border"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          )}
          
          <div className="mt-10 sm:hidden flex justify-center">
            <Link href="/projects" className="inline-flex items-center text-emerald-600 font-black hover:text-emerald-700">
              Lihat semua projek &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* RM10 Impact Section - First Time Donor Focus */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-emerald-100 overflow-hidden relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-emerald-950 mb-4 tracking-tight">
              Dengan <span className="text-emerald-600">Hanya RM10</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Walaupun kecil, sumbangan anda sangat besar nilainya. <br className="hidden sm:block" />
              Menyumbang untuk pembinaan masjid ini seringan:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mb-12">
            {/* Bricks */}
            <div className="flex flex-col items-center group">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative mb-4 transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-emerald-200/20 rounded-full blur-3xl group-hover:bg-emerald-200/40 transition-colors" />
                <img 
                  src="/images/impact/bricks.png" 
                  alt="Menaja batu bata" 
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
              <h3 className="text-emerald-900 font-black text-lg">Menaja setiap batu bata</h3>
            </div>

            {/* Prayer Rug */}
            <div className="flex flex-col items-center group">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative mb-4 transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-emerald-200/20 rounded-full blur-3xl group-hover:bg-emerald-200/40 transition-colors" />
                <img 
                  src="/images/impact/rug.png" 
                  alt="Membina lantai sujud" 
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
              <h3 className="text-emerald-900 font-black text-lg">Membina lantai untuk sujud</h3>
            </div>

            {/* Tap */}
            <div className="flex flex-col items-center group">
              <div className="w-48 h-48 sm:w-56 sm:h-56 relative mb-4 transition-transform duration-500 group-hover:scale-105">
                <div className="absolute inset-0 bg-emerald-200/20 rounded-full blur-3xl group-hover:bg-emerald-200/40 transition-colors" />
                <img 
                  src="/images/impact/tap.png" 
                  alt="Menyiapkan tempat wuduk" 
                  className="w-full h-full object-contain relative z-10"
                />
              </div>
              <h3 className="text-emerald-900 font-black text-lg">Menyiapkan tempat wuduk</h3>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-emerald-100 p-6 rounded-[2rem] shadow-sm inline-block max-w-2xl">
            <p className="text-emerald-900 font-bold italic leading-relaxed">
              “Walaupun kecil, sumbangan ini boleh menjadi <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4 decoration-4">sedekah jariah yang berterusan</span>.”
            </p>
          </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />
      </section>

      {/* Interactive Map Explorer */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-muted border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-4">Eksplorasi Dana Mengikut Negeri</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">Visualisasi dana yang diperlukan untuk pembangunan institusi Islam di seluruh Malaysia.</p>
          </div>
          
          <InteractiveMap />
          
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {states.map(state => (
              <Link 
                key={state} 
                href={`/states/${state.toLowerCase()}`}
                className="bg-white border border-border hover:border-primary hover:text-primary px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md text-slate-800"
              >
                {state.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Verification Banner */}
      <section className="bg-primary/5 py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-primary/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4 font-black">
            Kenapa <span className="text-green-600">MasjidFund?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <div className="flex flex-col items-center group">
              <div className="bg-white w-40 h-40 rounded-3xl flex items-center justify-center mb-5 shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-4">
                <img src="/images/impact/verify.png" alt="Sistem Pengesahan Berkala" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Sistem Pengesahan Berkala.</h3>
              <p className="text-sm text-foreground/70 leading-relaxed font-medium">Setiap kempen disemak sebelum dipaparkan bagi menjamin ketelusan.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="bg-white w-40 h-40 rounded-3xl flex items-center justify-center mb-5 shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-4">
                <img src="/images/impact/direct.png" alt="Derma Terus" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">100% Derma Terus ke Akaun Masjid</h3>
              <p className="text-sm text-foreground/70 leading-relaxed font-medium">Kami tidak mengambil komisen daripada sumbangan anda.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="bg-white w-40 h-40 rounded-3xl flex items-center justify-center mb-5 shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-300 overflow-hidden p-4">
                <img src="/images/impact/progress.png" alt="Status Pembinaan" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Status Pembinaan Dikemaskini</h3>
              <p className="text-sm text-foreground/70 leading-relaxed font-medium">Perkembangan fizikal projek dikongsikan secara telus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Moved to Bottom per User Request */}
      <section className="bg-surface-muted py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            Perkasa Komuniti Melalui <span className="text-primary">Infaq yang Diyakini</span>
          </h2>
          <p className="text-lg sm:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Temui dan sokong pembinaan masjid, pengubahsuaian, dan keperluan dana segera yang disahkan di seluruh Malaysia. Pastikan sumbangan anda sampai kepada mereka yang benar-benar memerlukan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              Agihkan Derma Anda
            </Link>
            <Link
              href="/projects"
              className="bg-surface border-2 border-border text-foreground hover:bg-surface-muted px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-sm"
            >
              Semak Projek
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProjectCard from "@/components/public/ProjectCard";
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
      {/* Hero Section */}
      <section className="bg-surface-muted py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            Perkasa Komuniti Melalui <span className="text-primary">Infaq yang Diyakini</span>
          </h1>
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

      {/* Magic CTA Banner - Moved Up & Enhanced */}
      <section className="bg-primary py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0, 50 0, 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
              <span className="text-3xl animate-bounce">🕌</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Satu Derma, <span className="underline decoration-white/30 underline-offset-8">Pelbagai Masjid.</span>
            </h2>
            <p className="text-white/90 text-lg mb-0 leading-relaxed max-w-xl font-medium">
              Alat agihan automatik kami membolehkan anda menyokong berbilang masjid yang disahkan dalam sekali transaksi. Lebih mudah, lebih banyak pahala.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4 bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
            <Link
              href="/donate"
              className="group inline-flex items-center gap-4 bg-white text-primary hover:bg-surface-muted font-black text-xl px-12 py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-1.5 hover:shadow-2xl active:scale-95"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              Mula Agih Derma
            </Link>
            <div className="flex items-center gap-4 text-white/70 text-[10px] font-bold uppercase tracking-widest mt-2">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> 100% Terus</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Patuh Syariah</span>
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
            <Link href="/projects" className="hidden sm:inline-flex items-center text-primary font-medium hover:text-primary-hover">
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
            <Link href="/projects" className="inline-flex items-center text-primary font-medium hover:text-primary-hover">
              Lihat semua projek &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-muted border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Lihat Projek Mengikut Negeri</h2>
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Kenapa Percaya MasjidFund?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <div className="flex flex-col items-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary text-2xl font-bold border border-primary/10">✓</div>
              <h3 className="font-semibold text-lg mb-2">Jawatankuasa Sah</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">Kami memastikan hubungan terus dijalankan dengan wakil jawatankuasa rasmi masjid sebelum disenaraikan.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary text-2xl font-bold border border-primary/10">🔒</div>
              <h3 className="font-semibold text-lg mb-2">Derma Terus</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">Derma disalurkan terus ke akaun bank rasmi. Kami tidak memegang dana anda atau mengambil sebarang komisen.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm text-primary text-2xl font-bold border border-primary/10">👁</div>
              <h3 className="font-semibold text-lg mb-2">Status Telus</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">Penunjuk lencana yang jelas menunjukkan tahap pengesahan yang telah dilengkapkan untuk setiap projek.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

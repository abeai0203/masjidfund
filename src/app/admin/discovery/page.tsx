"use client";

import { useState } from "react";
import Link from "next/link";
import { scoutSocialLeads, submitLead, dismissLeadPermanently } from "@/lib/api";
import { DiscoveryLead } from "@/lib/types";

export default function DiscoveryPage() {
  const [results, setResults] = useState<DiscoveryLead[]>([]);
  const [isScouting, setIsScouting] = useState(false);
  const [isImporting, setIsImporting] = useState<string | null>(null);

  const startScouting = async () => {
    setIsScouting(true);
    try {
      const data = await scoutSocialLeads();
      // Sort: items with detected_qr first
      const sorted = [...data].sort((a, b) => {
        if (a.detected_qr && !b.detected_qr) return -1;
        if (!a.detected_qr && b.detected_qr) return 1;
        return b.confidence - a.confidence;
      });
      setResults(sorted);
    } catch (error) {
      console.error(error);
      alert("Gagal menjalankan pencarian AI.");
    } finally {
      setIsScouting(false);
    }
  };

  const handleImport = async (item: DiscoveryLead) => {
    setIsImporting(item.discovery_id);
    try {
      // Map DiscoveryLead to a partial Lead for submission
      const success = await submitLead({
        raw_title: item.raw_title,
        raw_summary: item.raw_summary,
        extracted_mosque_name: item.extracted_mosque_name,
        state: item.state,
        source_type: "Automated Discovery",
        source_url: item.source_url,
        lead_score: item.confidence,
        status: "Pending",
        detected_qr: item.detected_qr,
        detected_bank_name: item.detected_bank_name,
        detected_acc_number: item.detected_acc_number,
        detected_acc_name: item.detected_acc_name,
        detected_project_type: item.detected_project_type,
        notes: `[Auto-Discovered from ${item.source_platform}${item.detected_qr ? ' with QR' : ''}]\nOriginal Content: ${item.raw_summary}`
      });

      if (success) {
        setResults(prev => prev.filter(r => r.discovery_id !== item.discovery_id));
        alert("Lead berjaya diimport!");
      } else {
        alert("Gagal mengimport lead.");
      }
    } catch (error) {
      console.error(error);
      alert("Ralat semasa proses import.");
    } finally {
      setIsImporting(null);
    }
  };

  const handleDismiss = async (id: string) => {
    // Pessimistic update UI
    setResults(prev => prev.filter(r => r.discovery_id !== id));
    
    try {
      // Persist to DB so it doesn't reappear
      const { success, error } = await dismissLeadPermanently(id);
      if (!success) {
        console.warn("Gagal menyimpan penolakan ke database. Data mungkin muncul semula jika refresh.", error);
      }
    } catch (err) {
      console.error("Ralat dismissal:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">AI Social Discovery</h1>
            <p className="text-slate-500 font-medium">Imbas internet untuk mencari kempen derma masjid & surau yang aktif.</p>
          </div>
          
          <button 
            onClick={startScouting}
            disabled={isScouting}
            className="group/btn relative bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300`}></div>
            {isScouting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sedang Mengimbas...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Lancarkan AI Scout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isScouting && results.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.674a1 1 0 00.908-.588l3.358-7.613c.446-1.011-.293-2.152-1.393-2.152H4.79c-1.1 0-1.839 1.141-1.393 2.152l3.358 7.613a1 1 0 00.908.588z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Tiada Penemuan</h3>
            <p className="text-slate-400 max-w-sm">Klik butang di atas untuk memulakan ejen AI mencari kempen baru di media sosial.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <div key={item.discovery_id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative aspect-[16/10] bg-slate-100">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.extracted_mosque_name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center text-slate-300 ${item.image_url ? 'hidden' : ''}`}>
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2 w-fit">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-800">{item.confidence}% Confidence</span>
                  </div>
                  {item.detected_qr && (
                    <div className="bg-primary/90 backdrop-blur px-3 py-1.5 rounded-xl border border-primary/20 shadow-lg flex items-center gap-2 w-fit animate-bounce duration-[2000ms]">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">QR Dikesan</span>
                    </div>
                  )}
                  {/* @ts-ignore - added in api.ts */}
                  {item.is_source_active && (
                    <div className="bg-emerald-500/90 backdrop-blur px-3 py-1.5 rounded-xl border border-emerald-400/20 shadow-lg flex items-center gap-2 w-fit">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">Pautan Aktif</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-primary px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    {item.source_platform}
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-grow space-y-4">
                <div className="min-h-[60px]">
                  <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{item.extracted_mosque_name || item.raw_title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{item.state}, Malaysia</p>
                </div>
                
                <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed">
                  {item.raw_summary}
                </p>

                <div className="pt-4 flex flex-col gap-3 mt-auto">
                  <button 
                    onClick={() => handleImport(item)}
                    disabled={isImporting === item.discovery_id}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                  >
                    {isImporting === item.discovery_id ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    )}
                    Import as Lead
                  </button>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={item.source_url || "#"} 
                      target="_blank"
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-center py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      Buka Sumber
                    </Link>
                    <button 
                      onClick={() => handleDismiss(item.discovery_id)}
                      className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl transition-all"
                      title="dismiss"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version Indicator */}
      <div className="pt-12 border-t border-slate-100 flex justify-center">
        <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Discovery AI Engine v3.0 (Persistent Dismissal + Verified Links)
        </div>
      </div>
    </div>
  );
}

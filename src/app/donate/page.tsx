"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { getPublicProjects, updateProject, logDonation } from "@/lib/api";
import DuitNowQR from "@/components/ui/DuitNowQR";

type ScopeType = "All" | "Best" | "State";

export default function DonatePage() {
  const [step, setStep] = useState(0);
  const [donorName, setDonorName] = useState("Hamba Allah");
  const [donorPhone, setDonorPhone] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | "">(10);
  const [numMosques, setNumMosques] = useState(3);
  const [scope, setScope] = useState<ScopeType>("Best");
  const [selectedState, setSelectedState] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [currentPaymentIdx, setCurrentPaymentIdx] = useState(0);
  
  // NEW STATES for completion flow
  const [showAlhamdulillah, setShowAlhamdulillah] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [records, setRecords] = useState<{name: string, amount: number, total_after: number}[]>([]);
  const [randomHadith, setRandomHadith] = useState({ text: "", source: "" });

  const allStates = [
    "Selangor", "Johor", "Perak", "Pahang", "Kedah", "Terengganu", 
    "Kelantan", "Pulau Pinang", "Melaka", "Negeri Sembilan", 
    "Sabah", "Sarawak", "Perlis", "W.P. Kuala Lumpur"
  ];

  const generateRecommendations = async () => {
    const all = await getPublicProjects();
    // Filter out mosques that have reached their target
    const activeProjects = all.filter(p => p.collected_amount < p.target_amount);
    let filtered = activeProjects;

    if (scope === "State" && selectedState) {
      filtered = activeProjects.filter(p => p.state === selectedState);
    } else if (scope === "Best") {
      // Sort by completion percent ascending (most urgent)
      filtered = [...activeProjects].sort((a, b) => (a.completion_percent || 0) - (b.completion_percent || 0));
    } else {
      // Randomize "All"
      filtered = [...activeProjects].sort(() => Math.random() - 0.5);
    }

    setRecommendations(filtered.slice(0, numMosques));
    setStep(4);
  };

  const replaceProject = async (index: number) => {
    const all = await getPublicProjects();
    // Exclude current recommendations AND mosques that are full
    const currentSlugs = recommendations.map(r => r.slug);
    const available = all.filter(p => !currentSlugs.includes(p.slug) && p.collected_amount < p.target_amount);
    
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      const newRecs = [...recommendations];
      newRecs[index] = random;
      setRecommendations(newRecs);
    }
  };

  const parsedTotal = typeof totalAmount === "number" ? totalAmount : 0;
  const actualNum = recommendations.length;
  // Floor to 2 decimals
  const splitAmount = actualNum > 0 ? Math.floor((parsedTotal / actualNum) * 100) / 100 : 0;

  const HADITHS = [
    { text: "Sedekah itu dapat menghapus dosa sebagaimana air memadamkan api.", source: "HR. At-Tirmidzi" },
    { text: "Tangan yang di atas lebih baik daripada tangan yang di bawah.", source: "HR. Al-Bukhari & Muslim" },
    { text: "Harta tidak akan berkurang dengan sedekah.", source: "HR. Muslim" },
    { text: "Naungan bagi seorang mukmin pada hari kiamat adalah sedekahnya.", source: "HR. Ahmad" },
    { text: "Sesungguhnya sedekah itu benar-benar dapat memadamkan kemurkaan Allah dan menghindarkan diri dari mati yang buruk.", source: "HR. At-Tirmidzi" }
  ];

  const handleCompletePayment = async () => {
    const currentProject = recommendations[currentPaymentIdx];
    if (!currentProject) return;

    setIsProcessing(true);
    setShowAlhamdulillah(true);

    // Update Project in Database/Simulation
    const newAmount = (currentProject.collected_amount || 0) + splitAmount;
    await updateProject(currentProject.slug, {
      collected_amount: newAmount,
    });

    // Record for Summary
    setRecords(prev => [...prev, {
      name: currentProject.mosque_name,
      amount: splitAmount,
      total_after: newAmount
    }]);

    // Pick a random hadith for the end
    if (currentPaymentIdx === actualNum - 1) {
      setRandomHadith(HADITHS[Math.floor(Math.random() * HADITHS.length)]);

      // LOG DONATION RECORD TO DATABASE
      await logDonation({
        donor_name: donorName,
        donor_phone: donorPhone,
        total_amount: parsedTotal,
        mosque_count: actualNum,
        mosque_names: recommendations.map(r => r.mosque_name)
      });
    }

    setTimeout(() => {
      setShowAlhamdulillah(false);
      setIsProcessing(false);
      
      if (currentPaymentIdx < actualNum - 1) {
        setCurrentPaymentIdx(prev => prev + 1);
      } else {
        setStep(6);
      }
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-3 font-serif italic">Pembahagi Derma</h1>
        <p className="text-lg text-foreground/70">
          Agihkan sumbangan anda dengan telus ke beberapa masjid terpilih.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-10 no-print">
        <div className="flex items-center space-x-2">
          {[0, 1, 2, 3, 4, 5, 6].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-sm ${
                step >= s 
                  ? "bg-primary text-white scale-110" 
                  : "bg-surface-muted text-foreground/40 border border-border"
              }`}>
                {s === 6 ? "✓" : s}
              </div>
              {s < 6 && (
                <div className={`w-4 sm:w-8 h-1 mx-0.5 rounded-full transition-all duration-700 ${
                  step > s ? "bg-primary/60" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 0: Donor Info */}
      {step === 0 && (
        <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Langkah 0: Maklumat Infaq</h2>
            <p className="text-foreground/60 mb-8">Sila masukkan maklumat anda untuk tujuan rekod.</p>
            
            <div className="space-y-6 mb-8 text-left">
              <div>
                <label className="block text-sm font-bold text-foreground/70 mb-2">Nama Penuh</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className={`w-full bg-surface-muted border-2 border-border rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-primary transition-all ${
                      donorName === "Hamba Allah" ? "text-foreground/30 font-medium italic" : "text-foreground"
                    }`}
                    placeholder="Hamba Allah"
                    onFocus={() => { if(donorName === "Hamba Allah") setDonorName(""); }}
                    onBlur={() => { if(donorName.trim() === "") setDonorName("Hamba Allah"); }}
                  />
                  {donorName === "Hamba Allah" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-foreground/20 pointer-events-none">Default</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/70 mb-2">No. Telefon (Pilihan)</label>
                <input 
                  type="tel" 
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full bg-surface-muted border-2 border-border rounded-xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-primary transition-all text-foreground"
                  placeholder="Contoh: 0123456789"
                />
              </div>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all text-xl hover:-translate-y-1 active:scale-95"
            >
              Seterusnya
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Amount */}
      {step === 1 && (
        <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Langkah 1: Berapa anda ingin derma?</h2>
            <p className="text-foreground/60 mb-8">Masukkan jumlah keseluruhan (RM) yang anda ingin agihkan.</p>
            
            <div className="relative mb-8">
              <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-foreground/40 text-2xl font-bold">RM</span>
              <input 
                type="number" 
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-surface-muted border-2 border-border rounded-2xl pl-16 pr-6 py-6 text-4xl font-black text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center" 
                placeholder="0" 
                autoFocus
              />
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!totalAmount || totalAmount <= 0}
              className="w-full bg-primary hover:bg-primary-hover text-white font-black py-5 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all text-xl disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed hover:-translate-y-1 active:scale-95"
            >
              Seterusnya
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Mosque Count */}
      {step === 2 && (
        <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Langkah 2: Agihkan kepada berapa masjid?</h2>
            <p className="text-foreground/60 mb-8 text-lg">Jumlah RM {parsedTotal.toFixed(2)} akan dibahagi secara sama rata.</p>
            
            <div className="space-y-6 mb-10">
               <div className="flex justify-between items-center bg-surface-muted p-8 rounded-3xl border border-border">
                  <button 
                    onClick={() => setNumMosques(prev => Math.max(1, prev - 1))}
                    className="w-16 h-16 rounded-2xl bg-white border border-border text-2xl font-bold hover:bg-primary hover:text-white transition-colors shadow-sm text-slate-800"
                  >-</button>
                  <div className="text-center">
                    <span className="text-6xl font-black text-primary block">{numMosques}</span>
                    <span className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Masjid</span>
                  </div>
                  <button 
                    onClick={() => setNumMosques(prev => Math.min(6, prev + 1))}
                    className="w-16 h-16 rounded-2xl bg-white border border-border text-2xl font-bold hover:bg-primary hover:text-white transition-colors shadow-sm text-slate-800"
                  >+</button>
               </div>
               
               <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                 <p className="text-foreground/70 font-medium">
                   Setiap masjid akan menerima <span className="text-primary font-bold">RM {(parsedTotal / numMosques).toFixed(2)}</span>
                 </p>
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 px-8 py-5 border-2 border-border rounded-2xl font-bold text-foreground/60 hover:bg-surface-muted transition-colors">Kembali</button>
              <button 
                onClick={() => setStep(3)}
                className="flex-[2] bg-primary hover:bg-primary-hover text-white font-black py-5 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all text-xl hover:-translate-y-1 active:scale-95"
              >
                Seterusnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Scope Selection */}
      {step === 3 && (
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Langkah 3: Pilih Lokasi Agihan</h2>
              <p className="text-foreground/60 mt-1">Di mana anda ingin bantuan ini difokuskan?</p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {(["All", "Best", "State"] as ScopeType[]).map(s => (
                 <button 
                    key={s}
                    onClick={() => setScope(s)}
                    className={`p-6 border-2 rounded-2xl text-center transition-all flex flex-col items-center gap-3 ${
                      scope === s 
                        ? "border-primary bg-primary/5 text-primary shadow-inner" 
                        : "border-border bg-surface hover:bg-surface-muted hover:border-foreground/30 text-foreground/80"
                    }`}
                 >
                    <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center">
                       {s === "All" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2}/></svg>}
                       {s === "Best" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth={2}/></svg>}
                       {s === "State" && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth={2}/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2}/></svg>}
                    </div>
                    <div className="font-black">
                      {s === "All" ? "Seluruh Malaysia" : s === "Best" ? "Terpaling Urgent" : "Negeri Tertentu"}
                    </div>
                    <p className="text-xs opacity-70">
                       {s === "All" && "Agihan rawak ke mana-mana negeri"}
                       {s === "Best" && "Utamakan projek perlukan dana segera"}
                       {s === "State" && "Fokus bantuan ikut lokaliti pilihan"}
                    </p>
                 </button>
              ))}
           </div>

           {scope === "State" && (
              <div className="mb-8 p-6 bg-surface-muted rounded-2xl border border-border animate-in slide-in-from-top-4 duration-300">
                 <label className="block text-sm font-bold text-foreground/80 mb-3">Taip atau Pilih Negeri</label>
                 <input 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    list="state-filter-list"
                    className="w-full sm:w-1/2 bg-surface border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 font-medium"
                    placeholder="Contoh: Selangor"
                 />
                 <datalist id="state-filter-list">
                   {allStates.map(state => <option key={state} value={state} />)}
                 </datalist>
              </div>
           )}

           <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 px-8 py-5 border-2 border-border rounded-2xl font-bold text-foreground/60 hover:bg-surface-muted transition-colors">Kembali</button>
            <button 
              onClick={generateRecommendations}
              disabled={!scope || (scope === "State" && !selectedState)}
              className="flex-[2] bg-primary hover:bg-primary-hover text-white font-black py-5 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all text-xl disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed hover:-translate-y-1"
            >
              Lihat Cadangan
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                <h2 className="text-2xl font-bold text-foreground">Langkah 4: Sahkan Cadangan</h2>
                <p className="text-foreground/60 mt-1">Sistem telah memilih <strong>{actualNum} masjid</strong> untuk anda infaqkan</p>
             </div>
             <button onClick={generateRecommendations} className="flex items-center gap-2 px-6 py-3 bg-surface-muted border border-border rounded-xl font-bold text-sm hover:bg-white transition-all shadow-sm">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Tukar Semua
             </button>
           </div>

           <div className="grid gap-4">
              {recommendations.map((project, idx) => (
                 <div key={project.slug} className="group bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-8 items-center">
                    <div className="flex-1 w-full">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {project.mosque_name}
                            </h3>
                            <p className="text-sm font-bold text-foreground/40">{project.state} • {project.district}</p>
                          </div>
                          <Badge status={project.verification_status} />
                       </div>
                       <ProgressBar 
                          collectedAmount={project.collected_amount} 
                          targetAmount={project.target_amount} 
                          percentage={project.completion_percent} 
                        />
                    </div>
                    <div className="w-full sm:w-48 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-border pt-6 sm:pt-0 sm:pl-8">
                       <div className="text-center sm:text-right">
                          <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-1">Penerimaan</p>
                          <p className="text-3xl font-black text-primary">RM {splitAmount.toFixed(2)}</p>
                       </div>
                       <button 
                         onClick={() => replaceProject(idx)}
                         className="flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-red-600 transition-colors mt-0 sm:mt-4 px-3 py-1.5 rounded-lg border border-border hover:border-red-200 hover:bg-red-50"
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2}/></svg>
                         Ganti
                       </button>
                    </div>
                 </div>
              ))}
           </div>

           <div className="flex gap-4 pt-6">
            <button onClick={() => setStep(3)} className="flex-1 px-8 py-5 border-2 border-border rounded-2xl font-bold text-foreground/60 hover:bg-surface-muted transition-colors">Kembali</button>
            <button 
              onClick={() => setStep(5)}
              className="flex-[2] bg-primary hover:bg-primary-hover text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-primary/30 transition-all text-xl hover:-translate-y-1 active:scale-95"
            >
              Sahkan & Mula Derma
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Sequential Payment */}
      {step === 5 && (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
           {recommendations[currentPaymentIdx] && (
             <div className="space-y-8">
                <div className="text-center py-4">
                   <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20 mb-4 animate-bounce">
                      Sumbangan {currentPaymentIdx + 1} daripada {actualNum}
                   </div>
                   <h2 className="text-4xl font-black text-foreground mb-2">Resit Pembayaran</h2>
                   <p className="text-foreground/60">Sila lengkapkan bayaran kepada akaun masjid yang sah.</p>
                </div>

                <div className="bg-surface rounded-3xl border-2 border-primary/20 p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
                   
                   <div className="flex flex-col items-center mb-10 text-center relative z-10">
                      <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-3xl mb-4 shadow-lg shadow-primary/30">
                         {recommendations[currentPaymentIdx].mosque_name.charAt(0)}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">{recommendations[currentPaymentIdx].mosque_name}</h3>
                      <p className="text-foreground/50 font-medium">{recommendations[currentPaymentIdx].state}</p>
                      
                      <div className="mt-8 bg-black text-white px-8 py-4 rounded-2xl">
                         <span className="text-xs font-bold uppercase tracking-widest block opacity-50 mb-1">Jumlah Perlu Dibayar</span>
                         <span className="text-4xl font-black tabular-nums">RM {splitAmount.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="space-y-6 relative z-10">
                      {/* Payment Methods toggle or both */}
                      <div className="grid grid-cols-1 gap-4">
                         {recommendations[currentPaymentIdx].donation_method_type !== "DuitNow QR" && (
                            <div className="bg-surface-muted rounded-2xl p-6 border border-border">
                               <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-3">Pindahan Bank</p>
                               <div className="flex justify-between items-center">
                                  <div>
                                     <p className="font-bold text-foreground text-lg">{recommendations[currentPaymentIdx].bank_name}</p>
                                     <p className="font-mono text-xl tracking-wider text-primary font-black mt-1">
                                        {recommendations[currentPaymentIdx].account_number}
                                     </p>
                                     <p className="text-sm font-bold text-foreground/60 uppercase mt-2">{recommendations[currentPaymentIdx].account_name}</p>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(recommendations[currentPaymentIdx].account_number || "");
                                      alert("Nombor akaun disalin!");
                                    }}
                                    className="p-3 bg-white border border-border rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all active:scale-90"
                                  >
                                     <svg className="w-6 h-6 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth={2}/></svg>
                                  </button>
                               </div>
                            </div>
                         )}

                         {recommendations[currentPaymentIdx].donation_method_type !== "Bank Transfer" && (
                            <div className="bg-surface-muted rounded-2xl p-6 border-2 border-primary/10 flex flex-col items-center">
                               <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-4">Imbas DuitNow QR</p>
                               <div className="w-64 max-w-full mx-auto">
                                  <DuitNowQR 
                                    qrUrl={recommendations[currentPaymentIdx].duitnow_qr_url} 
                                    mosqueName={recommendations[currentPaymentIdx].mosque_name}
                                  />
                               </div>
                               <p className="text-xs font-bold text-foreground/50 mt-4 text-center px-4">Imbas guna aplikasi bank anda untuk bayaran terus ke akaun masjid.</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                 <div className="flex items-center justify-between gap-4">
                    <button 
                      disabled={currentPaymentIdx === 0 || isProcessing}
                      onClick={() => setCurrentPaymentIdx(prev => prev - 1)}
                      className="px-8 py-5 border-2 border-border rounded-2xl font-black text-foreground/60 hover:bg-surface-muted transition-all disabled:opacity-0"
                    >
                      Sebelumnya
                    </button>
                    
                    <button 
                      onClick={handleCompletePayment}
                      disabled={isProcessing}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-primary/30 transition-all text-xl hover:-translate-y-1 active:scale-95 disabled:opacity-70"
                    >
                      {currentPaymentIdx < actualNum - 1 ? "Selesai & Ke Masjid Seterusnya" : "Selesai Semua Derma"}
                    </button>
                 </div>

                 {/* Success Modal */}
                 {showAlhamdulillah && (
                   <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                      <div className="bg-white rounded-[40px] p-12 text-center shadow-2xl border-4 border-primary/20 scale-110 animate-in zoom-in-95 duration-500">
                         <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </div>
                         <h2 className="text-5xl font-black text-slate-800 mb-4 font-serif italic">Alhamdulillah!</h2>
                         <p className="text-slate-500 text-lg font-bold">Terima kasih atas sumbangan anda.</p>
                         <p className="text-primary font-black mt-2 text-sm uppercase tracking-widest">Sistem sedang dikemaskini...</p>
                      </div>
                   </div>
                 )}

                <div className="text-center">
                   <button 
                     disabled={isProcessing}
                     onClick={() => setStep(4)}
                     className="text-sm font-bold text-foreground/40 hover:text-primary transition-colors underline disabled:opacity-30"
                   >
                     Kemaskini Senarai Masjid
                   </button>
                </div>
              </div>
            )}
         </div>
       )}

      {/* STEP 6: Summary & Receipt */}
      {step === 6 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-2xl p-8 sm:p-12 overflow-hidden print:p-0 print:border-0 print:shadow-none">
              <div className="text-center mb-12">
                 <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 no-print">
                    <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Ringkasan Sumbangan</h2>
                 <p className="text-slate-500 font-medium">Terima kasih kerana menyuburkan rumah Allah.</p>
              </div>

              <div className="space-y-4 mb-12">
                 {records.map((rec, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-hover border-primary/20">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs shadow-sm">
                             {i + 1}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800">{rec.name}</h4>
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                Jumlah Baharu: RM {(rec.total_after / 1000).toFixed(1)}k
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Infaq</span>
                          <span className="text-xl font-black text-slate-800">RM {rec.amount.toFixed(2)}</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-100 pt-8 mt-8">
                 <div className="flex justify-between items-center bg-slate-800 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/20">
                    <div>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Jumlah Keseluruhan</span>
                       <span className="text-sm text-slate-300 font-medium italic">Dibahagi kepada {actualNum} masjid</span>
                    </div>
                    <span className="text-4xl font-black tabular-nums tracking-tight">RM {parsedTotal.toFixed(2)}</span>
                 </div>
              </div>

              {/* Hadith Section */}
              <div className="mt-12 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 no-print">
                   <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16C10.9124 16 10.017 16.8954 10.017 18V21M10.017 21H3.983C3.43072 21 2.983 20.5523 2.983 20V4C2.983 3.44772 3.43072 3 3.983 3H20.017C20.5693 3 21.017 3.44772 21.017 4V20C21.017 20.5523 20.5693 21 20.017 21H14.017" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
                 <div className="relative z-10">
                    <p className="text-lg font-serif italic text-slate-700 leading-relaxed max-w-2xl mx-auto mb-4">
                       "{randomHadith.text}"
                    </p>
                    <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">
                       {randomHadith.source}
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 no-print">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-800 font-black py-5 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Muat Turun Resit
              </button>
              <Link 
                href="/"
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-center font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
              >
                 Kembali ke Halaman Utama
              </Link>
           </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

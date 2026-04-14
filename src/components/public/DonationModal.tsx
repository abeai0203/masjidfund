"use client";

import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { updateProject, logDonation, syncDonationStats } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import DuitNowQR, { DuitNowQRHandle } from "@/components/ui/DuitNowQR";
import { useRef } from "react";
import DuitNowLogo from "@/components/ui/DuitNowLogo";

const HADITHS = [
  {
    text: "Sedekah itu dapat menghapus dosa sebagaimana air memadamkan api.",
    ref: "HR. Tirmidzi, No. 614"
  },
  {
    text: "Tangan di atas lebih baik daripada tangan di bawah.",
    ref: "HR. Bukhari, No. 1429"
  },
  {
    text: "Barangsiapa membangun masjid kerana Allah, maka Allah akan membangunkan baginya rumah di syurga.",
    ref: "HR. Bukhari, No. 450"
  },
  {
    text: "Setiap awal pagi saat matahari terbit, Allah menurunkan dua malaikat ke bumi... Salah satunya berdoa: 'Ya Allah, berilah ganti bagi orang yang berinfak'.",
    ref: "HR. Bukhari, No. 1442"
  }
];

export default function DonationModal({
  project,
  isOpen,
  onClose,
}: {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, contributor } = useAuth();
  const [step, setStep] = useState<"amount" | "method" | "details" | "alhamdulillah" | "summary">("amount");
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "bank" | "toyyibpay">("qr");
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [randomHadith, setRandomHadith] = useState(HADITHS[0]);
  const [updatedProject, setUpdatedProject] = useState<Project>(project);
  const qrRef = useRef<DuitNowQRHandle>(null);

  // Fallback info for logging
  const donorName = user?.user_metadata?.full_name || "Penderma MasjidFund";
  const donorPhone = user?.user_metadata?.phone || "N/A";

  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setDonationAmount("");
      setIsProcessing(false);
      setRandomHadith(HADITHS[Math.floor(Math.random() * HADITHS.length)]);
      setUpdatedProject(project);
      
      // Default method logic
      if (project.donation_method_type === "DuitNow QR") setPaymentMethod("qr");
      else if (project.donation_method_type === "Bank Transfer") setPaymentMethod("bank");
      else setPaymentMethod("toyyibpay");
    }
  }, [isOpen, project]);

  const handleCopy = () => {
    if (project.account_number) {
      navigator.clipboard.writeText(project.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToMethod = () => {
    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Sila masukkan jumlah derma yang sah.");
      return;
    }
    setStep("method");
  };

  const handleSelectMethod = (method: "qr" | "bank" | "toyyibpay") => {
    setPaymentMethod(method);
    if (method === "toyyibpay") {
       handleCompleteDonation();
    } else {
       setStep("details");
    }
  };

  const handleCompleteDonation = async (methodOverride?: string) => {
    const amountNum = parseFloat(donationAmount);
    
    setIsProcessing(true);

    const method = paymentMethod === 'toyyibpay' ? 'FPX' : (paymentMethod === 'qr' ? 'DuitNow QR' : 'Bank Transfer');
    console.log(`Donation recorded locally for simulation: RM${donationAmount} via ${method}`);
    
    // If it was ToyyibPay, we simulate the "Processing" state before showing success
    if (paymentMethod === 'toyyibpay') {
      setStep("alhamdulillah");
      const timer = setTimeout(async () => {
        // Update project collected amount even for simulation to show progress
        const newCollected = (project.collected_amount || 0) + amountNum;
        const result = await updateProject(project.slug, {
            collected_amount: newCollected
        });
        if (result) setUpdatedProject(result);

        setTimeout(() => setStep("summary"), 2000);
        setIsProcessing(false);
      }, 1500);
      return;
    }

    setStep("alhamdulillah");

    try {
      const newCollected = (project.collected_amount || 0) + amountNum;
      const result = await updateProject(project.slug, {
        collected_amount: newCollected
      });
      
      if (result) {
        setUpdatedProject(result);
        
        // Unified Stats Sync: Update Global (Simulation) and Personal (Persistence)
        await syncDonationStats(amountNum, user?.id);

        // LOG DONATION RECORD TO DATABASE ( Ledger )
        await logDonation({
          contributor_id: contributor?.id,
          donor_name: donorName,
          donor_phone: donorPhone,
          total_amount: amountNum,
          mosque_count: 1,
          mosque_names: [project.mosque_name]
        });
      }

      setTimeout(() => {
        setStep("summary");
        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      console.error("Donation update failed:", error);
      alert("Gagal mengemaskini maklumat derma. Sila hubungi urusetia.");
      setIsProcessing(false);
      setStep("amount");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={step === "summary" ? undefined : onClose}
        aria-label="Close modal"
      ></div>
      
      <div className={`relative w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-500 ${step === "alhamdulillah" ? "scale-105" : "scale-100"}`}>
        
        {/* Step Header */}
        {step !== "alhamdulillah" && (
          <div className="p-6 border-b border-border bg-surface-muted flex justify-between items-start no-print">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {step === "amount" ? "Masukkan Jumlah" : step === "method" ? "Pilih Kaedah" : "Sahkan Derma"}
              </h2>
              <p className="text-sm text-foreground/70 mt-1">{project.mosque_name}</p>
            </div>
            {step !== "summary" && (
              <button 
                onClick={onClose}
                className="text-foreground/50 hover:text-foreground bg-surface border border-border rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: Amount Input */}
          {step === "amount" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="mb-8 text-center pt-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <p className="text-sm text-foreground/60 mb-4 font-medium italic">"Sedekah itu tidak akan mengurangkan harta."</p>
                <div className="relative max-w-[220px] mx-auto">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-2xl text-primary">RM</span>
                  <input
                    autoFocus
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-muted border-2 border-primary/20 rounded-2xl pl-16 pr-6 py-4 text-3xl font-extrabold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-center placeholder:text-foreground/20"
                  />
                </div>
              </div>

               <div className="grid grid-cols-3 gap-3 mb-8">
                 {[10, 50, 100].map((val) => (
                   <button 
                    key={val}
                    onClick={() => setDonationAmount(val.toString())}
                    className="py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground/70 hover:border-primary hover:text-primary transition-all shadow-sm"
                   >
                     +RM{val}
                   </button>
                 ))}
               </div>

              <button 
                onClick={handleProceedToMethod}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Teruskan</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

          {/* STEP 2: Method Selection */}
          {step === "method" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 text-center">Pilih Kaedah Sumbangan</p>
              
              <button 
                onClick={() => handleSelectMethod("qr")}
                className={`w-full p-4 rounded-2xl bg-surface border-2 transition-all group overflow-hidden relative ${
                  paymentMethod === "qr" ? "border-[#ed005d] shadow-md" : "border-primary/5 hover:border-[#ed005d] shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-4 relative z-10">
                  <DuitNowLogo size={48} className="group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-foreground">DuitNow QR</p>
                    <p className="text-xs text-foreground/50">Imbas & Derma Pantas</p>
                  </div>
                </div>
                {paymentMethod === "qr" && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-[#ed005d] text-white flex items-center justify-center rounded-bl-xl">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              <button 
                onClick={() => handleSelectMethod("bank")}
                className="w-full p-4 rounded-2xl bg-surface border-2 border-primary/5 hover:border-primary shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">Pindahan Bank</p>
                    <p className="text-xs text-foreground/50">Salin No. Akaun Secara Manual</p>
                  </div>
                </div>
              </button>

              <div className="relative group">
                <button 
                  disabled
                  className="w-full p-4 rounded-2xl bg-surface border-2 border-border/50 opacity-50 cursor-not-allowed transition-all relative overflow-hidden"
                >
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground/50">Online Banking (FPX)</p>
                      <p className="text-xs text-foreground/30">Automasi via ToyyibPay</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black rounded uppercase tracking-tighter">Caj RM1.00</div>
                </button>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10">Akan Datang</span>
                </div>
              </div>

              <button 
                onClick={() => setStep("amount")}
                className="w-full text-sm text-foreground/40 font-bold uppercase tracking-widest pt-4"
              >
                Tukar Jumlah
              </button>
            </div>
          )}

          {/* STEP 3: Details (QR or Bank) */}
          {step === "details" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
               {paymentMethod === "qr" ? (
                 <div className="text-center w-full">
                     <div className="mb-6">
                      <DuitNowQR 
                        ref={qrRef}
                        qrUrl={project.duitnow_qr_url || ""} 
                        mosqueName={project.mosque_name}
                        accountName={project.account_name}
                        amount={parseFloat(donationAmount)}
                      />
                    </div>
                    
                    <div className="bg-[#ed005d]/5 rounded-2xl p-4 border border-[#ed005d]/10 mb-6 text-left flex items-start space-x-3">
                      <div className="w-5 h-5 bg-[#ed005d] text-white rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">!</div>
                      <p className="text-xs text-foreground/70 leading-relaxed font-medium">
                        <strong>Langkah Mobile:</strong> <span className="text-[#ed005d] font-bold">Muat turun QR</span>, buka app bank, pilih "Scan & Pay" dan muat naik gambar dari galeri.
                      </p>
                    </div>

                    <div className="flex gap-3">
                       <button 
                        className="flex-1 bg-surface border border-border text-foreground font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm"
                        onClick={() => {
                           qrRef.current?.download();
                        }}
                       >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                         Muat turun QR
                       </button>
                       <button 
                         onClick={() => handleCompleteDonation()}
                         className="flex-[2] bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl shadow-md text-sm"
                       >
                         Saya Sudah Derma
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="w-full">
                    <div className="bg-surface-muted border border-border rounded-xl p-5 mb-6 space-y-4 shadow-inner">
                      <div>
                        <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mb-1">Nama Bank</p>
                        <p className="font-bold text-foreground font-serif">{project.bank_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mb-1">Nombor Akaun</p>
                        <div className="flex justify-between items-center bg-surface border border-border rounded-lg p-3 mt-1 shadow-sm">
                          <p className="font-mono text-lg font-bold text-primary tracking-tighter">{project.account_number || "---"}</p>
                          <button 
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                              copied ? "bg-green-500 text-white" : "text-primary hover:text-primary-hover bg-primary/5 border border-primary/10"
                            }`}
                            onClick={handleCopy}
                          >
                            {copied ? "Tersalin!" : "Salin"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mb-1">Penerima</p>
                        <p className="font-bold text-foreground text-sm uppercase">{project.mosque_name}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleCompleteDonation()}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg"
                    >
                      Saya Sudah Derma
                    </button>
                 </div>
               )}

               <button 
                  onClick={() => setStep("method")}
                  className="w-full text-xs text-foreground/40 font-bold uppercase tracking-widest mt-6"
                >
                  Tukar Kaedah
                </button>
            </div>
          )}

          {/* STEP 4: Alhamdulillah Progress */}
          {step === "alhamdulillah" && (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20"></div>
                <svg className="w-12 h-12 text-primary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold text-primary mb-4 font-serif italic text-center">Alhamdulillah</h1>
              <p className="text-lg text-foreground/70 text-center font-medium">Sumbangan anda {paymentMethod === 'toyyibpay' ? 'sedang diproses.' : 'telah direkodkan.'}</p>
              <p className="text-sm text-foreground/40 mt-8 animate-pulse text-center">Menyiapkan resit digital anda...</p>
            </div>
          )}

          {/* STEP 5: Summary */}
          {step === "summary" && (
            <div id="donation-summary" className="animate-in fade-in duration-1000">
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 border border-primary/20">
                  RESIT DERMA DIGITAL
                </div>
                <h3 className="text-2xl font-bold text-foreground">{project.mosque_name}</h3>
                <p className="text-sm text-foreground/60">{new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              <div className="bg-surface-muted rounded-2xl p-6 mb-8 border border-border shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-foreground/60">Jumlah Derma</span>
                  <span className="text-2xl font-black text-primary">RM {parseFloat(donationAmount).toLocaleString('ms-MY', { minimumFractionDigits: 2 })}</span>
                </div>
                {paymentMethod === 'toyyibpay' && (
                  <div className="flex justify-between items-center mb-4 text-[10px] text-foreground/40 italic">
                    <span>* Termasuk caj gerbang pembayaran</span>
                    <span>RM { (parseFloat(donationAmount) + 1.00).toFixed(2) } total</span>
                  </div>
                )}
                <div className="h-px bg-border mb-4"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground/60">Status Projek Terkini</span>
                  <span className="font-bold text-foreground">
                    RM {updatedProject.collected_amount.toLocaleString('ms-MY')} / RM {project.target_amount.toLocaleString('ms-MY')}
                  </span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full mt-2 overflow-hidden border border-border">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000"
                    style={{ width: `${updatedProject.completion_percent}%` }}
                  ></div>
                </div>
              </div>

              {/* Hadith Section */}
              <div className="bg-primary/5 rounded-2xl p-6 border-l-4 border-primary mb-8 relative overflow-hidden">
                <div className="absolute top-2 right-4 text-primary/10 font-serif text-6xl">"</div>
                <p className="text-sm text-foreground/80 leading-relaxed italic mb-4 relative z-10 font-serif">
                  {randomHadith.text}
                </p>
                <p className="text-xs font-bold text-primary text-right uppercase tracking-widest">
                  — {randomHadith.ref}
                </p>
              </div>

              <div className="flex flex-col gap-3 no-print">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-surface hover:bg-surface-muted text-foreground font-bold py-3.5 rounded-xl transition-all border-2 border-border shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Muat Turun Resit (Cetak)
                </button>
                <Link 
                  href="/projects"
                  onClick={onClose}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-center"
                >
                  Kembali ke Portal Utama
                </Link>
                <button 
                    onClick={onClose}
                    className="text-sm text-foreground/40 hover:text-foreground font-medium py-2 transition-colors uppercase tracking-widest"
                >
                    Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {step !== "alhamdulillah" && step !== "summary" && (
          <div className="p-4 border-t border-border bg-surface-muted text-center no-print">
            <p className="text-[10px] text-foreground/50 font-medium uppercase tracking-widest">
              Platform Tanpa Komisen • 100% Derma Anda Disalurkan Terus
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

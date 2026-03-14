"use client";

import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { updateProject } from "@/lib/api";
import Link from "next/link";
import DuitNowQR from "@/components/ui/DuitNowQR";

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
  const [step, setStep] = useState<"method" | "amount" | "alhamdulillah" | "summary">("method");
  const [activeTab, setActiveTab] = useState<"qr" | "bank">(
    project.donation_method_type === "Bank Transfer" ? "bank" : "qr"
  );
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [randomHadith, setRandomHadith] = useState(HADITHS[0]);
  const [updatedProject, setUpdatedProject] = useState<Project>(project);

  useEffect(() => {
    if (isOpen) {
      setStep("method");
      setDonationAmount("");
      setIsProcessing(false);
      setRandomHadith(HADITHS[Math.floor(Math.random() * HADITHS.length)]);
      setUpdatedProject(project);
    }
  }, [isOpen, project]);

  const handleCopy = () => {
    if (project.account_number) {
      navigator.clipboard.writeText(project.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCompleteDonation = async () => {
    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Sila masukkan jumlah derma yang sah.");
      return;
    }

    setIsProcessing(true);
    setStep("alhamdulillah");

    try {
      const newCollected = (project.collected_amount || 0) + amountNum;
      const result = await updateProject(project.slug, {
        collected_amount: newCollected
      });
      
      if (result) {
        setUpdatedProject(result);
      }

      setTimeout(() => {
        setStep("summary");
        setIsProcessing(false);
      }, 3000);
    } catch (error) {
      console.error("Donation update failed:", error);
      alert("Gagal mengemaskini maklumat derma. Sila hubungi urusetia.");
      setIsProcessing(false);
      setStep("method");
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
      
      <div className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-500 ${step === "alhamdulillah" ? "scale-105" : "scale-100"}`}>
        
        {/* Step Header */}
        {step !== "alhamdulillah" && (
          <div className="p-6 border-b border-border bg-surface-muted flex justify-between items-start no-print">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {step === "method" ? "Sokong Projek Ini" : step === "amount" ? "Sahkan Derma" : "Ringkasan Derma"}
              </h2>
              <p className="text-sm text-foreground/70 mt-1">{project.mosque_name}</p>
            </div>
            {step !== "summary" && (
              <button 
                onClick={onClose}
                className="text-foreground/50 hover:text-foreground bg-white border border-border rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* STEP 1: Method Selection */}
          {step === "method" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {project.donation_method_type === "Both" && (
                <div className="flex bg-surface-muted p-1 rounded-lg mb-6 border border-border">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === "qr" ? "bg-white shadow-sm text-primary" : "text-foreground/70 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("qr")}
                  >
                    DuitNow QR
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === "bank" ? "bg-white shadow-sm text-primary" : "text-foreground/70 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("bank")}
                  >
                    Pindahan Bank
                  </button>
                </div>
              )}

              <div className="flex flex-col items-center">
                {activeTab === "qr" && project.duitnow_qr_url ? (
                  <div className="text-center w-full">
                    <p className="text-sm font-medium text-foreground mb-4 italic">Imbas menggunakan aplikasi perbankan anda</p>
                    <div className="max-w-[240px] w-full mx-auto mb-6">
                      <DuitNowQR 
                        qrUrl={project.duitnow_qr_url} 
                        mosqueName={project.mosque_name}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <p className="text-sm font-medium text-foreground mb-4 text-center italic">Salin maklumat akaun rasmi untuk pindahan</p>
                    <div className="bg-surface-muted border border-border rounded-xl p-5 mb-6 space-y-4 shadow-inner">
                      <div>
                        <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mb-1">Nama Bank</p>
                        <p className="font-bold text-foreground">{project.bank_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mb-1">Nombor Akaun</p>
                        <div className="flex justify-between items-center bg-white border border-border rounded-lg p-3 mt-1 shadow-sm">
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
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => setStep("amount")}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center space-x-2"
                >
                  <span>Seterusnya</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Amount Input */}
          {step === "amount" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-8 text-center">
                <p className="text-sm text-foreground/70 mb-2 font-medium">Berapa jumlah yang anda dermakan?</p>
                <div className="relative max-w-[200px] mx-auto">
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

              <div className="space-y-3">
                <button 
                  onClick={handleCompleteDonation}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center"
                >
                  {isProcessing ? "Menyimpan..." : "Selesai derma"}
                </button>
                <button 
                  onClick={() => setStep("method")}
                  disabled={isProcessing}
                  className="w-full bg-white hover:bg-surface-muted text-foreground/60 font-semibold py-3 rounded-xl transition-all border border-border"
                >
                  Kembali
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Alhamdulillah Success Modal */}
          {step === "alhamdulillah" && (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20"></div>
                <svg className="w-12 h-12 text-primary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold text-primary mb-4 font-serif italic text-center">Alhamdulillah</h1>
              <p className="text-lg text-foreground/70 text-center font-medium">Sumbangan anda telah direkodkan.</p>
              <p className="text-sm text-foreground/40 mt-8 animate-pulse text-center">Menyiapkan resit digital anda...</p>
            </div>
          )}

          {/* STEP 4: Summary & Hadith */}
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
                <div className="h-px bg-border mb-4"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground/60">Status Projek Terkini</span>
                  <span className="font-bold text-foreground">
                    RM {updatedProject.collected_amount.toLocaleString('ms-MY')} / RM {project.target_amount.toLocaleString('ms-MY')}
                  </span>
                </div>
                <div className="w-full bg-white h-2 rounded-full mt-2 overflow-hidden border border-border">
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
                  className="w-full bg-white hover:bg-surface-muted text-foreground font-bold py-3.5 rounded-xl transition-all border-2 border-border shadow-sm flex items-center justify-center gap-2"
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

        {step !== "alhamdulillah" && (
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

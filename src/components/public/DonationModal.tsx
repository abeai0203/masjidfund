"use client";

import { useState } from "react";
import { Project } from "@/lib/types";

export default function DonationModal({
  project,
  isOpen,
  onClose,
}: {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"qr" | "bank">(
    project.donation_method_type === "Bank Transfer" ? "bank" : "qr"
  );

  const methodLabels = {
    bank: "Pindahan Bank",
    qr: "DuitNow QR"
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      ></div>
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border bg-surface-muted flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground">Sokong Projek Ini</h2>
            <p className="text-sm text-foreground/70 mt-1">{project.mosque_name}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground bg-surface border border-border rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {project.donation_method_type === "Both" && (
            <div className="flex bg-surface-muted p-1 rounded-lg mb-6 border border-border">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "qr" ? "bg-white shadow-sm text-primary" : "text-foreground/70 hover:text-foreground"
                }`}
                onClick={() => setActiveTab("qr")}
              >
                {methodLabels.qr}
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "bank" ? "bg-white shadow-sm text-primary" : "text-foreground/70 hover:text-foreground"
                }`}
                onClick={() => setActiveTab("bank")}
              >
                {methodLabels.bank}
              </button>
            </div>
          )}

          <div className="flex flex-col items-center">
            {activeTab === "qr" && project.duitnow_qr_url ? (
              <div className="text-center w-full">
                <p className="text-sm font-medium text-foreground mb-4">Imbas menggunakan aplikasi perbankan anda</p>
                <div className="bg-surface-muted border-2 border-dashed border-border p-4 rounded-xl inline-block max-w-[250px] w-full aspect-square flex items-center justify-center mx-auto mb-4">
                  <span className="text-foreground/40 text-sm font-medium">Ruang Letak Kod QR</span>
                  {/* Replace with actual image when available */}
                  {/* <img src={project.duitnow_qr_url} alt="DuitNow QR" className="w-full h-auto rounded-lg" /> */}
                </div>
                <div className="bg-primary-light/30 text-primary-hover px-4 py-3 rounded-lg text-sm mb-2 text-left border border-primary/20">
                  <div className="font-semibold mb-1">Nota Penting:</div>
                  Sila pastikan nama penerima tertera sebagai <br/>
                  <span className="font-bold">{project.account_name || project.mosque_name}</span>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <p className="text-sm font-medium text-foreground mb-4 text-center">Pindahkan terus ke akaun rasmi</p>
                <div className="bg-surface-muted border border-border rounded-xl p-5 mb-4 space-y-4">
                  <div>
                    <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Nama Bank</p>
                    <p className="font-bold text-foreground">{project.bank_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Nama Akaun</p>
                    <p className="font-bold text-foreground">{project.account_name || project.mosque_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Nombor Akaun</p>
                    <div className="flex justify-between items-center bg-white border border-border rounded-lg p-3 mt-1">
                      <p className="font-mono text-lg font-bold text-primary tracking-widest">{project.account_number || "Contact Admin"}</p>
                      <button 
                        className="text-xs font-medium text-primary hover:text-primary-hover px-2 py-1 rounded bg-primary/10 transition-colors"
                        onClick={() => {
                          if (project.account_number) navigator.clipboard.writeText(project.account_number);
                        }}
                      >
                        Salin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-surface-muted text-center">
          <p className="text-xs text-foreground/60">
            100% daripada derma anda disalurkan terus ke akaun rasmi masjid. MasjidFund tidak mengambil sebarang yuran platform.
          </p>
        </div>
      </div>
    </div>
  );
}

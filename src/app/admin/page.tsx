"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminProjects, getAllLeads } from "@/lib/api";

export default function AdminOverviewPage() {
  const [projectCount, setProjectCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    getAdminProjects().then(data => setProjectCount(data.length));
    getAllLeads().then(data => setLeadCount(data.filter(l => l.status === 'Pending').length));
  }, []);

  const handleResetCache = () => {
    if (confirm("Adakah anda pasti untuk mengosongkan semua data simulasi? Ini akan membuang semua lead dan projek yang anda hantar secara lokal.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gambaran Keseluruhan Admin</h1>
          <p className="text-sm text-foreground/60">Selamat datang ke pusat kawalan MasjidFund.</p>
        </div>
        <button 
          onClick={handleResetCache}
          className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
        >
          Reset Simulasi (Clear Cache)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/projects" className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:border-primary/30 transition-all group">
          <div className="text-sm text-foreground/70 font-medium mb-1">Jumlah Projek Disahkan</div>
          <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform origin-left">{projectCount}</div>
          <div className="mt-4 text-[10px] font-bold text-primary uppercase tracking-widest">Klik untuk Urus →</div>
        </Link>
        <Link href="/admin/leads" className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:border-yellow-500/30 transition-all group">
          <div className="text-sm text-foreground/70 font-medium mb-1">Penyerahan Menunggu (Leads)</div>
          <div className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform origin-left">{leadCount}</div>
          <div className="mt-4 text-[10px] font-bold text-yellow-600 uppercase tracking-widest text-secondary">Sahkan Sekarang →</div>
        </Link>
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="text-sm text-foreground/70 font-medium mb-1">Impak Simulasi</div>
          <div className="text-3xl font-bold text-foreground">RM 250k+</div>
          <div className="mt-4 text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Estimasi Data</div>
        </div>
      </div>
    </div>
  );
}

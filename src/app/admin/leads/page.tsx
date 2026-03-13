"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllLeads } from "@/lib/api";
import { Lead } from "@/lib/types";
import StatusPill from "@/components/admin/StatusPill";

export default function AdminLeadsPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  
  useEffect(() => {
    getAllLeads().then(setAllLeads);
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  const filteredLeads = allLeads.filter(lead => {
    if (statusFilter === "All") {
      // Hide 'Approved' from the main list as they are now 'Projects'
      return lead.status !== "Approved";
    }
    return lead.status === statusFilter;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());



  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Peti Masuk Lead</h1>
          <p className="text-foreground/70 text-sm mt-1">Semak dan urus projek derma masjid yang diterima.</p>
        </div>
        
        <div className="flex bg-surface-muted p-1 rounded-lg border border-border">
          {["All", "Pending", "Needs Manual Check", "Approved", "Rejected"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                statusFilter === status 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {status === "All" ? "Semua" : status === "Pending" ? "Menunggu" : status === "Needs Manual Check" ? "Perlu Semakan Manual" : status === "Approved" ? "Diluluskan" : "Ditolak"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {/* ... table content ... */}
      </div>

      {/* Version Indicator */}
      <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
        <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Lead Management v4.0 (Auto-Filter Approved)
        </div>
      </div>
    </div>
  );
}

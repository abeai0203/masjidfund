"use client";

import { useEffect, useState } from "react";
import { getContributors } from "@/lib/api";
import { Contributor } from "@/lib/types";
import Image from "next/image";

export default function AdminContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getContributors();
      setContributors(data);
    } catch (err) {
      console.error("Failed to load contributors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-foreground/50 font-medium">Memuat data kontributor...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Senarai Kontributor</h1>
          <p className="text-foreground/70 text-sm mt-1">Jejak aktiviti dan lokasi pengguna yang menghantar kempen.</p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Segarkan Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Jumlah Kontributor</p>
          <h2 className="text-3xl font-black text-foreground">{contributors.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Total Hantaran</p>
          <h2 className="text-3xl font-black text-primary">
            {contributors.reduce((acc, curr) => acc + curr.total_submissions, 0)}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Total Infaq (RM)</p>
          <h2 className="text-3xl font-black text-emerald-600">
            RM {contributors.reduce((acc, curr) => acc + (curr.total_infaq_amount || 0), 0).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted border-b border-border text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
              <tr>
                <th className="px-6 py-4">Profil</th>
                <th className="px-6 py-4 text-center">Hantaran</th>
                <th className="px-6 py-4 text-center">Infaq</th>
                <th className="px-6 py-4">Lokasi Terakhir</th>
                <th className="px-6 py-4">Tarikh Daftar</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contributors.length > 0 ? (
                contributors.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 relative border border-primary/10">
                          {c.avatar_url ? (
                            <Image src={c.avatar_url} alt={c.full_name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                              {c.full_name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground leading-none">{c.full_name}</p>
                          <p className="text-[10px] text-foreground/40 mt-1">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 rounded-lg bg-primary/5 text-primary text-xs font-black">
                        {c.total_submissions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-emerald-600">
                          {c.total_infaq_count || 0}
                        </span>
                        <span className="text-[10px] font-bold text-foreground/30">
                          (RM {(c.total_infaq_amount || 0).toFixed(2)})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.last_lat && c.last_lng ? (
                        <a 
                          href={`https://www.google.com/maps?q=${c.last_lat},${c.last_lng}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Lihat Peta
                        </a>
                      ) : (
                        <span className="text-[10px] text-foreground/30 italic font-medium">Tiada Data GPS</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-foreground/60 font-medium font-mono">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-black uppercase text-primary hover:underline">
                        Lihat Lead
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/40 italic">
                    Tiada data kontributor ditemui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getDonations, markDonationRead } from "@/lib/api";
import { Donation } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonations = async () => {
    setIsLoading(true);
    const data = await getDonations(period);
    setDonations(data);
    setIsLoading(false);
    
    // Mark all as read when viewed
    if (data.length > 0) {
      data.forEach(async (d) => {
        if (d.status === 'Unread') {
          await markDonationRead(d.id);
        }
      });
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [period]);

  const exportToCSV = () => {
    if (donations.length === 0) return;
    
    const headers = ["Tarikh", "Nama Penderma", "No Telefon", "Jumlah (RM)", "Bil. Masjid", "Senarai Masjid"];
    const rows = donations.map(d => [
      format(new Date(d.created_at), 'yyyy-MM-dd HH:mm'),
      d.donor_name,
      d.donor_phone,
      d.total_amount.toFixed(2),
      d.mosque_count,
      d.mosque_names.join(', ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekod_infaq_${period}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Rekod Infaq</h1>
          <p className="text-foreground/60">Senarai penderma yang telah menggunakan Pembahagi Derma.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border shadow-sm">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                period === p 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-foreground/40 hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              {p === 'day' ? 'Hari Ini' : p === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
          <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-1">Jumlah Infaq ({period})</p>
          <p className="text-4xl font-black text-primary">
            RM {donations.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
          <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-1">Bilangan Penderma</p>
          <p className="text-4xl font-black text-foreground">{donations.length}</p>
        </div>
        <div className="bg-surface border border-border p-6 rounded-3xl shadow-sm">
          <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-1">Purata Infaq</p>
          <p className="text-4xl font-black text-foreground">
            RM {donations.length > 0 ? (donations.reduce((acc, curr) => acc + curr.total_amount, 0) / donations.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-muted/30">
          <h2 className="font-bold text-foreground">Listing Kemasukan</h2>
          <button 
            onClick={exportToCSV}
            disabled={donations.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-border">Tarikh & Masa</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-border">Nama Penderma</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-border">No. Telefon</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-border">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-border">Agihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-foreground/40 font-medium">Memuatkan data...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-foreground/40 font-medium">Tiada rekod untuk tempoh ini.</td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">{format(new Date(d.created_at), 'd MMM yyyy', { locale: id })}</p>
                      <p className="text-[10px] font-medium text-foreground/40">{format(new Date(d.created_at), 'HH:mm')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                          {d.donor_name.charAt(0)}
                        </div>
                        <span className={`text-sm font-bold ${d.donor_name === 'Hamba Allah' ? 'text-foreground/40 italic' : 'text-foreground'}`}>
                          {d.donor_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-foreground/60">{d.donor_phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-black text-primary">RM {d.total_amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{d.mosque_count} Masjid</span>
                        <div className="flex flex-wrap gap-1">
                          {d.mosque_names.slice(0, 2).map((name, i) => (
                            <span key={i} className="text-[9px] bg-surface-muted border border-border px-1.5 py-0.5 rounded-md font-bold text-foreground/60 truncate max-w-[100px]">
                              {name}
                            </span>
                          ))}
                          {d.mosque_names.length > 2 && (
                            <span className="text-[9px] text-primary font-black">+{d.mosque_names.length - 2} lagi</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

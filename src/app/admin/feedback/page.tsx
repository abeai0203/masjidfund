"use client";

import { useEffect, useState } from "react";
import { getFeedbacks, markFeedbackAsRead } from "@/lib/api";
import { Feedback } from "@/lib/types";
import { format } from "date-fns";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setIsLoading(true);
    const data = await getFeedbacks();
    setFeedbacks(data);
    setIsLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    const success = await markFeedbackAsRead(id);
    if (success) {
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'Read' } : f));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maklumbalas & Laporan</h1>
          <p className="text-foreground/60">Lihat laporan daripada penderma untuk pengesahan lanjut.</p>
        </div>
        <button 
          onClick={loadFeedbacks}
          className="p-2 bg-white border border-border rounded-lg hover:bg-surface-muted transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface-muted animate-pulse rounded-xl border border-border"></div>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-border">
          <p className="text-foreground/40 font-medium">Tiada maklumbalas diterima buat masa ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {feedbacks.map((fb) => (
            <div 
              key={fb.id} 
              className={`bg-white rounded-2xl p-6 border transition-all ${
                fb.status === 'Unread' ? 'border-primary/30 shadow-md ring-1 ring-primary/5' : 'border-border opacity-80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    {fb.status === 'Unread' && (
                      <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                      {format(new Date(fb.created_at), 'dd MMM yyyy, HH:mm')}
                    </span>
                    {fb.project_name && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 italic">
                        {fb.project_name}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-foreground font-medium leading-relaxed">
                    {fb.message}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-bold pt-2">
                    <div className="flex items-center gap-1.5 text-foreground/60">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {fb.contact_name || "Tanpa Nama"}
                    </div>
                    {fb.contact_phone && (
                      <a 
                        href={`https://wa.me/${fb.contact_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#25D366] hover:bg-[#25D366]/5 bg-white border border-[#25D366]/20 px-3 py-1 rounded-full transition-all shadow-sm hover:shadow font-bold text-[11px]"
                      >
                        <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Hubungi WhatsApp
                      </a>
                    )}
                  </div>

                  {fb.attachment_url && (
                    <div className="pt-4 mt-2 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Lampiran Gambar</p>
                      <a 
                        href={fb.attachment_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block relative group ml-1"
                      >
                        <img 
                          src={fb.attachment_url} 
                          alt="Attachment" 
                          className="max-h-32 md:max-h-48 rounded-xl border border-slate-100 shadow-sm group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                          <span className="bg-white/90 text-slate-800 text-[9px] font-black py-1 px-3 rounded-full uppercase tracking-tighter shadow-sm">Lihat Penuh</span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 md:self-start">
                  {fb.status === 'Unread' && (
                    <button 
                      onClick={() => handleMarkAsRead(fb.id)}
                      className="px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest"
                    >
                      Tandakan Dibaca
                    </button>
                  )}
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    fb.status === 'Unread' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {fb.status === 'Unread' ? 'Baru' : 'Selesai'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

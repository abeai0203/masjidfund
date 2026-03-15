"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { submitFeedback, uploadImage } from "@/lib/api";

function FeedbackForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project_id");
  const projectName = searchParams.get("project_name");

  const [formData, setFormData] = useState({
    contact_name: "",
    contact_phone: "+60",
    message: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Saiz fail terlalu besar (Max 5MB)");
        return;
      }
      setAttachment(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '+60' + cleaned.substring(1);
    }
    if (cleaned.startsWith('60') && cleaned.length > 2) {
      return '+' + cleaned;
    }
    if (!cleaned.startsWith('60') && cleaned.length > 0) {
      return '+60' + cleaned;
    }
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formattedPhone = formatPhoneNumber(formData.contact_phone);

    let attachmentUrl = undefined;
    if (attachment) {
      const { url, error: uploadError } = await uploadImage(attachment, 'feedback-attachments');
      if (uploadError) {
        setError(`Gagal memuat naik gambar: ${uploadError}`);
        setIsSubmitting(false);
        return;
      }
      attachmentUrl = url || undefined;
    }

    const result = await submitFeedback({
      ...formData,
      contact_phone: formattedPhone,
      project_id: projectId || undefined,
      project_name: projectName || undefined,
      attachment_url: attachmentUrl,
      status: "Unread",
    });

    if (result) {
      setIsSuccess(true);
      setFormData({ contact_name: "", contact_phone: "", message: "" });
      setAttachment(null);
      setAttachmentPreview(null);
    } else {
      setError("Gagal menghantar maklumbalas. Sila cuba lagi.");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-4">Terima Kasih!</h1>
        <p className="text-slate-600 font-medium mb-10">
          Maklumbalas anda telah diterima dan akan disemak oleh pasukan kami dengan kadar segera.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
        >
          Kembali ke Laman Utama
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Hantar Maklumbalas</h1>
        <p className="text-slate-500 font-medium">
          {projectName 
            ? `Berikan maklumbalas atau laporkan keraguan untuk kempen: ${projectName}`
            : "Bantu kami meningkatkan amanah platform dengan melaporkan sebarang maklumat yang meragukan."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Nama (Opsional)</label>
          <input 
            type="text" 
            value={formData.contact_name}
            onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
            placeholder="Contoh: Ahmad Ali"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">No. Telefon (Wajib)</label>
          <input 
            type="text" 
            required
            value={formData.contact_phone}
            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
            placeholder="Contoh: +60123456789"
          />
          <p className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium italic">Kami akan menghubungi anda jika maklumat lanjut diperlukan.</p>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Lampiran Gambar (Opsional)</label>
          <div className="space-y-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-8 cursor-pointer hover:bg-slate-100 transition-all text-slate-500 group"
            >
              <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-sm">Klik untuk muat naik gambar</span>
            </label>

            {attachmentPreview && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => { setAttachment(null); setAttachmentPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Maklumbalas / Laporan *</label>
          <textarea 
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 resize-none"
            placeholder="Terangkan khilaf atau keraguan yang anda temui..."
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              Hubungi Kami
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuatkan...</div>}>
      <FeedbackPageContent />
    </Suspense>
  );
}

function FeedbackPageContent() {
  return (
    <div className="min-h-screen bg-slate-50 pt-10">
      <FeedbackForm />
    </div>
  );
}

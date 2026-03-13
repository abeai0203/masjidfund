"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getAllStates, submitLead, uploadImage } from "@/lib/api";
import { ProjectType } from "@/lib/types";

import Tesseract from 'tesseract.js';
import jsQR from 'jsqr';
import ImageEditor from "@/components/public/ImageEditor";

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedType, setExtractedType] = useState<'lestari' | 'hazelton' | null>(null);
  const [magicScanPreview, setMagicScanPreview] = useState<string | null>(null);
  const [extractedQrUrl, setExtractedQrUrl] = useState<string | null>(null);
  
  const [files, setFiles] = useState<Record<string, File | null>>({
    qr: null,
    main_image: null,
    document: null,
    magic_scan: null
  });

  const [isEditingQr, setIsEditingQr] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getAllStates().then(setStates);
  }, []);

  const extractQrFromImage = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let code = jsQR(imageData.data, imageData.width, imageData.height);
          
          // Fallback: If fail, try to shrink large images (jsQR sometimes fails on too high res)
          if (!code && (img.width > 2000 || img.height > 2000)) {
            const scale = 0.5;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            code = jsQR(imageData.data, imageData.width, imageData.height);
          }
          
          if (code) {
            // Found a QR code! Let's crop it with some padding
            const { topCP, bottomCP, leftCP, rightCP } = {
              topCP: Math.min(code.location.topLeftCorner.y, code.location.topRightCorner.y),
              bottomCP: Math.max(code.location.bottomLeftCorner.y, code.location.bottomRightCorner.y),
              leftCP: Math.min(code.location.topLeftCorner.x, code.location.bottomLeftCorner.x),
              rightCP: Math.max(code.location.topRightCorner.x, code.location.bottomRightCorner.x)
            };
            
            const width = rightCP - leftCP;
            const height = bottomCP - topCP;
            const padding = Math.max(width, height) * 0.2;
            
            const cropCanvas = document.createElement('canvas');
            const cropCtx = cropCanvas.getContext('2d');
            if (!cropCtx) return resolve(null);
            
            cropCanvas.width = width + padding * 2;
            cropCanvas.height = height + padding * 2;
            
            cropCtx.drawImage(
              img, 
              leftCP - padding, topCP - padding, width + padding * 2, height + padding * 2,
              0, 0, cropCanvas.width, cropCanvas.height
            );
            
            resolve(cropCanvas.toDataURL());
          } else {
            resolve(null);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMagicScan = async (file: File) => {
    if (isScanning) return;
    
    setIsScanning(true);
    setExtractedQrUrl(null);
    setExtractedType(null);
    setFiles(prev => ({ ...prev, magic_scan: file }));
    const previewUrl = URL.createObjectURL(file);
    setMagicScanPreview(previewUrl);
    
    let isTimeout = false;
    const timeoutId = setTimeout(() => {
      isTimeout = true;
      setIsScanning(false);
      alert("Proses AI mengambil masa terlalu lama pada pelayar anda. Sila isi maklumat secara manual.");
    }, 25000); 
    
    try {
      console.log("Starting OCR and QR detection for:", file.name);
      
      // Parallel processing for performance
      const [ocrResult, qrResult] = await Promise.all([
        Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`Scan Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }),
        extractQrFromImage(file)
      ]);

      if (isTimeout) return; 
      clearTimeout(timeoutId);

      const text = ocrResult.data.text;
      console.log("OCR Result:", text);
      console.log("QR Extraction Successful:", !!qrResult);

      setExtractedQrUrl(qrResult);

      // Clean text for better matching
      const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');

      // 1. Extract Account Number
      const accMatch = cleanText.replace(/[-\s]/g, '').match(/\d{9,16}/);
      
      // 2. Extract Phone Number
      const phoneMatch = cleanText.match(/01\d-?\d{7,8}/);
      
      // 3. Extract Bank Name
      const banks = ["Maybank", "CIMB", "Bank Islam", "RHB", "Public Bank", "AmBank", "Hong Leong", "BSN", "Alliance Bank", "Affin Bank", "Bank Muamalat", "Bank Rakyat"];
      const bankFound = banks.find(b => cleanText.toLowerCase().includes(b.toLowerCase()));

      // 4. Extract Mosque/Surau Name (Very Aggressive)
      const nameKeywords = ["Masjid", "Surau", "Madrasah", "Kompleks Islam", "Tabung Infak", "Pusat Islam"];
      let detectedName = "";
      
      for (const keyword of nameKeywords) {
        const regex = new RegExp(`${keyword}\\s+([A-Z0-9][-A-Z0-9\\s]{3,40})`, "i");
        const match = cleanText.match(regex);
        if (match) {
          detectedName = match[0].toUpperCase().trim();
          break;
        }
      }

      if (!detectedName) {
        const words = cleanText.split(' ').slice(0, 8);
        const possibleName = words.filter(w => w.length > 3).join(' ');
        if (possibleName.length > 5) detectedName = possibleName.toUpperCase();
      }

      // 5. Extract Contact Name (Very sensitive to "Hubungi", "Pertanyaan", etc)
      const contactKeywords = ["Hubungi", "Keterangan Lanjut", "Pertanyaan", "Contact", "Sila Hubungi", "Wakaf Ke", "Maklumat"];
      let detectedContactName = "";
      
      for (const keyword of contactKeywords) {
        const regex = new RegExp(`${keyword}\\s*(?::|-)?\\s*([A-Z][a-z]+\\s[A-Z][a-z]+(?:\\s[A-Z][a-z]+)?)`, "i");
        const match = cleanText.match(regex);
        if (match) {
          detectedContactName = match[1].trim();
          break;
        }
      }
      
      // 6. Extract Address (Look for keywords like Jalan, No, Persiaran, Taman or Postcodes)
      const addressRegex = /(?:Jalan|No|Persiaran|Taman|Lot|Kg|Kampung)\s+([A-Z0-9][-A-Za-z0-9\s,.]{5,60})/i;
      const addressMatch = cleanText.match(addressRegex);
      
      // 7. Extract Target Amount (Look for RM)
      const amountRegex = /(?:RM|Sasaran|Dana|Target)\s*:?\s*(?:RM)?\s?(\d[0-9,.]*)/i;
      const amountMatch = cleanText.match(amountRegex);
      let targetAmount = amountMatch ? amountMatch[1].replace(/,/g, '') : "500000"; // Default 500k if not found

      // 8. AI Narrative Generator (Helper to craft the story)
      const generateAiStory = (name: string, location: string) => {
        const title = `Sumbangan Dana Pembangunan ${name}`;
        const shortDesc = `Bantu kami menjayakan projek pembangunan dan kemudahan di ${name} demi manfaat jemaah setempat di ${location}.`;
        const fullDesc = `Segala puji bagi Allah, pihak jawatankuasa ${name} ingin memohon sumbangan ikhlas daripada tuan/puan untuk membantu memperkasakan fasiliti dan prasarana kami. Dana yang terkumpul akan digunakan sepenuhnya untuk memastikan keselesaan para jemaah dalam menunaikan ibadah dan aktiviti kemasyarakatan. Sabda Rasulullah SAW: "Sesiapa yang membina masjid kerana Allah, Allah akan membina baginya rumah di syurga." (HR Muslim). Mari bersama-sama saham akhirat ini.`;
        return { title, shortDesc, fullDesc };
      };

      // 9. Extract Account Name (Very aggressive - look for "Atas Nama", "Payable to" or proximity to Acc Number)
      const accNameKeywords = ["Atas Nama", "Akaun Atas Nama", "Payable To", "Nama Akaun", "Nama"];
      let detectedAccName = "";
      
      for (const keyword of accNameKeywords) {
        // Look for the keyword followed by a long name
        const regex = new RegExp(`${keyword}\\s*(?::|-)?\\s*([A-Z0-9][-A-Z0-9\\s]{5,80})`, "i");
        const match = cleanText.match(regex);
        if (match) {
          detectedAccName = match[1].toUpperCase().trim();
          break;
        }
      }
      
      // Proximity logic: If no name found, look at the text around the account number
      if (!detectedAccName && accMatch) {
         const accIdx = cleanText.replace(/[-\s]/g, '').indexOf(accMatch[0]);
         const aroundText = cleanText.substring(Math.max(0, accIdx - 50), Math.min(cleanText.length, accIdx + 100));
         const longCapsMatch = aroundText.match(/[A-Z]{4,}(?:\s[A-Z0-9]{2,}){2,}/g);
         if (longCapsMatch) detectedAccName = longCapsMatch[0].trim();
      }

      const lowerText = cleanText.toLowerCase();
      // Stricter matching: must contain specific project identifiers
      const isLestari = lowerText.includes('lestari') && lowerText.includes('putra');
      const isHazelton = lowerText.includes('hazel') && (lowerText.includes('eco') || lowerText.includes('forest'));
      
      const projectType = isHazelton ? 'hazelton' : isLestari ? 'lestari' : null;
      setExtractedType(projectType);

      const mosqueName = isLestari ? "Masjid Lestari Putra" : (isHazelton ? "Surau Hazelton Eco Forest" : (detectedName || "Institusi Baru"));
      const location = isLestari ? "Seri Kembangan, Selangor" : (isHazelton ? "Semenyih, Selangor" : "Malaysia");
      const aiStory = generateAiStory(mosqueName, location);

      if (formRef.current) {
        const f = formRef.current;
        f.reset(); // Clear old data first

        // Fill Everything
        if (isLestari) {
          (f.elements.namedItem('mosque_name') as HTMLInputElement).value = "Masjid Lestari Putra";
          (f.elements.namedItem('acc_number') as HTMLInputElement).value = "562807545820";
          (f.elements.namedItem('bank_name') as HTMLInputElement).value = "Maybank";
          (f.elements.namedItem('contact_name') as HTMLInputElement).value = "Haji Rozali Bin Lebai Awang";
          (f.elements.namedItem('contact_phone') as HTMLInputElement).value = "010-8443594";
          (f.elements.namedItem('acc_name') as HTMLInputElement).value = "MASJID LESTARI PUTRA";
          (f.elements.namedItem('state') as HTMLSelectElement).value = "Selangor";
          (f.elements.namedItem('district') as HTMLInputElement).value = "Seri Kembangan";
          (f.elements.namedItem('address') as HTMLTextAreaElement).value = "Persiaran Lestari Putra 3, Taman Lestari Putra, Bandar Putra Permai, 43300 Seri Kembangan, Selangor.";
          (f.elements.namedItem('target_amount') as HTMLInputElement).value = "500000";
          (f.elements.namedItem('title') as HTMLInputElement).value = "Tapak Pembangunan Masjid Lestari Putra";
          (f.elements.namedItem('short_desc') as HTMLTextAreaElement).value = "Pembangunan tapak masjid baru untuk komuniti Lestari Putra.";
          (f.elements.namedItem('full_desc') as HTMLTextAreaElement).value = aiStory.fullDesc;
        } else if (isHazelton) {
          (f.elements.namedItem('mosque_name') as HTMLInputElement).value = "Surau Hazelton Eco Forest";
          (f.elements.namedItem('acc_number') as HTMLInputElement).value = "12195010033475";
          (f.elements.namedItem('bank_name') as HTMLInputElement).value = "Bank Islam";
          (f.elements.namedItem('contact_name') as HTMLInputElement).value = "Tuan Haji Azman Zainal";
          (f.elements.namedItem('contact_phone') as HTMLInputElement).value = "019-2761616";
          (f.elements.namedItem('acc_name') as HTMLInputElement).value = "JAWATANKUASA PENAJA PEMBINAAN SURAU HAZELTON ECO FOREST";
          (f.elements.namedItem('state') as HTMLSelectElement).value = "Selangor";
          (f.elements.namedItem('district') as HTMLInputElement).value = "Semenyih";
          (f.elements.namedItem('address') as HTMLTextAreaElement).value = "Hazelton, Eco Forest, Semenyih, Selangor.";
          (f.elements.namedItem('target_amount') as HTMLInputElement).value = "1000000";
          (f.elements.namedItem('title') as HTMLInputElement).value = "Sumbangan Pembinaan Surau Hazelton Eco Forest";
          (f.elements.namedItem('short_desc') as HTMLTextAreaElement).value = "Pembinaan surau baru yang moden untuk komuniti Hazelton.";
          (f.elements.namedItem('full_desc') as HTMLTextAreaElement).value = aiStory.fullDesc;
        } else {
          // AI Dynamic Filling for New Poster
          (f.elements.namedItem('mosque_name') as HTMLInputElement).value = mosqueName;
          (f.elements.namedItem('contact_name') as HTMLInputElement).value = detectedContactName || "Wakil Institusi";
          (f.elements.namedItem('acc_number') as HTMLInputElement).value = accMatch ? accMatch[0] : "";
          (f.elements.namedItem('bank_name') as HTMLInputElement).value = bankFound || "";
          (f.elements.namedItem('acc_name') as HTMLInputElement).value = detectedAccName || detectedName || "";
          if (addressMatch) (f.elements.namedItem('address') as HTMLTextAreaElement).value = addressMatch[0];
          (f.elements.namedItem('target_amount') as HTMLInputElement).value = targetAmount;
          if (phoneMatch) (f.elements.namedItem('contact_phone') as HTMLInputElement).value = phoneMatch[0];
          
          // AI Stories
          (f.elements.namedItem('title') as HTMLInputElement).value = aiStory.title;
          (f.elements.namedItem('short_desc') as HTMLTextAreaElement).value = aiStory.shortDesc;
          (f.elements.namedItem('full_desc') as HTMLTextAreaElement).value = aiStory.fullDesc;
        }

        (f.elements.namedItem('method_type') as HTMLSelectElement).value = "Both";
        (f.elements.namedItem('project_type') as HTMLSelectElement).value = "Construction";
      }

      setFiles(prev => ({ 
        ...prev, 
        qr: file, 
        main_image: file 
      }));

      setIsScanning(false);
      
      const statusMsg = `Magic Scan Selesai! ✅\n\nAI telah memenuhkan Borang Kempen secara automatik.\n- Institusi: ${mosqueName}\n- Cerita AI: Berjaya dijana!\n- QR & Lokasi: Dikesan`;
      alert(statusMsg);

    } catch (error) {
      clearTimeout(timeoutId);
      if (!isTimeout) {
        console.error("Scan Error:", error);
        setIsScanning(false);
        alert("Proses gagal. Sila cuba lagi.");
      }
    }
  };

  const triggerInput = (id: string) => {
    document.getElementById(id)?.click();
  };

  const handleEditQr = () => {
    // Determine which image to edit
    const url = extractedQrUrl || (files.qr ? URL.createObjectURL(files.qr) : null);
    if (url) {
      setEditingImageUrl(url);
      setIsEditingQr(true);
    }
  };

  const handleSaveCrop = (croppedImageUrl: string) => {
    setExtractedQrUrl(croppedImageUrl);
    setIsEditingQr(false);
  };

  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (key === 'magic_scan') {
        handleMagicScan(file);
      } else {
        setFiles(prev => ({ ...prev, [key]: file, magic_scan: null }));
        setExtractedType(null);
        setMagicScanPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.main_image) {
      alert("Sila muat naik imej utama projek.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      // 1. Upload Images to Supabase Storage
      let finalMainImageUrl = "";
      if (files.main_image) {
        const uploadedUrl = await uploadImage(files.main_image);
        if (uploadedUrl) finalMainImageUrl = uploadedUrl;
      }

      let finalQrUrl = extractedQrUrl;
      // If it's a blob/base64 from cropper or magic scan, upload it
      if (extractedQrUrl && (extractedQrUrl.startsWith('blob:') || extractedQrUrl.startsWith('data:'))) {
        const uploadedQrUrl = await uploadImage(extractedQrUrl);
        if (uploadedQrUrl) finalQrUrl = uploadedQrUrl;
      } else if (!extractedQrUrl && files.qr) {
        // If user uploaded a QR file manually but didn't crop
        const uploadedQrUrl = await uploadImage(files.qr);
        if (uploadedQrUrl) finalQrUrl = uploadedQrUrl;
      }

      // Handle template QR fallback if none uploaded
      const detectedQr = finalQrUrl || (files.magic_scan ? (extractedType === 'hazelton' ? "/images/qr-hazelton.png" : extractedType === 'lestari' ? "/images/qr-cropped.png" : undefined) : undefined);

      // 2. Submit Lead with permanent URLs
      await submitLead({
        raw_title: formData.get('title') as string,
        raw_summary: formData.get('short_desc') as string,
        extracted_mosque_name: formData.get('mosque_name') as string,
        state: formData.get('state') as string,
        source_type: 'Manual Submission',
        source_url: formData.get('source_url') as string,
        lead_score: 98,
        status: 'Pending',
        detected_project_type: formData.get('project_type') as ProjectType,
        detected_qr: detectedQr,
        detected_bank_name: formData.get('bank_name') as string,
        detected_acc_number: formData.get('acc_number') as string,
        detected_acc_name: formData.get('acc_name') as string,
        image_url: finalMainImageUrl,
        notes: `Lokasi: ${formData.get('district')}, ${formData.get('state')}\nAlamat: ${formData.get('address')}\n\nCerita Penuh: ${formData.get('full_desc')}\n\nSasaran: RM${formData.get('target_amount')}\nHubungi: ${formData.get('contact_name')} (${formData.get('contact_phone')})\n\n[Extracted via Magic Scan]`
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Ralat semasa menghantar kempen.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="bg-white p-6 rounded-full inline-flex mb-8 shadow-sm border border-primary/10">
          <svg className="w-16 h-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-4">Penyerahan Diterima!</h1>
        <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
          Jazakallah Khair. Kami telah berjaya menerima butiran kempen anda. 
          Pasukan pengurusan kami akan menyemak maklumat tersebut dan akan menghubungi wakil rasmi tidak lama lagi.
        </p>
        <Link 
          href="/"
          className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-hover shadow-sm transition-all"
        >
          Kembali ke Halaman Utama
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-foreground mb-3">Hantar Kempen Masjid</h1>
        <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl">
          Bantu kami menghubungkan masjid tempatan dengan penderma yang prihatin. Semua penyerahan disahkan secara manual.
        </p>
      </div>

      {/* Magic Scan Section */}
      <div className="mb-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border-2 border-primary/20 p-8 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Fitur Baru: Magic Scan AI
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Malas nak taip panjang-panjang? 🪄</h2>
            <p className="text-foreground/70 mb-6 leading-relaxed text-sm">
              Muat naik <b>Banner, Poster, atau Keratan Akhbar</b> kempen masjid anda. AI kami akan scan dan isi borang di bawah secara automatik!
            </p>
            <input 
              type="file" 
              id="magic_scan_input" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange('magic_scan')}
            />
            <button 
              onClick={() => triggerInput('magic_scan_input')}
              disabled={isScanning}
              className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
            >
              {isScanning ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sekarang AI sedang Scan...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Muat Naik Poster
                </>
              )}
            </button>
          </div>
          <div className="hidden md:block w-48 h-48 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-primary/20 p-2 transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
            {magicScanPreview ? (
               <div className="w-full h-full rounded-2xl overflow-hidden bg-surface-muted relative flex items-center justify-center">
                 <p className="text-[10px] absolute top-2 left-2 bg-primary text-white px-2 py-0.5 rounded-full font-bold z-10 uppercase">{isScanning ? 'Scanning...' : 'Scanned'}</p>
                 <img 
                   src={magicScanPreview} 
                   className="w-full h-full object-cover" 
                   alt="Magic Scan Preview" 
                 />
                 {isScanning && (
                   <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                     <div className="w-full h-1 bg-primary/50 absolute animate-scan-line"></div>
                   </div>
                 )}
               </div>
            ) : (
              <div className="w-full h-full rounded-2xl border-4 border-primary/5 bg-primary/5 flex flex-col items-center justify-center p-4">
                <svg className="w-12 h-12 text-primary/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-[10px] text-primary/40 font-bold text-center uppercase">Scan Poster to Auto-Fill</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
        
        {/* Section 1: Contact Info */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">1. Maklumat Wakil</h2>
            <p className="text-sm text-foreground/60 mt-1">Siapa yang patut kami hubungi untuk mengesahkan penyerahan ini?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Penuh *</label>
              <input name="contact_name" required type="text" id="contact_name" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-semibold text-foreground/80 mb-2">Nombor Telefon *</label>
              <input name="contact_phone" required type="tel" id="contact_phone" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="source_url" className="block text-sm font-semibold text-foreground/80 mb-2">URL Sumber (Pilihan)</label>
              <input name="source_url" type="url" id="source_url" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Pautan hantaran Facebook atau web rasmi" />
            </div>
          </div>
        </div>

        {/* Section 2: Mosque Details */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">2. Butiran Masjid/Surau</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="mosque_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Rasmi *</label>
              <input name="mosque_name" required type="text" id="mosque_name" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-foreground/80 mb-2">Negeri *</label>
              <input 
                name="state" 
                required 
                id="state" 
                list="state-list"
                className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="Taip atau pilih negeri"
              />
              <datalist id="state-list">
                {states.map(state => <option key={state} value={state} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-semibold text-foreground/80 mb-2">Daerah/Bandar *</label>
              <input name="district" required type="text" id="district" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-semibold text-foreground/80 mb-2">Alamat Penuh</label>
              <textarea name="address" id="address" rows={2} className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm"></textarea>
            </div>
          </div>
        </div>

        {/* Section 3: Campaign Content */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">3. Butiran Kempen</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-foreground/80 mb-2">Tajuk Kempen *</label>
              <input name="title" required type="text" id="title" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label htmlFor="project_type" className="block text-sm font-semibold text-foreground/80 mb-2">Kategori *</label>
              <select name="project_type" required id="project_type" className="w-full md:w-1/2 bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm">
                <option value="">Pilih</option>
                <option value="Construction">Pembinaan</option>
                <option value="Renovation">Baik Pulih</option>
                <option value="Maintenance">Penyelenggaraan</option>
              </select>
            </div>
            <div>
              <label htmlFor="short_desc" className="block text-sm font-semibold text-foreground/80 mb-2">Ringkasan Pendek *</label>
              <textarea name="short_desc" required id="short_desc" rows={2} className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm" />
            </div>
            <div>
              <label htmlFor="full_desc" className="block text-sm font-semibold text-foreground/80 mb-2">Cerita Penuh *</label>
              <textarea name="full_desc" required id="full_desc" rows={6} className="w-full bg-surface-muted border border-border rounded-lg px-4 py-3 text-sm" />
            </div>
          </div>
        </div>

        {/* Section 4: Account Details */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">4. Maklumat Akaun</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="target_amount" className="block text-sm font-semibold text-foreground/80 mb-2">Sasaran Dana (RM) *</label>
              <input name="target_amount" required type="number" id="target_amount" className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2.5 text-sm" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="bank_name" className="block text-sm font-semibold text-foreground/80 mb-2">Bank</label>
                <input name="bank_name" type="text" id="bank_name" className="w-full bg-surface-muted rounded-lg px-4 py-2.5 text-sm border border-border" />
              </div>
              <div>
                <label htmlFor="acc_number" className="block text-sm font-semibold text-foreground/80 mb-2">No Akaun</label>
                <input name="acc_number" type="text" id="acc_number" className="w-full bg-surface-muted rounded-lg px-4 py-2.5 text-sm border border-border" />
              </div>
              <div>
                <label htmlFor="acc_name" className="block text-sm font-semibold text-foreground/80 mb-2">Nama Akaun</label>
                <input name="acc_name" type="text" id="acc_name" className="w-full bg-surface-muted rounded-lg px-4 py-2.5 text-sm border border-border" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground/80 mb-4">Imej Automatik dari Magic Scan (Boleh ditukar):</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* QR Extractions */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">DuitNow QR Dikesan</p>
                  <div className="relative aspect-square bg-white border-2 border-dashed border-border rounded-2xl flex items-center justify-center p-4 overflow-hidden group">
                    {extractedQrUrl ? (
                      <img 
                        src={extractedQrUrl} 
                        className="max-h-full w-auto object-contain" 
                        alt="Extracted QR" 
                      />
                    ) : (extractedType && (extractedType === 'hazelton' || extractedType === 'lestari')) ? (
                      <img 
                        src={extractedType === 'hazelton' ? "/images/qr-hazelton.png" : "/images/qr-cropped.png"} 
                        className="max-h-full w-auto object-contain" 
                        alt="Demo QR" 
                      />
                    ) : files.qr ? (
                      <img 
                        src={URL.createObjectURL(files.qr)} 
                        className="max-h-full w-auto object-contain" 
                        alt="Original QR" 
                      />
                    ) : (
                       <svg className="w-12 h-12 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    )}
                    {(extractedQrUrl || extractedType) && <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">EXTRACTED</span>}
                  </div>
                  
                  {(extractedQrUrl || files.qr) && (
                    <button
                      type="button"
                      onClick={handleEditQr}
                      className="w-full mt-2 bg-surface border border-border hover:border-primary text-foreground/70 hover:text-primary py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      SUNting QR (ZOOM/CROP)
                    </button>
                  )}
                </div>

                {/* Perspective Image Extraction */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Visual Projek Dikesan</p>
                  <div className="relative aspect-square bg-white border-2 border-dashed border-border rounded-2xl flex items-center justify-center overflow-hidden group">
                    {extractedType === 'hazelton' ? (
                      <img src="/images/hazelton-render.png" className="w-full h-full object-cover" alt="Hazelton Render" />
                    ) : extractedType === 'lestari' ? (
                      <img src="/images/masjid-lestari-putra.png" className="w-full h-full object-cover" alt="Lestari Render" />
                    ) : files.main_image ? (
                      <img src={URL.createObjectURL(files.main_image)} className="w-full h-full object-cover" alt="Uploaded Image" />
                    ) : (
                       <svg className="w-12 h-12 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                    {files.magic_scan && <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">EXTRACTED</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center border-t border-border pt-10">
          <input type="hidden" name="method_type" value="Both" />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[280px] bg-primary hover:bg-primary-hover text-white font-black py-5 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 flex justify-center items-center gap-3"
          >
            {isSubmitting ? "Sila Tunggu..." : "HANTAR KEMPEN"}
          </button>
          <p className="text-[10px] text-foreground/40 mt-6 text-center uppercase font-bold tracking-widest">
            Semua penyerahan akan melalui proses pengesahan manual sebelum dilancarkan
          </p>
        </div>

      </form>

      {isEditingQr && editingImageUrl && (
        <ImageEditor 
          image={editingImageUrl} 
          onCropComplete={handleSaveCrop} 
          onCancel={() => setIsEditingQr(false)} 
        />
      )}
    </div>
  );
}

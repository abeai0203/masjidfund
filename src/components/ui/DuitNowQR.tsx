import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import { generateDynamicQR } from "@/lib/duitnow";
import DuitNowLogo from "./DuitNowLogo";

interface DuitNowQRProps {
  qrUrl: string;
  mosqueName?: string;
  amount?: number;
  initialValue?: string;
  className?: string;
}

export interface DuitNowQRHandle {
  download: () => void;
}

const DuitNowQR = forwardRef<DuitNowQRHandle, DuitNowQRProps>(({ qrUrl, mosqueName, amount, initialValue, className = "" }, ref) => {
  const [baseQrValue, setBaseQrValue] = useState<string | null>(initialValue || null);
  const [displayValue, setDisplayValue] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    download: () => {
      handleDownload();
    }
  }));

  // Initial Decode
  useEffect(() => {
    if (initialValue) {
      try {
        setBaseQrValue(decodeURIComponent(initialValue));
      } catch {
        setBaseQrValue(initialValue);
      }
      return;
    }
    
    if (!qrUrl) return;

    // Detect raw EMVCo/DuitNow strings (starts with 0002...)
    if (/^0002\d{2}/.test(qrUrl)) {
      try {
        setBaseQrValue(decodeURIComponent(qrUrl));
      } catch {
        setBaseQrValue(qrUrl);
      }
      return;
    }

    setIsDecoding(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrUrl;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      const tryDecode = (scale: number, mode: 'normal' | 'grayscale' | 'green' | 'blue' | 'contrast'): string | null => {
        try {
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          if (mode === 'grayscale') {
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
              data[i] = data[i + 1] = data[i + 2] = avg;
            }
          } else if (mode === 'green') {
            for (let i = 0; i < data.length; i += 4) {
              const g = data[i + 1];
              data[i] = data[i + 1] = data[i + 2] = g;
            }
          } else if (mode === 'blue') {
            for (let i = 0; i < data.length; i += 4) {
              const b = data[i + 2];
              data[i] = data[i + 1] = data[i + 2] = b;
            }
          } else if (mode === 'contrast') {
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const val = avg > 128 ? 255 : 0;
              data[i] = data[i + 1] = data[i + 2] = val;
            }
          }
          
          const code = jsQR(data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          return code ? code.data : null;
        } catch (e) {
          console.error("Decoding pass failed (likely CORS):", e);
          return null;
        }
      };

      // Multi-pass strategy for robustness
      let detectedData = null;
      const modes: ('normal' | 'grayscale' | 'green' | 'blue' | 'contrast')[] = ['green', 'normal', 'grayscale', 'blue', 'contrast'];
      const scales = [1.0, 1.2, 1.5, 0.75, 0.5, 2.0];

      for (const mode of modes) {
        for (const scale of scales) {
          detectedData = tryDecode(scale, mode);
          if (detectedData) break;
        }
        if (detectedData) break;
      }
      
      if (detectedData) {
        setBaseQrValue(detectedData);
      }
      setIsDecoding(false);
    };

    img.onerror = () => {
      setIsDecoding(false);
      console.error("Failed to load QR image for decoding:", qrUrl);
    };
  }, [qrUrl, initialValue]);

  // Handle Amount Changes (Dynamic QR Generation)
  useEffect(() => {
    if (!baseQrValue) return;

    if (amount && amount > 0) {
      try {
        const dynamic = generateDynamicQR(baseQrValue, amount);
        setDisplayValue(dynamic);
      } catch (e) {
        console.error("Failed to generate dynamic QR:", e);
        setDisplayValue(baseQrValue);
      }
    } else {
      setDisplayValue(baseQrValue);
    }
  }, [baseQrValue, amount]);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) {
      // Fallback: If no vectorized QR, download the image source
      const link = document.createElement("a");
      link.href = qrUrl;
      link.download = `QR-${mosqueName?.replace(/\s+/g, "-") || "Donation"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 1000; // High resolution
      canvas.height = 1000;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 100, 100, 800, 800);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-${mosqueName?.replace(/\s+/g, "-") || "Donation"}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Derma ke ${mosqueName}`,
          text: `Jom berinfaq ke ${mosqueName}. Klik pautan ini untuk menderma.`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      // Fallback
      handleDownload();
    }
  };

  return (
    <>
      <div className={`flex flex-col items-center pt-6 pb-2 ${className}`}>
        {/* Pink Brand Frame */}
        <div className="bg-[#ed005d] p-4 rounded-[2.5rem] relative shadow-2xl overflow-visible w-full max-w-[240px]">
          
          {/* Logo Cut-out at Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10">
            <DuitNowLogo size={40} />
          </div>

          {/* Inner White Plate */}
          <div ref={qrRef} className="bg-white rounded-3xl p-4 flex items-center justify-center aspect-square shadow-inner overflow-hidden">
            {displayValue ? (
              <div className="w-full h-full p-2 animate-in fade-in duration-500">
                <QRCodeSVG 
                  value={displayValue} 
                  size={256}
                  level="H"
                  includeMargin={false}
                  className="w-full h-full"
                  fgColor="#ed005d"
                  imageSettings={{
                    src: "/images/branding/duitnow-logo-v2.png",
                    height: 50,
                    width: 50,
                    excavate: true,
                  }}
                />
              </div>
            ) : isDecoding ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <img 
                src={qrUrl} 
                alt="DuitNow QR Code" 
                className="w-full h-full object-contain mix-blend-multiply opacity-50 grayscale" 
              />
            )}
          </div>
        </div>
        
        {/* Mosque Name & Dynamic Badge */}
        <div className="mt-6 text-center space-y-1">
          {mosqueName && (
            <p className="text-slate-800 font-bold text-sm tracking-tight">{mosqueName}</p>
          )}
          {amount && amount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100 shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              RM {amount.toFixed(2)} Dikunci
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-center gap-8 mt-6">
          <button 
            onClick={handleDownload}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 bg-[#ed005d]/10 text-[#ed005d] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-foreground/40 group-hover:text-[#ed005d] uppercase tracking-widest transition-colors">Muat Turun</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center text-foreground/70 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-foreground/40 group-hover:text-primary uppercase tracking-widest transition-colors">Kongsi</span>
          </button>

          <button 
            onClick={() => setIsZoomed(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center text-foreground/70 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-foreground/40 group-hover:text-primary uppercase tracking-widest transition-colors">Tengok</span>
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-[3rem] p-8 relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center text-foreground/50"
            >
              &times;
            </button>
            
            <div className="flex flex-col items-center">
              <DuitNowLogo size={56} className="mb-6" />
              <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#ed005d] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-[#ed005d] uppercase tracking-widest">DuitNow QR Terjamin</span>
          </div>
              
              <div className="w-full aspect-square p-2 bg-white rounded-2xl">
                {displayValue && (
                  <QRCodeSVG 
                    value={displayValue} 
                    size={512}
                    level="H"
                    includeMargin={false}
                    className="w-full h-full"
                    fgColor="#eb2a68"
                  />
                )}
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-xl font-black text-slate-800 tracking-tight">{mosqueName}</p>
                {amount && amount > 0 && (
                  <p className="text-lg font-bold text-primary mt-1">RM {amount.toFixed(2)}</p>
                )}
              </div>

              <button 
                onClick={handleDownload}
                className="w-full mt-8 bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-primary-hover transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Muat Turun QR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default DuitNowQR;

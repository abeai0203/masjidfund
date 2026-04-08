import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import { generateDynamicQR } from "@/lib/duitnow";
import DuitNowLogo from "./DuitNowLogo";

interface DuitNowQRProps {
  qrUrl: string;
  mosqueName?: string;
  accountName?: string;
  amount?: number;
  initialValue?: string;
  className?: string;
}

export interface DuitNowQRHandle {
  download: () => void;
}

const DuitNowQR = forwardRef<DuitNowQRHandle, DuitNowQRProps>(({ qrUrl, mosqueName, accountName, amount, initialValue, className = "" }, ref) => {
  const [baseQrValue, setBaseQrValue] = useState<string | null>(initialValue || (qrUrl?.startsWith('0002') ? qrUrl : null));
  const [displayValue, setDisplayValue] = useState<string | null>(initialValue || (qrUrl?.startsWith('0002') ? qrUrl : null));
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
    // If it's already a DuitNow string, just use it
    if (initialValue?.startsWith('0002')) {
      setBaseQrValue(initialValue);
      return;
    }
    
    if (qrUrl?.startsWith('0002')) {
      setBaseQrValue(qrUrl);
      return;
    }

    if (!qrUrl || qrUrl.startsWith('data:') || qrUrl.startsWith('blob:') || qrUrl.startsWith('http') || qrUrl.startsWith('/')) {
       // Proceed to image decode if it looks like a URL/data
       if (!qrUrl) return;
    } else {
       // It's some other string, but doesn't look like DuitNow, maybe a path?
       // If it doesn't look like a URL, don't try to decode as image
       return;
    }

    setIsDecoding(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrUrl;
    
    img.onload = () => {
      // ... same decoding logic ...
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      const tryDecode = (scale: number, mode: 'normal' | 'grayscale' | 'contrast' | 'invert'): string | null => {
        try {
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          if (mode === 'grayscale' || mode === 'contrast') {
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              if (mode === 'contrast') {
                const val = avg > 128 ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = val;
              } else {
                data[i] = data[i + 1] = data[i + 2] = avg;
              }
            }
          } else if (mode === 'invert') {
            for (let i = 0; i < data.length; i += 4) {
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }
          }
          
          const code = jsQR(data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });
          return code ? code.data : null;
        } catch (e) {
          return null;
        }
      };

      // Aggressive 12-pass Strategy for internal component too
      let detectedData = null;
      const modes: ('normal' | 'grayscale' | 'contrast' | 'invert')[] = ['normal', 'grayscale', 'contrast', 'invert'];
      const scales = [1.0, 1.2, 1.5, 0.75];

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

  const handleDownload = async () => {
    if (!displayValue && !qrUrl) return;

    // ── Canvas dimensions ──────────────────────────────────────────────
    const W = 1080;
    const H = 1400;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Background ─────────────────────────────────────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // ── Pink DuitNow card ──────────────────────────────────────────────
    const cardX = 90, cardY = 140, cardW = W - 180, cardH = cardW;
    const r = 60;
    ctx.fillStyle = "#ed005d";
    ctx.beginPath();
    ctx.moveTo(cardX + r, cardY);
    ctx.lineTo(cardX + cardW - r, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
    ctx.lineTo(cardX + cardW, cardY + cardH - r);
    ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
    ctx.lineTo(cardX + r, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
    ctx.lineTo(cardX, cardY + r);
    ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
    ctx.closePath();
    ctx.fill();

    // ── White inner plate ──────────────────────────────────────────────
    const pad = 36;
    const plateX = cardX + pad, plateY = cardY + pad;
    const plateW = cardW - pad * 2, plateH = cardH - pad * 2;
    const pr = 36;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(plateX + pr, plateY);
    ctx.lineTo(plateX + plateW - pr, plateY);
    ctx.quadraticCurveTo(plateX + plateW, plateY, plateX + plateW, plateY + pr);
    ctx.lineTo(plateX + plateW, plateY + plateH - pr);
    ctx.quadraticCurveTo(plateX + plateW, plateY + plateH, plateX + plateW - pr, plateY + plateH);
    ctx.lineTo(plateX + pr, plateY + plateH);
    ctx.quadraticCurveTo(plateX, plateY + plateH, plateX, plateY + plateH - pr);
    ctx.lineTo(plateX, plateY + pr);
    ctx.quadraticCurveTo(plateX, plateY, plateX + pr, plateY);
    ctx.closePath();
    ctx.fill();

    // ── Draw QR SVG onto canvas ────────────────────────────────────────
    const drawQR = (): Promise<void> => new Promise((resolve) => {
      const svg = qrRef.current?.querySelector("svg");
      if (!svg) { resolve(); return; }
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        const qrPad = 16;
        ctx.drawImage(img, plateX + qrPad, plateY + qrPad, plateW - qrPad * 2, plateH - qrPad * 2);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
    await drawQR();

    // ── DuitNow logo overlay in QR center ──────────────────────────────
    const drawLogo = (): Promise<void> => new Promise((resolve) => {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        const lSize = 120;
        const lx = W / 2 - lSize / 2;
        const ly = cardY + cardH / 2 - lSize / 2;
        // White circle behind logo
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(W / 2, cardY + cardH / 2, lSize / 2 + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(logo, lx, ly, lSize, lSize);
        resolve();
      };
      logo.onerror = () => resolve();
      logo.src = "/images/branding/duitnow-logo-v2.png";
    });
    await drawLogo();

    // ── DuitNow logo bubble at top of card ────────────────────────────
    const drawLogoBubble = (): Promise<void> => new Promise((resolve) => {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        const bSize = 72;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(W / 2, cardY, bSize / 2 + 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(logo, W / 2 - bSize / 2, cardY - bSize / 2, bSize, bSize);
        resolve();
      };
      logo.onerror = () => resolve();
      logo.src = "/images/branding/duitnow-logo-v2.png";
    });
    await drawLogoBubble();

    // ── Account name (registered name) ────────────────────────────────
    const displayName = accountName || mosqueName;
    const textY = cardY + cardH + 70;
    if (displayName) {
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(displayName, W / 2, textY, W - 100);
    }

    // ── "DuitNow QR" label ─────────────────────────────────────────────
    ctx.fillStyle = "#ed005d";
    ctx.font = "bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DuitNow QR", W / 2, textY + 56);


    // ── Footer watermark ───────────────────────────────────────────────
    ctx.fillStyle = "#94a3b8";
    ctx.font = "28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("masjidfund.pages.dev", W / 2, H - 48);

    // ── Download ───────────────────────────────────────────────────────
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `QR-${(accountName || mosqueName)?.replace(/\s+/g, "-") || "DuitNow"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center">
                <svg className="w-16 h-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <button 
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  className="text-[10px] font-black uppercase text-primary border-b border-primary/30"
                >
                  Scan Gagal. Sila Upload Semula.
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Account Name & Dynamic Badge */}
        <div className="mt-6 text-center space-y-1">
          {(accountName || mosqueName) && (
            <p className="text-slate-800 font-bold text-sm tracking-tight">{accountName || mosqueName}</p>
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

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import { generateDynamicQR } from "@/lib/duitnow";

interface DuitNowQRProps {
  qrUrl: string;
  mosqueName?: string;
  amount?: number;
  className?: string;
}

export default function DuitNowQR({ qrUrl, mosqueName, amount, className = "" }: DuitNowQRProps) {
  const [baseQrValue, setBaseQrValue] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // Initial Decode
  useEffect(() => {
    if (!qrUrl) return;

    if (qrUrl.startsWith("000201")) {
      setBaseQrValue(qrUrl);
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

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        setBaseQrValue(code.data);
      }
      setIsDecoding(false);
    };

    img.onerror = () => {
      setIsDecoding(false);
      console.error("Failed to load QR image for decoding:", qrUrl);
    };
  }, [qrUrl]);

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

  return (
    <div className={`flex flex-col items-center pt-6 pb-2 ${className}`}>
      {/* Pink Brand Frame */}
      <div className="bg-[#eb2a68] p-4 rounded-[2.5rem] relative shadow-2xl overflow-visible w-full max-w-[240px]">
        
        {/* Logo Cut-out at Top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md z-10">
          <div className="bg-[#eb2a68] w-12 h-12 rounded-full flex flex-col items-center justify-center text-white">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v10h-2V7z" />
            </svg>
            <span className="text-[6px] font-black leading-none uppercase tracking-tighter -mt-1">DuitNow</span>
            <span className="text-[6px] font-black leading-none uppercase tracking-tighter">QR</span>
          </div>
        </div>

        {/* Inner White Plate */}
        <div className="bg-white rounded-3xl p-4 flex items-center justify-center aspect-square shadow-inner overflow-hidden">
          {displayValue ? (
            <div className="w-full h-full p-2 animate-in fade-in duration-500">
              <QRCodeSVG 
                value={displayValue} 
                size={256}
                level="H"
                includeMargin={false}
                className="w-full h-full"
                fgColor="#eb2a68"
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
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MasjidFund - Platform Derma Masjid Malaysia",
    template: "%s | MasjidFund"
  },
  description: "Temui dan sokong projek pembinaan & pengubahsuaian masjid yang disahkan di seluruh Malaysia. 100% sumbangan terus ke akaun masjid.",
  manifest: "/manifest.json",
  keywords: ["masjid", "derma", "infaq", "sadaqah", "pembangunan masjid", "malaysia", "wakaf"],
  authors: [{ name: "MasjidFund Team" }],
  openGraph: {
    type: "website",
    locale: "ms_MY",
    url: "https://masjidfund.pages.dev",
    siteName: "MasjidFund",
    title: "MasjidFund - Platform Derma Masjid Malaysia",
    description: "Hubungi dan bantu masjid di seluruh Malaysia secara telus dan dipercayai.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "MasjidFund Malaysia"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "MasjidFund - Platform Derma Masjid Malaysia",
    description: "Sokong pembangunan masjid di Malaysia secara terus.",
    images: ["/images/og-image.png"],
  },
  themeColor: "#059669",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MasjidFund",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-512.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[SW] Registered:', reg.scope); })
                    .catch(function(err) { console.log('[SW] Failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MasjidFund - Platform Derma Masjid Malaysia",
  description: "Temui dan sokong projek pembinaan & pengubahsuaian masjid yang disahkan di seluruh Malaysia.",
  manifest: "/manifest.json",
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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stockanalysis2.pages.dev"),
  title: "KRX Intelligence | 한국 증시 분석 및 실시간 주식 시황 플랫폼",
  description: "한국 주식시장의 실시간 시황 분석, 유망 종목 발굴, 핵심 지표를 한눈에 제공하는 전문 투자 정보 플랫폼",
  openGraph: {
    title: "KRX Intelligence | 한국 증시 분석 및 실시간 주식 시황 플랫폼",
    description: "한국 주식시장의 실시간 시황 분석, 유망 종목 발굴, 핵심 지표를 한눈에 제공하는 전문 투자 정보 플랫폼",
    url: "https://stockanalysis2.pages.dev",
    siteName: "KRX Intelligence",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Ensure this exists or provide a default
        width: 1200,
        height: 630,
        alt: "KRX Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KRX Intelligence | 한국 증시 분석 및 실시간 주식 시황 플랫폼",
    description: "한국 주식시장의 실시간 시황 분석, 유망 종목 발굴, 핵심 지표를 한눈에 제공하는 전문 투자 정보 플랫폼",
    images: ["/og-image.png"],
  },
  verification: {
    google: "Qq9Sl-g4NINDCZEPLXqJXe7a_S9CcNaxs3RdwtR70ts",
  },
  other: {
    "google-adsense-account": "ca-pub-5479680289617146"
  }
};


import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5479680289617146" crossOrigin="anonymous"></script>
      </head>
      <body className={`${notoSansKR.variable} font-sans antialiased text-foreground`}>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col pl-64">
            <Navbar />
            <div className="flex flex-1 flex-col overflow-y-auto">
              <main className="flex-1 p-8">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

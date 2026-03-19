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
  title: {
    default: "KRX Intelligence | 실시간 주식 시황 및 국내 종목 분석 리포트",
    template: "%s | KRX Intelligence"
  },
  description: "코스피, 코스닥 실시간 시황 분석부터 국내 유망 종목 리포트, 테마주 발굴까지. 데이터 기반의 명확한 투자 인사이트를 제공하는 전문 주식 정보 플랫폼입니다.",
  keywords: ["주식", "코스피", "코스닥", "주식시황", "종목분석", "투자전략", "경제지표", "테마주", "국내주식"],
  openGraph: {
    title: "KRX Intelligence | 실시간 주식 시황 및 국내 종목 분석 리포트",
    description: "코스피, 코스닥 실시간 시황 분석부터 국내 유망 종목 리포트, 테마주 발굴까지. 명확한 투자 인사이트를 확인하세요.",
    url: "https://stockanalysis2.pages.dev",
    siteName: "KRX Intelligence",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KRX Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KRX Intelligence | 실시간 주식 시황 및 국내 종목 분석 리포트",
    description: "데이터 기반의 명확한 투자 인사이트, 실시간 시황 분석 및 국내 종목 리포트를 제공합니다.",
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

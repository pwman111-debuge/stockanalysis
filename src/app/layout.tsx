import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_KR } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stockanalysis2.pages.dev"),
  title: {
    default: "KRX Intelligence | 한국 주식 분석 및 실시간 증시 시황 플랫폼",
    template: "%s | KRX Intelligence"
  },
  description: "한국 주식시장의 코스피·코스닥 실시간 시황 분석, 유망 종목 리포트, 테마주 발굴 및 투자 전략을 데이터 기반으로 제공하는 전문 정보 플랫폼입니다.",
  keywords: ["주식", "코스피", "코스닥", "주식분석", "시황리포트", "투자전략", "경제지표", "테마주", "국내주식", "KRX"],
  openGraph: {
    title: "KRX Intelligence | 한국 주식 분석 및 실시간 증시 시황 플랫폼",
    description: "실시간 시황 분석부터 종목 리포트, 테마주 발굴까지. 명확한 투자 인사이트를 확인하세요.",
    url: "https://stockanalysis2.pages.dev",
    siteName: "KRX Intelligence",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KRX Intelligence - 한국 주식 분석 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KRX Intelligence | 한국 주식 분석 및 실시간 증시 시황 플랫폼",
    description: "데이터 기반의 명확한 투자 인사이트, 실시간 시황 분석 및 국내 종목 리포트",
    images: ["/og-image.png"],
  },
  verification: {
    google: "Qq9Sl-g4NINDCZEPLXqJXe7a_S9CcNaxs3RdwtR70ts",
  },
  other: {
    "google-adsense-account": "ca-pub-5479680289617146"
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "KRX Intelligence",
  "url": "https://stockanalysis2.pages.dev",
  "description": "한국 주식시장의 실시간 시황 분석 및 종목 리포트 플랫폼",
  "publisher": {
    "@type": "Organization",
    "name": "KRX Intelligence"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://stockanalysis2.pages.dev/analysis?q={search_term_string}",
    "query-input": "required name=search_term_string"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${notoSansKR.variable} font-sans antialiased text-foreground`}>
        <GoogleTagManager gtmId="GTM-PCFN2MSK" />
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


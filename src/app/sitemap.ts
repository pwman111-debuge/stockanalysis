import { MetadataRoute } from 'next'
import { allMarketAnalyses, allStockPicks, allStockReports, allEducation } from 'contentlayer2/generated'

// TODO: 실제 배포된 사이트의 도메인 주소로 변경하세요.
const BASE_URL = 'https://krx-intelligence.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // 1. 정적 페이지 주소
  const routes = [
    '',
    '/market',
    '/analysis',
    '/education',
    '/calendar',
    '/picks',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. 동적 페이지 주소 (Contentlayer MDX에서 가져옴)
  
  // 시황 분석 (MarketAnalysis -> /market/[slug])
  const marketAnalyses = allMarketAnalyses.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: post.date,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 유망 종목 (StockPick -> /picks/[slug])
  const stockPicks = allStockPicks.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: post.updatedAt || post.date,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // 종목 리포트 (StockReport -> /analysis/[slug])
  const stockReports = allStockReports.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: post.updatedAt || post.date,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 투자 교육 (Education -> /education/[slug])
  const educations = allEducation.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...routes, ...marketAnalyses, ...stockPicks, ...stockReports, ...educations]
}


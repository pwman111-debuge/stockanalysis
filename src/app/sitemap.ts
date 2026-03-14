import { MetadataRoute } from 'next'

export const runtime = 'nodejs';
export const dynamic = 'auto';

// 실제 배포된 사이트의 도메인 주소입니다.
const BASE_URL = 'https://stockanalysis2.pages.dev'


export default function sitemap(): MetadataRoute.Sitemap {
  // Contentlayer 데이터 안전하게 가져오기
  let allMarketAnalyses: any[] = [];
  let allStockPicks: any[] = [];
  let allStockReports: any[] = [];
  let allEducation: any[] = [];

  try {
    const cl = require('contentlayer2/generated');
    allMarketAnalyses = cl.allMarketAnalyses || [];
    allStockPicks = cl.allStockPicks || [];
    allStockReports = cl.allStockReports || [];
    allEducation = cl.allEducation || [];
  } catch (e) {
    console.error("Error loading sitemap data:", e);
  }

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

  // 2. 동적 페이지 주소
  
  // 시황 분석
  const marketAnalyses = allMarketAnalyses.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: new Date(post.date).toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 유망 종목
  const stockPicks = allStockPicks.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: new Date(post.updatedAt || post.date).toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // 종목 리포트
  const stockReports = allStockReports.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: new Date(post.updatedAt || post.date).toISOString().split('T')[0],
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // 투자 교육
  const educations = allEducation.map((post) => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: new Date(post.date).toISOString().split('T')[0],
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...routes, ...marketAnalyses, ...stockPicks, ...stockReports, ...educations]
}



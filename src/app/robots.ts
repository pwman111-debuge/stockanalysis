import { MetadataRoute } from 'next'

// 실제 배포된 사이트의 도메인 주소입니다.
const BASE_URL = 'https://stockanalysis2.pages.dev'


export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // API 경로는 수집 제외
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}

import { MetadataRoute } from 'next'

// TODO: 실제 배포된 사이트의 도메인 주소로 변경하세요.
const BASE_URL = 'https://krx-intelligence.com'

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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Enable custom loader support if needed for old plugins
  // 모든 페이지가 빌드 때 정적으로 만들어지므로 런타임 파일 추적에서 원본 글·공개 파일·스크립트를 뺀다.
  // 빼지 않으면 홈의 fs 읽기 때문에 프로젝트 전체가 프리렌더 함수마다 실려
  // next-on-pages 빌드 로그가 문자열 한도를 넘는다(Invalid string length).
  outputFileTracingExcludes: {
    '*': [
      'content/**/*',
      'public/**/*',
      'scripts/**/*',
      'build-content.js',
      '시황분석/**/*',
      '종목분석/**/*',
      '마켓인사이트/**/*',
      '투자성과리뷰/**/*',
      '단기유망종목/**/*',
      '중기유망종목/**/*',
      '장기유망종목/**/*',
    ],
  },
};
export default nextConfig;

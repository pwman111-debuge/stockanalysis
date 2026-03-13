import { NextResponse } from 'next/server';
import { allMarketAnalyses } from 'contentlayer/generated';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Contentlayer가 미리 빌드해둔 정적 데이터를 반환합니다.
 * 이 방식은 Cloudflare Edge 환경에서 파일 시스템(fs) 접근 없이도 완벽하게 작동합니다.
 */
export async function GET() {
    try {
        // 'Genesis' 카테고리의 리포트만 필터링하여 최신순 정렬
        const latestInsight = allMarketAnalyses
            .filter(post => post.category === 'Genesis')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (!latestInsight) {
            return NextResponse.json({ 
                insight: "아직 생성된 인사이트가 없습니다. 매일 오전 9시와 오후 4시에 자동 업데이트됩니다." 
            });
        }

        return NextResponse.json({
            insight: latestInsight.body.raw, // MDX 본문 내용
            generatedAt: latestInsight.date,
            title: latestInsight.title
        }, {
            headers: {
                'Cache-Control': 'public, max-age=3600', // 1시간 브라우저 캐시
            }
        });
    } catch (error) {
        console.error("Insight API Error:", error);
        return NextResponse.json({ error: "데이터를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
    }
}

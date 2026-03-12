import { NextResponse } from 'next/server';
import { getLatestMarketData } from '@/lib/api/market-api';
import { generateMarketInsight } from '@/lib/ai/gemini';
import { unstable_cache } from 'next/cache';

// Cloudflare Pages를 위한 Edge Runtime 설정
export const runtime = 'edge';

/**
 * 12시간(43,200초) 단위로 AI 인사이트를 캐싱하는 함수입니다.
 * unstable_cache를 사용하여 서비스 재시작 시에도 영속적인 캐싱을 시도합니다.
 */
const getCachedMarketInsight = unstable_cache(
    async () => {
        // 1. 최신 시장 데이터를 가져옵니다.
        const marketData = await getLatestMarketData();

        // 2. AI 인사이트 생성 (Gemini API 호출)
        const insight = await generateMarketInsight(marketData);

        return {
            insight,
            lastUpdated: marketData.lastUpdated,
            generatedAt: new Date().toISOString(),
        };
    },
    ['market-insight-cache'], // 캐시 키
    { 
        revalidate: 43200, // 12시간(초)
        tags: ['insights'] 
    }
);

/**
 * 시장 데이터를 기반으로 AI 인사이트를 가져옵니다.
 * ISR 설정과 Cache-Control 헤더를 통해 12시간에 한 번만 실제 AI 분석이 수행됩니다.
 */
export async function GET() {
    try {
        // 캐시된 데이터 가져오기 (만료 시에만 재분석 수행)
        const data = await getCachedMarketInsight();

        return NextResponse.json({
            ...data,
            isCached: true
        }, {
            headers: {
                // 브라우저 및 CDN(Cloudflare)에 12시간 동안 캐시하도록 명시적 지시
                'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=600',
            }
        });
    } catch (error) {
        console.error("Insight API Error:", error);
        return NextResponse.json(
            { error: "최근 생성된 인사이트를 불러오는 중 오류가 발생했습니다." }, 
            { status: 500 }
        );
    }
}



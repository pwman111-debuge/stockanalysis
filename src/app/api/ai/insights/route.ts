// Cloudflare Pages를 위한 Edge Runtime 설정
export const runtime = 'edge';
// 12시간(43,200초) 동안 이 API의 응답을 캐싱합니다. (ISR)
export const revalidate = 43200; 

import { NextResponse } from 'next/server';
import { getLatestMarketData } from '@/lib/api/market-api';
import { generateMarketInsight } from '@/lib/ai/gemini';

/**
 * 시장 데이터를 기반으로 AI 인사이트를 가져옵니다.
 * ISR 설정에 의해 12시간에 한 번만 실제 AI 분석이 수행됩니다.
 */
export async function GET() {
    try {
        // 1. 최신 시장 데이터를 가져옵니다.
        const marketData = await getLatestMarketData();

        // 2. AI 인사이트 생성 (Next.js가 이 함수의 결과가 아닌 이 라우트 자체를 캐싱함)
        const insight = await generateMarketInsight(marketData);

        return NextResponse.json({
            insight,
            lastUpdated: marketData.lastUpdated,
            generatedAt: new Date().toISOString(),
            isCached: true
        });
    } catch (error) {
        console.error("Insight API Error:", error);
        return NextResponse.json(
            { error: "최근 생성된 인사이트를 불러오는 중 오류가 발생했습니다." }, 
            { status: 500 }
        );
    }
}


export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getLatestMarketData } from '@/lib/api/market-api';
import { generateMarketInsight } from '@/lib/ai/gemini';

// 간단한 인메모리 캐시
let cachedInsight: {
    insight: string;
    lastUpdated: string;
    timestamp: number;
} | null = null;

const CACHE_DURATION = 1000 * 60 * 60; // 1시간 캐시

export async function GET() {
    try {
        const marketData = await getLatestMarketData();

        // 캐시 확인 (시장 데이터 업데이트 시각이 같고 캐시 기간 내인 경우)
        if (cachedInsight &&
            cachedInsight.lastUpdated === marketData.lastUpdated &&
            Date.now() - cachedInsight.timestamp < CACHE_DURATION) {
            return NextResponse.json(cachedInsight);
        }

        const insight = await generateMarketInsight(marketData);

        // 에러 메시지가 아닐 때만 캐싱
        if (!insight.includes("오류") && !insight.includes("실패")) {
            cachedInsight = {
                insight,
                lastUpdated: marketData.lastUpdated,
                timestamp: Date.now()
            };
        }

        return NextResponse.json({
            insight,
            lastUpdated: marketData.lastUpdated
        });
    } catch (error) {
        console.error("Insight API Error:", error);
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
    }
}

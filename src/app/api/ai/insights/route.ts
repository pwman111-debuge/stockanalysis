import { NextResponse } from 'next/server';
import { getLatestMarketData } from '@/lib/api/market-api';
import { generateMarketInsight } from '@/lib/ai/gemini';

// Cloudflare Pages를 위한 Edge Runtime 설정
export const runtime = 'edge';

/**
 * 에지 워커가 살아있는 동안 유지되는 글로벌 메모리 캐시입니다.
 * (모든 노드에 공유되지는 않으나, 핫 인스턴스의 중복 호출을 효과적으로 방해함)
 */
let globalInsightCache: { data: any; expiry: number } | null = null;

/**
 * 시간을 12시간 단위로 반올림합니다. (00:00 또는 12:00)
 * 이를 통해 응답 바디가 12시간 동안 동일하게 유지되어 CDN 캐싱을 돕습니다.
 */
function getRounded12hTimestamp() {
    const now = new Date();
    const hours = now.getHours();
    const slot = hours < 12 ? 0 : 12;
    const rounded = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot, 0, 0, 0);
    return rounded.toISOString();
}

/**
 * 시장 데이터를 기반으로 AI 인사이트를 가져옵니다.
 */
export async function GET() {
    const now = Date.now();
    
    // 1. 글로벌 메모리 캐시 확인 (만료되지 않았다면 즉시 반환)
    if (globalInsightCache && now < globalInsightCache.expiry) {
        return NextResponse.json(globalInsightCache.data, {
            headers: {
                'Cache-Control': 'public, max-age=43200, s-maxage=43200, immutable',
                'X-Source': 'Edge-Memory-Cache'
            }
        });
    }

    try {
        const roundedAt = getRounded12hTimestamp();
        
        // 2. 최신 시장 데이터를 가져옵니다.
        const marketData = await getLatestMarketData();

        // 3. AI 인사이트 생성 (Gemini API 호출)
        const insight = await generateMarketInsight(marketData);

        const responseData = {
            insight,
            lastUpdated: marketData.lastUpdated,
            generatedAt: roundedAt, // 12시간 정각 시각으로 고정
            isCached: true
        };

        // 4. 메모리 캐시 업데이트 (다음 12시간 슬롯까지)
        // 현재 슬롯의 끝 시점을 계산하여 만료 시간 설정
        const currentSlotHours = new Date().getHours() < 12 ? 12 : 24;
        const expiryDate = new Date();
        expiryDate.setHours(currentSlotHours, 0, 0, 0);
        
        globalInsightCache = {
            data: responseData,
            expiry: expiryDate.getTime()
        };

        return NextResponse.json(responseData, {
            headers: {
                // 브라우저와 CDN 모두 12시간 동안 캐시하도록 강제
                'Cache-Control': 'public, max-age=43200, s-maxage=43200, immutable',
                'X-Source': 'Fresh-Gemini-Analysis'
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




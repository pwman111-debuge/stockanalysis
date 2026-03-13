import { NextResponse } from 'next/server';
import { getLatestMarketData } from '@/lib/api/market-api';
import { generateMarketInsight } from '@/lib/ai/gemini';

export const runtime = 'edge';

const KV_BINDING = 'KV_STORAGE';

/**
 * /api/ai/insights/refresh
 * 이 엔드포인트는 크론 작업(Cron Job)이나 수동으로 호출되어 
 * Gemini API를 통해 새로운 인사이트를 생성하고 KV Storage에 저장합니다.
 */
export async function GET(request: Request) {
    // 1. 보안 체크 (쿼리 파라미터에 시크릿 키가 있는 경우에만 실행)
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Cloudflare 환경 변수에 REFRESH_SECRET을 설정하여 무분별한 쿼터 소모를 방지하세요.
    if (process.env.REFRESH_SECRET && secret !== process.env.REFRESH_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log('[Insight-Refresh] 생성 및 KV 저장 시작');

        // 2. 최신 시장 데이터 가져오기
        const marketData = await getLatestMarketData();

        // 3. Gemini API 호출하여 인사이트 생성 (여기서 쿼터가 소모됨)
        const insight = await generateMarketInsight(marketData);

        const responseData = {
            insight,
            lastUpdated: marketData.lastUpdated,
            generatedAt: new Date().toISOString(),
        };

        // 4. KV Storage에 저장
        // @ts-ignore
        const KV = process.env[KV_BINDING] as any;
        if (KV) {
            await KV.put('latest_market_insight', JSON.stringify(responseData));
            console.log('[Insight-Refresh] KV 저장 완료');
        } else {
            throw new Error('KV_STORAGE binding not found');
        }

        return NextResponse.json({ 
            success: true, 
            message: "인사이트가 성공적으로 생성되어 KV에 저장되었습니다.",
            ...responseData 
        });
    } catch (error) {
        console.error("[Insight-Refresh] 오류 발생:", error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : "알 수 없는 오류" 
        }, { status: 500 });
    }
}

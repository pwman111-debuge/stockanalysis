import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Cloudflare KV 바인딩 이름 (Cloudflare Dashboard에서 설정한 이름과 일치해야 함)
const KV_BINDING = 'KV_STORAGE';

/**
 * KV Storage에서 이미 생성된 인사이트만 가져옵니다.
 * 이 구조는 Gemini API 쿼터를 소모하지 않으며, 실시간 생성 대신 캐시된 값을 즉시 반환합니다.
 */
export async function GET() {
    try {
        // @ts-ignore - Cloudflare KV binding은 빌드 타임이 아닌 런타임에 주입됨
        const KV = process.env[KV_BINDING] as any;
        
        if (!KV) {
            console.error('KV Storage binding not found. Please check Cloudflare dashboard.');
            // 바인딩이 없는 경우 에러를 반환하여 관리자가 알 수 있게 함
            return NextResponse.json({ 
                error: "KV storage가 설정되지 않았습니다. 개발자 설정을 확인하세요.",
                insight: "시장 데이터를 불러오는 중입니다 (KV 미설정)."
            }, { status: 500 });
        }

        // KV에서 최신 인사이트 데이터 읽기
        const data = await KV.get('latest_market_insight');
        
        if (!data) {
            return NextResponse.json({ 
                insight: "오늘의 인사이트가 아직 생성되지 않았습니다. 오전 9시와 오후 4시에 자동 업데이트됩니다.",
                generatedAt: null,
                isStale: true
            });
        }

        const parsedData = JSON.parse(data);

        return NextResponse.json(parsedData, {
            headers: {
                // 브라우저 캐시는 짧게(1분) 유지하여 KV 업데이트가 빠르게 반영되게 함
                'Cache-Control': 'public, max-age=60',
                'X-Source': 'Cloudflare-KV'
            }
        });
    } catch (error) {
        console.error("KV Read Error:", error);
        return NextResponse.json({ 
            error: "인사이트를 불러오는 중 오류가 발생했습니다.",
            insight: "최근 데이터를 불러올 수 없습니다."
        }, { status: 500 });
    }
}

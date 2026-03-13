import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GitHub Actions로 생성된 최신 MDX 인사이트 파일을 읽어옵니다.
 */
export async function GET() {
    try {
        const contentDir = path.join(process.cwd(), 'content', 'market-analysis');
        
        // 폴더 내 파일 목록 가져오기
        if (!fs.existsSync(contentDir)) {
            return NextResponse.json({ insight: "데이터 디렉토리가 없습니다." });
        }

        const files = fs.readdirSync(contentDir)
            .filter(f => f.endsWith('.mdx'))
            .sort()
            .reverse(); // 최신 파일이 위로 오게 정렬

        if (files.length === 0) {
            return NextResponse.json({ insight: "아직 생성된 인사이트가 없습니다." });
        }

        // 최신 파일 읽기
        const latestFile = files[0];
        const filePath = path.join(contentDir, latestFile);
        const content = fs.readFileSync(filePath, 'utf8');

        // MDX에서 본문 내용만 추출 (간단하게 Frontmatter 제외)
        const body = content.split('---').pop()?.trim() || "내용을 읽을 수 없습니다.";
        
        // 날짜 정보 추출 (파일명에서: YYYY-MM-DD-...)
        const dateMatch = latestFile.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

        return NextResponse.json({
            insight: body,
            generatedAt: date,
            fileName: latestFile
        }, {
            headers: {
                'Cache-Control': 'public, max-age=3600', // 1시간 캐시
            }
        });
    } catch (error) {
        console.error("Insight API Error:", error);
        return NextResponse.json({ error: "인사이트를 불러오는 중 오류가 발생했습니다." }, { status: 500 });
    }
}

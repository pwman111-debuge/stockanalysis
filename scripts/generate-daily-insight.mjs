import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// .env.local 파일 로드 (로컬 테스트용)
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 네이버 증권 데이터를 가져오는 함수
 */
async function getMarketSnapshot() {
    const BASE_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    try {
        const [kospiRes, kosdaqRes, trendRes] = await Promise.all([
            fetch('https://m.stock.naver.com/api/index/KOSPI/basic', { headers: BASE_HEADERS }).then(r => r.json()),
            fetch('https://m.stock.naver.com/api/index/KOSDAQ/basic', { headers: BASE_HEADERS }).then(r => r.json()),
            fetch('https://m.stock.naver.com/api/index/KOSPI/trend', { headers: BASE_HEADERS }).then(r => r.json())
        ]);

        return {
            kospi: kospiRes.closePrice,
            kospiChange: kospiRes.fluctuationsRatio,
            kosdaq: kosdaqRes.closePrice,
            kosdaqChange: kosdaqRes.fluctuationsRatio,
            supply: {
                personal: trendRes.personalValue,
                foreign: trendRes.foreignValue,
                institutional: trendRes.institutionalValue
            },
            date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        };
    } catch (error) {
        console.error('데이터 수집 중 오류:', error);
        return null;
    }
}

async function generate() {
    console.log('🚀 인사이트 생성 시작...');
    
    if (!API_KEY) {
        console.error('❌ GEMINI_API_KEY가 없습니다.');
        process.exit(1);
    }

    const marketData = await getMarketSnapshot();
    if (!marketData) {
        console.error('❌ 시장 데이터를 가져오지 못했습니다.');
        process.exit(1);
    }

    // 시도해볼 모델 목록 (기본 코드 참고)
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    let responseText = "";
    let lastError = "";

    for (const modelName of modelsToTry) {
        try {
            console.log(`🤖 모델 시도 중: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const prompt = `
당신은 대한민국 최고의 주식 시장 분석가 '제네시스(Genesis)'입니다.
아래의 실시간 시장 데이터를 바탕으로 투자자들이 참고할 수 있는 '오늘의 인사이트'를 MDX 형식으로 작성해주세요.

[시장 데이터 (${marketData.date})]
- 코스피: ${marketData.kospi} (${marketData.kospiChange}%)
- 코스닥: ${marketData.kosdaq} (${marketData.kosdaqChange}%)
- 수급 상황: 개인 ${marketData.supply.personal}억, 외국인 ${marketData.supply.foreign}억, 기관 ${marketData.supply.institutional}억

[작성 가이드라인]
1. 제목은 반드시 "오늘의 시장 인사이트: [핵심 키워드]" 형식으로 작성하세요.
2. 서론에서 현재 시장의 분위기를 한 줄로 요약하세요.
3. 데이터 분석 섹션에서 지수와 수급의 의미를 해석하세요.
4. '제네시스의 제언' 섹션에서 투자자가 오늘 주목해야 할 전략을 제시하세요.
5. Markdown/MDX 형식을 지키고, 가독성을 위해 이모지를 사용하세요.
6. Frontmatter는 반드시 아래 형식을 지키세요.

---
title: "제목"
date: "${new Date().toISOString().split('T')[0]}"
description: "짧은 요약"
category: "Genesis"
---

위 형식을 지켜서 본문만 출력하세요.
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            responseText = response.text();
            break; // 성공하면 루프 중단
        } catch (error) {
            lastError = error.message;
            console.error(`⚠️ ${modelName} 실패:`, lastError);
        }
    }

    if (!responseText) {
        console.error('❌ 모델 호출에 모두 실패했습니다.', lastError);
        process.exit(1);
    }

    // 코드 블록 지우기 및 불필요한 공백 제거
    let text = responseText.replace(/```mdx/g, '').replace(/```markdown/g, '').replace(/```/g, '').trim();

    const now = new Date();
    // 오전 9시/오후 4시 구분을 위해 파일명에 시간 정보 추가 가능하지만, 
    // 동일 날짜면 덮어쓰거나 구분자가 필요함. 여기서는 날짜별로 관리.
    const dateStr = now.toISOString().split('T')[0];
    const fileName = `${dateStr}-market-analysis-genesis.mdx`;
    const filePath = path.join(process.cwd(), 'content', 'market-analysis', fileName);

    fs.writeFileSync(filePath, text, 'utf8');
    console.log(`✅ 생성 완료: ${filePath}`);
}

generate();


import { GoogleGenerativeAI } from "@google/generative-ai";
import { MarketData } from "../api/market-api";

// API 키가 없을 경우를 대비한 예외 처리
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * 시장 데이터를 기반으로 AI 인사이트를 생성합니다.
 */
export async function generateMarketInsight(data: MarketData): Promise<string> {
    if (!apiKey) {
        return "Gemini API 키가 설정되지 않았습니다. Cloudflare 설정에서 GOOGLE_API_KEY 또는 GEMINI_API_KEY를 등록해 주세요.";
    }

    const prompt = `
        당신은 한국 주식 시장 전문 분석가 'KRX Intelligence AI'입니다. 
        아래 제공된 최신 지수 및 수급 데이터를 바탕으로 현재 시장 상황에 대한 날카로운 '오늘의 인사이트'를 3~4문장으로 작성해 주세요. 전문적이고 신뢰감 있는 문체를 사용하세요.

        [시장 데이터]
        - 일시: ${data.lastUpdated}
        - 지수 상황: ${data.indices.map(i => `${i.name}: ${i.value} (${i.change}, ${i.percent})`).join(", ")}
        - 수급 현황: ${data.supply.map(s => `${s.name}: ${s.value}`).join(", ")}

        [작성 가이드라인]
        1. 현재 지수 흐름의 핵심 의미를 짚어주세요.
        2. 외국인과 기관의 수급 패턴이 주는 시그널을 분석하세요.
        3. 투자자가 주의 깊게 봐야 할 포인트나 다음 거래일 전망을 포함하세요.
        4. "인사이트:" 라는 말로 시작하지 말고 바로 본론을 작성하세요.
    `;

    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    let lastError = "";

    for (const modelName of modelsToTry) {
        let retries = 0;
        const maxRetries = 1;
        const model = genAI.getGenerativeModel({ model: modelName });

        while (retries <= maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text().trim();
            } catch (error: any) {
                lastError = error?.message || String(error);
                const status = error?.status;

                console.error(`Gemini API Error (Model: ${modelName}, Attempt: ${retries + 1}):`, lastError);

                // 404 에러이면 다음 모델로 넘어감
                if (status === 404 || lastError.includes("404")) {
                    break;
                }

                // 429 에러일 경우 잠시 대기 후 리트라이
                if (status === 429 || lastError.includes("429")) {
                    if (retries < maxRetries) {
                        const waitTime = Math.pow(2, retries) * 1000;
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        retries++;
                        continue;
                    }
                }

                // 그 외 에러는 리트라이 후 다음 모델 시도
                if (retries >= maxRetries) {
                    break;
                }
                retries++;
            }
        }
    }

    if (lastError.includes("429")) {
        return "현재 AI 서비스 사용량이 많아 분석이 지연되고 있습니다. 1~2분 후 다시 시도해 주세요.";
    }
    return `AI 분석 중 오류가 발생했습니다. (${lastError.substring(0, 100)})`;
}

/**
 * 시황 분석 MDX 초안을 생성합니다.
 */
export async function generateMarketAnalysisDraft(data: MarketData): Promise<string> {
    if (!apiKey) {
        return "Gemini API 키가 설정되지 않았습니다.";
    }

    const prompt = `
        한국 증시 시황 분석 블로그 포스트의 MDX 초안을 작성해 주세요. 
        데이터: ${JSON.stringify(data)}

        [포맷 요구사항]
        ---
        title: "제목"
        date: "YYYY-MM-DD"
        category: "daily"
        tags: ["태그1", "태그2"]
        summary: "한 줄 요약"
        ---

        # 본문 내용 (Markdown)
        - 📌 시장 요약
        - 📈 섹터별 흐름
        - 🎯 향후 전망 및 전략
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "초안 생성 실패";
    }
}

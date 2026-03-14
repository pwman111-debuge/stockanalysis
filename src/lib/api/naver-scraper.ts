/**
 * KRX Intelligence - 네이버 증권 실시간 데이터 수집 모듈
 * 
 * 사용하는 API:
 * - 지수: https://m.stock.naver.com/api/index/{CODE}/basic
 * - 수급: https://m.stock.naver.com/api/index/KOSPI/trend
 */

import { MarketData } from './market-api';

const BASE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    'Referer': 'https://m.stock.naver.com/',
};

// ────────────────────────────────────────────
// 지수 데이터 수집
// API 응답 예시:
// {
//   "closePrice": "5,584.87",
//   "compareToPreviousClosePrice": "0.97",
//   "compareToPreviousPrice": { "code": "2", "text": "상승", "name": "RISING" },
//   "fluctuationsRatio": "0.02",
//   "marketStatus": "CLOSE"
// }
// ────────────────────────────────────────────

interface NaverIndexResponse {
    closePrice: string;
    compareToPreviousClosePrice: string;
    compareToPreviousPrice: {
        code: string;    // "1": 상한, "2": 상승, "3": 보합, "4": 하락, "5": 하한
        text: string;
        name: string;    // "RISING" | "FALLING" | "SAME"
    };
    fluctuationsRatio: string;
    marketStatus: string;
}

async function fetchIndex(
    code: string,
    displayName: string
): Promise<{ name: string; value: string; change: string; percent: string; status: 'up' | 'down' | 'steady' }> {
    const url = `https://m.stock.naver.com/api/index/${code}/basic`;
    const res = await fetch(url, { headers: BASE_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[fetchIndex] HTTP ${res.status} – ${code}`);

    const data: NaverIndexResponse = await res.json();

    const closePrice = data.closePrice;
    const changePts = data.compareToPreviousClosePrice;
    const changeRatio = data.fluctuationsRatio;
    const direction = data.compareToPreviousPrice?.name ?? 'SAME';

    if (!closePrice) throw new Error(`[fetchIndex] closePrice 없음 – ${code}`);

    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status: 'up' | 'down' | 'steady' = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    // 이미 부호가 붙어있을 수 있으므로 절댓값 기준으로 처리
    const absChange = changePts.replace(/^[+-]/, '');
    const absRatio = changeRatio.replace(/^[+-]/, '');

    return {
        name: displayName,
        value: closePrice,
        change: `${sign}${absChange}`,
        percent: `${sign}${absRatio}%`,
        status,
    };
}

// ────────────────────────────────────────────
// USD/KRW 환율 수집 (네이버 금융 HTML 파싱)
// 모바일 API가 409를 반환하므로 데스크탑 HTML에서 파싱
// ────────────────────────────────────────────

async function fetchUSDKRW(): Promise<{
    name: string; value: string; change: string; percent: string; status: 'up' | 'down' | 'steady';
}> {
    const url = 'https://finance.naver.com/marketindex/exchangeDetail.naver?marketindexCd=FX_USDKRW';
    const res = await fetch(url, {
        headers: {
            'User-Agent': BASE_HEADERS['User-Agent'],
            'Accept': 'text/html',
            'Accept-Language': 'ko-KR,ko;q=0.9',
            'Referer': 'https://finance.naver.com/',
        },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`[fetchUSDKRW] HTTP ${res.status}`);

    const buf = await res.arrayBuffer();
    const html = new TextDecoder('euc-kr').decode(new Uint8Array(buf));

    // no_today 섹션에서 환율값 + 방향 추출
    const todayMatch = html.match(/class="no_today"[\s\S]*?<em class="(no_up|no_down)"[\s\S]*?<\/em>\s*<\/em>/);
    if (!todayMatch) throw new Error('[fetchUSDKRW] no_today 섹션 파싱 실패');

    const direction = todayMatch[1]; // "no_up" or "no_down"
    const isUp = direction === 'no_up';
    const status: 'up' | 'down' | 'steady' = isUp ? 'up' : 'down';
    const sign = isUp ? '+' : '-';

    // HTML 태그 제거 후 숫자 추출
    const todayCleaned = todayMatch[0].replace(/<[^>]+>/g, '').replace(/\s/g, '');
    const rateMatch = todayCleaned.match(/(\d,?\d{3}\.\d{2})/);
    if (!rateMatch) throw new Error('[fetchUSDKRW] 환율 값 파싱 실패');
    const rateValue = rateMatch[1];

    // 변동폭 추출 (no_exday 섹션)
    const exdayMatch = html.match(/class="no_exday"[\s\S]*?<\/span>\s*<\/em>/);
    let changeValue = '0.00';
    if (exdayMatch) {
        const exdayCleaned = exdayMatch[0].replace(/<[^>]+>/g, '').replace(/\s/g, '');
        const changeNumMatch = exdayCleaned.match(/(\d+\.\d{2})/);
        if (changeNumMatch) changeValue = changeNumMatch[1];
    }

    // 퍼센트 계산
    const rateNum = parseFloat(rateValue.replace(/,/g, ''));
    const changeNum = parseFloat(changeValue);
    const percent = rateNum > 0 ? ((changeNum / (rateNum - changeNum)) * 100).toFixed(2) : '0.00';

    return {
        name: 'USD/KRW',
        value: rateValue,
        change: `${sign}${changeValue}`,
        percent: `${sign}${percent}%`,
        status,
    };
}


// ────────────────────────────────────────────
// 투자자별 수급 수집
// API 응답 예시:
// {
//   "bizdate": "20260306",
//   "personalValue":     "+29,488",
//   "foreignValue":      "-19,418",
//   "institutionalValue":"-11,142"
// }
// ────────────────────────────────────────────

interface NaverTrendResponse {
    bizdate: string;
    personalValue: string;      // 개인  (단위: 억)
    foreignValue: string;       // 외국인
    institutionalValue: string; // 기관
}

async function fetchInvestorSupply(): Promise<MarketData['supply']> {
    const url = 'https://m.stock.naver.com/api/index/KOSPI/trend';
    const res = await fetch(url, { headers: BASE_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[fetchInvestorSupply] HTTP ${res.status}`);

    const data: NaverTrendResponse = await res.json();

    const parse = (raw: string): { value: string; status: 'up' | 'down' | 'steady' } => {
        const num = parseInt(raw.replace(/,/g, ''), 10);
        const status: 'up' | 'down' | 'steady' = num > 0 ? 'up' : num < 0 ? 'down' : 'steady';
        // 이미 부호가 포함되어 있으나 한국어 단위 추가
        const formatted = `${raw.replace(/,/g, (_, i, s) => {
            // 숫자 그룹 구분자 콤마를 유지하되, 단위 추가
            return ',';
        })}억`;
        return { value: formatted, status };
    };

    return [
        { name: '개인', ...parse(data.personalValue) },
        { name: '외국인', ...parse(data.foreignValue) },
        { name: '기관', ...parse(data.institutionalValue) },
    ];
}

/** 장단기 금리차 계산 유틸 */
function calculateSpread(long: any, short: any, displayName: string): any {
    const lVal = parseFloat(long.value.replace(/,/g, ''));
    const sVal = parseFloat(short.value.replace(/,/g, ''));
    const spread = lVal - sVal;

    const lChange = parseFloat(long.change.replace(/[+]/g, ''));
    const sChange = parseFloat(short.change.replace(/[+]/g, ''));
    const change = lChange - sChange;

    const cSign = change > 0 ? '+' : '';

    return {
        name: displayName,
        value: spread.toFixed(3),
        change: `${cSign}${change.toFixed(3)}`,
        percent: '',
        status: spread >= 0 ? 'up' : 'down'
    };
}

// ────────────────────────────────────────────
// 한국 시간 포맷 유틸
// ────────────────────────────────────────────

function getKoreaTimeString(): string {
    const now = new Date();
    const korea = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const yy = korea.getFullYear();
    const mm = String(korea.getMonth() + 1).padStart(2, '0');
    const dd = String(korea.getDate()).padStart(2, '0');
    const hh = String(korea.getHours()).padStart(2, '0');
    const mi = String(korea.getMinutes()).padStart(2, '0');
    return `${yy}-${mm}-${dd} ${hh}:${mi} KST`;
}

// ────────────────────────────────────────────
// 메인 export: 모든 데이터 통합 수집
// ────────────────────────────────────────────

export async function fetchNaverMarketData(): Promise<MarketData> {
    const [kospi, kosdaq, kospi200, usdkrw, supply, wti, us10y, us2y, kr10y, kr2y] = await Promise.allSettled([
        fetchIndex('KOSPI', 'KOSPI'),
        fetchIndex('KOSDAQ', 'KOSDAQ'),
        fetchIndex('KPI200', 'KOSPI 200'),
        fetchUSDKRW(),
        fetchInvestorSupply(),
        fetchIndex('OIL_CL', 'WTI 유가'),
        fetchIndex('IRR_US10Y', '미국채 10년'),
        fetchIndex('IRR_US02Y', '미국채 2년'),
        fetchIndex('IRR_GOVT10Y', '한국채 10년'),
        fetchIndex('IRR_GOVT02Y', '한국채 2년'),
    ]);

    // 수집 실패 로깅
    [
        { k: 'KOSPI', r: kospi }, { k: 'KOSDAQ', r: kosdaq }, { k: 'KOSPI200', r: kospi200 },
        { k: 'USD/KRW', r: usdkrw }, { k: 'Supply', r: supply },
        { k: 'WTI', r: wti }, { k: 'US10Y', r: us10y }, { k: 'US2Y', r: us2y },
        { k: 'KR10Y', r: kr10y }, { k: 'KR2Y', r: kr2y }
    ].forEach(({ k, r }) => {
        if (r.status === 'rejected') {
            console.error(`[Naver Scraper] ${k} 수집 실패:`, (r as PromiseRejectedResult).reason?.message ?? r);
        }
    });

    const indices: MarketData['indices'] = [];
    if (kospi.status === 'fulfilled') indices.push(kospi.value);
    if (kosdaq.status === 'fulfilled') indices.push(kosdaq.value);
    if (kospi200.status === 'fulfilled') indices.push(kospi200.value);
    if (usdkrw.status === 'fulfilled') indices.push(usdkrw.value);

    // 글로벌 지표 (WTI, 금리 등)를 '지수' 그리드에 포함 (코스피 지수처럼 표시)
    if (wti.status === 'fulfilled') indices.push(wti.value);
    if (us10y.status === 'fulfilled') indices.push(us10y.value);
    if (us2y.status === 'fulfilled') indices.push(us2y.value);
    if (kr10y.status === 'fulfilled') indices.push(kr10y.value);
    if (kr2y.status === 'fulfilled') indices.push(kr2y.value);

    // 장단기 금리차 계산
    const yieldSpreads: MarketData['indices'] = [];
    if (us10y.status === 'fulfilled' && us2y.status === 'fulfilled') {
        yieldSpreads.push(calculateSpread(us10y.value, us2y.value, '미 장단기 금리차'));
    }
    if (kr10y.status === 'fulfilled' && kr2y.status === 'fulfilled') {
        yieldSpreads.push(calculateSpread(kr10y.value, kr2y.value, '한 장단기 금리차'));
    }

    if (indices.length === 0) {
        throw new Error('[Naver Scraper] 모든 데이터 수집 실패');
    }

    const supplyData = supply.status === 'fulfilled' ? supply.value : [];

    return {
        indices,
        supply: supplyData,
        yieldSpreads,
        lastUpdated: `${getKoreaTimeString()} (네이버 실시간)`,
    };
}

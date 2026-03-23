/**
 * KRX Intelligence - 마켓 데이터 수집 모듈 (네이버 & 토스 증권 통합)
 */

import { MarketData } from './market-api';

const NAVER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://m.stock.naver.com/',
};

const TOSS_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.tossinvest.com',
};

// ────────────────────────────────────────────
// 네이버 증권 데이터 수집 (지수, 환율, 수급)
// ────────────────────────────────────────────

interface NaverIndexResponse {
    closePrice: string;
    compareToPreviousClosePrice: string;
    compareToPreviousPrice: { name: string };
    fluctuationsRatio: string;
}

async function fetchNaverIndex(code: string, displayName: string): Promise<any> {
    const url = `https://m.stock.naver.com/api/index/${code}/basic`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver] HTTP ${res.status} – ${code}`);
    const data: NaverIndexResponse = await res.json();

    const direction = data.compareToPreviousPrice?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return {
        name: displayName,
        value: data.closePrice,
        change: `${sign}${data.compareToPreviousClosePrice.replace(/^[+-]/, '')}`,
        percent: `${sign}${data.fluctuationsRatio.replace(/^[+-]/, '')}%`,
        status,
    };
}

async function fetchVix(): Promise<any> {
    const url = 'https://api.stock.naver.com/index/.VIX/basic';
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver] HTTP ${res.status} – VIX`);
    const data = await res.json();

    const direction = data.compareToPreviousPrice?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return {
        name: 'VIX',
        value: data.closePrice,
        change: `${sign}${data.compareToPreviousClosePrice.replace(/^[+-]/, '')}`,
        percent: `${sign}${data.fluctuationsRatio.replace(/^[+-]/, '')}%`,
        status,
    };
}

async function fetchUSDKRW(): Promise<any> {
    const url = 'https://api.stock.naver.com/marketindex/exchange/FX_USDKRW';
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver] HTTP ${res.status} – USD/KRW`);
    const data = await res.json();
    const info = data.exchangeInfo;

    const direction = info.fluctuationsType?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    return {
        name: 'USD/KRW',
        value: info.closePrice,
        change: `${sign}${info.fluctuations.replace(/^[+-]/, '')}`,
        percent: `${sign}${info.fluctuationsRatio.replace(/^[+-]/, '')}%`,
        status,
    };
}


async function fetchInvestorSupply(): Promise<any[]> {
    const url = 'https://m.stock.naver.com/api/index/KOSPI/trend';
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    const data = await res.json();
    const parse = (raw: string) => {
        const num = parseInt(raw.replace(/,/g, ''), 10);
        return { value: `${raw}억`, status: num > 0 ? 'up' : num < 0 ? 'down' : 'steady' };
    };
    return [
        { name: '개인', ...parse(data.personalValue) },
        { name: '외국인', ...parse(data.foreignValue) },
        { name: '기관', ...parse(data.institutionalValue) },
    ];
}

// ────────────────────────────────────────────
// 토스 증권 데이터 수집 (WTI, 채권 금리)
// ────────────────────────────────────────────

interface TossPriceResponse {
    result: {
        close: number;
        base: number;
        changeType: 'UP' | 'DOWN' | 'SAME';
    };
}

async function fetchTossIndex(id: string, displayName: string, isYield: boolean = false): Promise<any> {
    const url = `https://wts-info-api.tossinvest.com/api/v1/index-prices/${id}`;
    const res = await fetch(url, { headers: TOSS_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Toss] HTTP ${res.status} – ${id}`);
    const { result }: TossPriceResponse = await res.json();

    const diff = result.close - result.base;
    const change = Math.abs(diff);
    const percent = ((change / result.base) * 100).toFixed(2);
    const status = diff > 0 ? 'up' : diff < 0 ? 'down' : 'steady';
    const sign = status === 'up' ? '+' : status === 'down' ? '-' : '';

    return {
        name: displayName,
        value: isYield ? result.close.toFixed(3) : result.close.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        change: `${sign}${isYield ? change.toFixed(3) : change.toFixed(2)}`,
        percent: `${sign}${percent}%`,
        status,
        rawClose: result.close,
        rawChange: result.close - result.base
    };
}

/** 장단기 금리차 계산 */
function calculateSpread(long: any, short: any, displayName: string): any {
    const spread = long.rawClose - short.rawClose;
    const prevSpread = (long.rawClose - long.rawChange) - (short.rawClose - short.rawChange);
    const change = spread - prevSpread;
    const sign = change > 0 ? '+' : '';
    
    return {
        name: displayName,
        value: spread.toFixed(3),
        change: `${sign}${change.toFixed(3)}`,
        percent: '',
        status: spread >= 0 ? 'up' : 'down'
    };
}

function getKoreaTimeString(): string {
    const now = new Date();
    const korea = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    return korea.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) + ' KST';
}

export async function fetchNaverMarketData(): Promise<MarketData> {
    const [kospi, kosdaq, kospi200, usdkrw, supply, wti, us10y, us2y, kr10y, kr2y, vix] = await Promise.allSettled([
        fetchNaverIndex('KOSPI', 'KOSPI'),
        fetchNaverIndex('KOSDAQ', 'KOSDAQ'),
        fetchNaverIndex('KPI200', 'KOSPI 200'),
        fetchUSDKRW(),
        fetchInvestorSupply(),
        fetchTossIndex('RFU.CLv1', 'WTI 유가'),
        fetchTossIndex('ROB.US10YT-RR', '미국채 10년', true),
        fetchTossIndex('ROB.US2YT-RR', '미국채 2년', true),
        fetchTossIndex('KR1BENCH0010', '한국채 10년', true),
        fetchTossIndex('KR1BENCH0002', '한국채 2년', true),
        fetchVix(),
    ]);

    const indices: any[] = [];
    [kospi, kosdaq, kospi200, usdkrw, wti, us10y, us2y, kr10y, kr2y].forEach(r => {
        if (r.status === 'fulfilled') indices.push(r.value);
    });

    const yieldSpreads: any[] = [];
    if (us10y.status === 'fulfilled' && us2y.status === 'fulfilled') {
        yieldSpreads.push(calculateSpread(us10y.value, us2y.value, '미 장단기 금리차'));
    }
    if (kr10y.status === 'fulfilled' && kr2y.status === 'fulfilled') {
        yieldSpreads.push(calculateSpread(kr10y.value, kr2y.value, '한 장단기 금리차'));
    }

    return {
        indices,
        supply: supply.status === 'fulfilled' ? supply.value : [],
        yieldSpreads,
        vix: vix.status === 'fulfilled' ? vix.value : undefined,
        lastUpdated: `${getKoreaTimeString()} (네이버/토스 실시간)`,
    };
}

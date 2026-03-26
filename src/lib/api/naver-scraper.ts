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

// ────────────────────────────────────────────
// 네이버 해외 지수 데이터 수집 (나스닥, S&P 500 등)
// ────────────────────────────────────────────
async function fetchNaverWorldIndex(code: string, displayName: string): Promise<any> {
    const url = `https://api.stock.naver.com/index/${code}/basic`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver World] HTTP ${res.status} – ${code}`);
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


async function fetchNaverMarketIndex(category: string, code: string, displayName: string): Promise<any> {
    const url = `https://m.stock.naver.com/front-api/marketIndex/productDetail?category=${category}&reutersCode=${code}`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver Market] HTTP ${res.status} – ${code}`);
    const data = await res.json();
    const result = data.result;

    if (!result) throw new Error(`[Naver Market] No result data for ${code}`);

    const direction = result.fluctuationsType?.name ?? 'SAME';
    const isUp = direction === 'RISING' || direction === 'UPPER_LIMIT';
    const isDown = direction === 'FALLING' || direction === 'LOWER_LIMIT';
    const status = isUp ? 'up' : isDown ? 'down' : 'steady';
    const sign = isUp ? '+' : isDown ? '-' : '';

    // 환율 등 소수점이 필요한 경우를 위해 closePrice 그대로 사용 (1,508.00 형식)
    return {
        name: displayName,
        value: result.closePrice,
        change: `${sign}${result.fluctuations.replace(/^[+-]/, '')}`,
        percent: `${sign}${result.fluctuationsRatio.replace(/^[+-]/, '')}%`,
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
    // changeType이 아닌 실제 가격/금리 차이 기준(diff)으로 상승/하락 부호 결정
    const status = diff > 0 ? 'up' : diff < 0 ? 'down' : 'steady';
    const sign = status === 'up' ? '+' : status === 'down' ? '-' : '';

    // 채권 금리(isYield)일 경우 주식과 같은 퍼센트 등락률 계산을 생략
    const percentStr = isYield ? '' : `${sign}${((change / result.base) * 100).toFixed(2)}%`;

    return {
        name: displayName,
        value: isYield ? result.close.toFixed(3) : result.close.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        change: `${sign}${isYield ? change.toFixed(3) : change.toFixed(2)}`,
        percent: percentStr,
        status,
        rawClose: result.close,
        rawChange: diff
    };
}

async function fetchNaverBondYield(symbol: string, displayName: string): Promise<any> {
    const url = `https://stock.naver.com/api/securityService/economic/bond/${symbol}`;
    const res = await fetch(url, { headers: NAVER_HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error(`[Naver Bond] HTTP ${res.status} – ${symbol}`);
    const data = await res.json();

    const value = data.closePriceYield; // e.g. 4.344
    const diff = data.yieldChange;      // e.g. -0.048
    const percent = data.yieldChangePercent; // e.g. -1.0929

    const status = diff > 0 ? 'up' : diff < 0 ? 'down' : 'steady';
    const sign = status === 'up' ? '+' : status === 'down' ? '-' : '';

    return {
        name: displayName,
        value: value.toFixed(3),
        change: `${sign}${Math.abs(diff).toFixed(3)}`,
        percent: `${sign}${Math.abs(percent).toFixed(2)}%`,
        status,
        rawClose: value,
        rawChange: diff
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
    const [kospi, kosdaq, kospi200, nasdaq, sp500, usdkrw, supply, wti, gold, us10y, us2y, kr10y, kr2y, vix] = await Promise.allSettled([
        fetchNaverIndex('KOSPI', 'KOSPI'),
        fetchNaverIndex('KOSDAQ', 'KOSDAQ'),
        fetchNaverIndex('KPI200', 'KOSPI 200'),
        fetchNaverWorldIndex('.IXIC', '나스닥 지수'),
        fetchNaverWorldIndex('.INX', 'S&P 500'),
        fetchNaverMarketIndex('exchange', 'FX_USDKRW', 'USD/KRW'),
        fetchInvestorSupply(),
        fetchNaverMarketIndex('energy', 'CLcv1', 'WTI 유가'),
        fetchTossIndex('RFU.GCv1', '국제 금'),
        fetchNaverBondYield('US10YT=RR', '미국채 10년'),
        fetchNaverBondYield('US2YT=RR', '미국채 2년'),
        fetchNaverBondYield('KR10YT=RR', '한국채 10년'),
        fetchNaverBondYield('KR2YT=RR', '한국채 2년'),
        fetchVix(),
    ]);

    const indices: any[] = [];
    [kospi, kosdaq, kospi200, nasdaq, sp500, usdkrw, wti, gold, us10y, us2y, kr10y, kr2y].forEach(r => {
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

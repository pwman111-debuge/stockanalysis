
/**
 * KRX Intelligence - 통합 마켓 데이터 API
 * 네이버 증권에서 실시간 데이터를 수집하고 캐싱하여 제공합니다.
 * 캐시가 30분 이상 오래된 경우 자동으로 갱신합니다.
 */

import { fetchNaverMarketData } from './naver-scraper';

export interface MarketIndex {
    name: string;
    value: string;
    change: string;
    percent: string;
    status: 'up' | 'down' | 'steady';
}

export interface InvestorSupply {
    name: string;
    value: string;
    status: 'up' | 'down' | 'steady';
}

export interface MarketData {
    indices: MarketIndex[];
    supply: InvestorSupply[];
    yieldSpreads?: MarketIndex[];
    lastUpdated: string;
}

/** 캐시 TTL: 30분 */
const CACHE_TTL = 30 * 60 * 1000;

let cachedData: MarketData = {
    indices: [
        { name: 'KOSPI', value: '5,584.87', change: '+0.97', percent: '+0.02%', status: 'up' },
        { name: 'KOSDAQ', value: '1,154.67', change: '+38.26', percent: '+3.43%', status: 'up' },
        { name: 'KOSPI 200', value: '828.83', change: '-2.39', percent: '-0.29%', status: 'down' },
        { name: 'USD/KRW', value: '1,485.00', change: '+6.00', percent: '+0.41%', status: 'up' },
        { name: 'WTI 유가', value: '78.50', change: '+1.20', percent: '+1.55%', status: 'up' },
        { name: '미국채 10년', value: '4.250', change: '+0.015', percent: '+0.35%', status: 'up' },
        { name: '미국채 2년', value: '4.520', change: '-0.010', percent: '-0.22%', status: 'down' },
        { name: '한국채 10년', value: '3.380', change: '+0.005', percent: '+0.15%', status: 'up' },
        { name: '한국채 2년', value: '3.420', change: '0.000', percent: '0.00%', status: 'steady' },
    ],
    supply: [
        { name: '개인', value: '+29,488억', status: 'up' },
        { name: '외국인', value: '-19,418억', status: 'down' },
        { name: '기관', value: '-11,142억', status: 'down' },
    ],
    lastUpdated: '기본 데이터 (최초 실행 전)',
};
let cacheTimestamp = 0; // 0 = 캐시 없음 → 첫 요청 시 즉시 갱신

/**
 * 최신 마켓 데이터를 반환합니다.
 * 캐시가 TTL을 초과한 경우 네이버 증권에서 자동으로 갱신합니다.
 */
export async function getLatestMarketData(): Promise<MarketData> {
    const isStale = Date.now() - cacheTimestamp > CACHE_TTL;

    if (isStale) {
        try {
            console.log('[market-api] 캐시 만료 → 네이버 증권 데이터 수집 시작');
            const fresh = await fetchNaverMarketData();
            cachedData = fresh;
            cacheTimestamp = Date.now();
            console.log('[market-api] 데이터 갱신 완료:', fresh.lastUpdated);
        } catch (err) {
            console.error('[market-api] 실시간 수집 실패, 기존 캐시 사용:', err);
        }
    }

    return cachedData;
}

/**
 * 외부에서 캐시를 강제 업데이트할 때 사용합니다.
 * (수동 새로고침 API 등에서 호출)
 */
export function updateMarketCache(data: MarketData) {
    cachedData = data;
    cacheTimestamp = Date.now();
}

/** 현재 캐시 타임스탬프를 반환합니다. */
export function getCacheTimestamp(): number {
    return cacheTimestamp;
}

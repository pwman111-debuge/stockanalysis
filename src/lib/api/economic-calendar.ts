/**
 * KRX Intelligence - 경제 캘린더 데이터
 * 
 * 주요 경제 이벤트를 관리합니다.
 * 실제 운영 시에는 Investing.com 등에서 자동 수집 가능하지만,
 * 현재는 주요 정기 이벤트와 최근 예정 이벤트를 정적으로 관리합니다.
 */

export interface EconomicEvent {
    id: string;
    title: string;
    date: string;           // YYYY-MM-DD
    time?: string;          // HH:mm KST
    country: 'KR' | 'US' | 'EU' | 'JP' | 'CN';
    countryName: string;
    importance: 'high' | 'medium' | 'low';
    category: 'employment' | 'inflation' | 'interest_rate' | 'gdp' | 'trade' | 'manufacturing' | 'housing' | 'earnings' | 'other';
    categoryName: string;
    previous?: string;
    forecast?: string;
    actual?: string;
    description?: string;
}

const FLAG: Record<string, string> = {
    KR: '🇰🇷', US: '🇺🇸', EU: '🇪🇺', JP: '🇯🇵', CN: '🇨🇳',
};

/**
 * 경제 캘린더 이벤트 데이터
 * 날짜를 기준으로 자동 필터링됩니다.
 */
const events: EconomicEvent[] = [];

/**
 * 특정 기간의 경제 이벤트를 반환합니다.
 */
export function getEconomicEvents(options?: {
    from?: string;
    to?: string;
    country?: string;
    importance?: 'high' | 'medium' | 'low';
}): EconomicEvent[] {
    let filtered = [...events];

    if (options?.from) {
        filtered = filtered.filter(e => e.date >= options.from!);
    }
    if (options?.to) {
        filtered = filtered.filter(e => e.date <= options.to!);
    }
    if (options?.country) {
        filtered = filtered.filter(e => e.country === options.country);
    }
    if (options?.importance) {
        filtered = filtered.filter(e => e.importance === options.importance);
    }

    return filtered.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
}

/**
 * 다음 주요(High Importance) 이벤트를 반환합니다.
 */
export function getNextHighImpactEvent(): EconomicEvent | null {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const upcoming = events
        .filter(e => e.date >= today && e.importance === 'high')
        .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] ?? null;
}

/**
 * 국기 이모지를 반환합니다.
 */
export function getFlag(country: string): string {
    return FLAG[country] ?? '🌐';
}

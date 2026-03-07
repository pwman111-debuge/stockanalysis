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
const events: EconomicEvent[] = [
    // ── 2026년 3월
    {
        id: 'us-nonfarm-mar-2026',
        title: '미국 2월 비농업 고용지표 (NFP)',
        date: '2026-03-07',
        time: '22:30',
        country: 'US', countryName: '미국',
        importance: 'high',
        category: 'employment', categoryName: '고용',
        previous: '143K', forecast: '170K',
        description: '연준의 금리 정책에 가장 큰 영향을 미치는 고용 지표. 예상치 상회 시 긴축 우려 재부각 가능.',
    },
    {
        id: 'us-cpi-mar-2026',
        title: '미국 2월 소비자물가지수 (CPI)',
        date: '2026-03-12',
        time: '22:30',
        country: 'US', countryName: '미국',
        importance: 'high',
        category: 'inflation', categoryName: '물가',
        previous: '3.0%', forecast: '2.9%',
        description: '인플레이션 추이를 보여주는 핵심 지표. 둔화세 지속 여부가 금리 인하 기대에 핵심.',
    },
    {
        id: 'kr-bok-rate-mar-2026',
        title: '한국은행 기준금리 결정',
        date: '2026-03-13',
        time: '10:00',
        country: 'KR', countryName: '한국',
        importance: 'high',
        category: 'interest_rate', categoryName: '금리',
        previous: '3.00%', forecast: '3.00%',
        description: '한국은행 금통위 기준금리 결정. 동결 전망이 우세하나 환율 동향에 따른 서프라이즈 가능성.',
    },
    {
        id: 'us-fomc-mar-2026',
        title: 'FOMC 금리 결정 + 점도표',
        date: '2026-03-19',
        time: '03:00',
        country: 'US', countryName: '미국',
        importance: 'high',
        category: 'interest_rate', categoryName: '금리',
        previous: '5.25-5.50%', forecast: '5.25-5.50%',
        description: '연준 3월 FOMC. 점도표(Dot Plot)와 파월 의장 기자회견에서 금리 인하 시점에 대한 힌트 주목.',
    },
    {
        id: 'kr-trade-mar-2026',
        title: '한국 2월 수출입 동향',
        date: '2026-03-01',
        time: '09:00',
        country: 'KR', countryName: '한국',
        importance: 'medium',
        category: 'trade', categoryName: '무역',
        previous: '+18.4%', forecast: '+12.0%', actual: '+15.1%',
        description: '반도체 수출 호조 지속 여부 확인. 중국향 수출 회복세가 관건.',
    },
    {
        id: 'cn-pmi-mar-2026',
        title: '중국 3월 제조업 PMI',
        date: '2026-03-31',
        time: '10:00',
        country: 'CN', countryName: '중국',
        importance: 'medium',
        category: 'manufacturing', categoryName: '제조업',
        previous: '49.1', forecast: '50.0',
        description: '중국 제조업 경기 수축/확장 판단의 핵심 지표. 50 이상이면 경기 확장.',
    },
    {
        id: 'jp-boj-rate-mar-2026',
        title: '일본은행(BOJ) 금리 결정',
        date: '2026-03-14',
        time: '12:00',
        country: 'JP', countryName: '일본',
        importance: 'medium',
        category: 'interest_rate', categoryName: '금리',
        previous: '0.25%', forecast: '0.25%',
        description: '일본의 추가 금리 인상 여부. 엔/원 환율에 직접적 영향.',
    },
    {
        id: 'us-ppi-mar-2026',
        title: '미국 2월 생산자물가지수 (PPI)',
        date: '2026-03-13',
        time: '22:30',
        country: 'US', countryName: '미국',
        importance: 'medium',
        category: 'inflation', categoryName: '물가',
        previous: '0.3%', forecast: '0.1%',
        description: '기업 단의 물가 압력을 측정하는 선행 지표.',
    },
    {
        id: 'eu-ecb-rate-mar-2026',
        title: 'ECB 기준금리 결정',
        date: '2026-03-06',
        time: '21:15',
        country: 'EU', countryName: '유럽',
        importance: 'high',
        category: 'interest_rate', categoryName: '금리',
        previous: '4.50%', forecast: '4.25%', actual: '4.25%',
        description: '유럽중앙은행 금리 인하 단행. 글로벌 완화 기조 확산 기대.',
    },
];

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

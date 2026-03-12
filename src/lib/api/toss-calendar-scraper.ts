
/**
 * KRX Intelligence - 토스 증권 증시 캘린더 수집 모듈
 */

import { EconomicEvent } from './economic-calendar';

const TOSS_API_URL = 'https://wts-cert-api.tossinvest.com/api/v4/calendar/monthly';

const HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': 'https://www.tossinvest.com/calendar',
    'Origin': 'https://www.tossinvest.com'
};

interface TossEvent {
    id: {
        uniqueName: string;
        group: string;
    };
    view: {
        title: string;
        subtitle?: {
            text: string;
        };
        resourceUrl?: string;
        economicIndicatorValue?: {
            actual?: number;
            forecast?: number;
            unitPrefix?: string;
            time?: string;
        };
    };
    date: string;
    stockEarnings?: {
        companyName: string;
        eps?: number;
        salesDisplay?: string;
    };
}

/**
 * 토스 증권 API에서 특정 월의 데이터를 가져옵니다.
 */
async function fetchTossMonthlyData(yearMonth: string): Promise<TossEvent[]> {
    const url = `${TOSS_API_URL}/${yearMonth}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({}),
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`[Toss Scraper] API error status: ${res.status} for ${yearMonth}`);
            return [];
        }

        const data = await res.json();
        return data.result?.events || [];
    } catch (err) {
        console.error(`[Toss Scraper] Fetch error for ${yearMonth}:`, err);
        return [];
    }
}

/**
 * 토스 이벤트를 우리 앱의 EconomicEvent 형식으로 변환합니다.
 */
function mapTossEvent(toss: TossEvent): EconomicEvent {
    const group = toss.id.group;
    const title = toss.view.title;
    const date = toss.date;
    const subtitle = toss.view.subtitle?.text || '';

    let country: 'KR' | 'US' | 'EU' | 'JP' | 'CN' = 'KR';
    let countryName = '한국';
    
    // 아이콘 기반 국가 판별
    const icon = toss.view.resourceUrl || '';
    if (icon.includes('us')) {
        country = 'US'; countryName = '미국';
    } else if (icon.includes('eu')) {
        country = 'EU'; countryName = '유럽';
    } else if (icon.includes('jp')) {
        country = 'JP'; countryName = '일본';
    } else if (icon.includes('cn')) {
        country = 'CN'; countryName = '중국';
    } else if (group.startsWith('USD_')) {
        country = 'US'; countryName = '미국';
    }

    let category: EconomicEvent['category'] = 'other';
    let categoryName = '일반';

    if (group === 'ECONOMIC') {
        if (title.includes('고용') || title.includes('NFP')) {
            category = 'employment'; categoryName = '고용';
        } else if (title.includes('물가') || title.includes('CPI') || title.includes('PPI')) {
            category = 'inflation'; categoryName = '물가';
        } else if (title.includes('금리') || title.includes('FOMC') || title.includes('통화')) {
            category = 'interest_rate'; categoryName = '금리';
        } else if (title.includes('GDP')) {
            category = 'gdp'; categoryName = '성장률';
        } else if (title.includes('수출') || title.includes('무역')) {
            category = 'trade'; categoryName = '무역';
        } else if (title.includes('제조업')) {
            category = 'manufacturing'; categoryName = '제조업';
        }
    } else if (group.includes('EARNINGS')) {
        category = 'earnings';
        categoryName = '실적발표';
    } else if (group === 'HOLIDAY') {
        category = 'other';
        categoryName = '휴장일';
    }

    // 중요도 판별 (임의 기준: 경제 지표 및 실적 발표 여부)
    let importance: 'high' | 'medium' | 'low' = 'low';
    if (group === 'ECONOMIC' || group.includes('EARNINGS')) {
        importance = 'medium';
        if (title.includes('CPI') || title.includes('금리') || title.includes('고용') || title.includes('FOMC')) {
            importance = 'high';
        }
    }

    const ev: EconomicEvent = {
        id: toss.id.uniqueName || `toss-${group}-${date}-${title}`,
        title: group.includes('EARNINGS') && toss.stockEarnings ? `${toss.stockEarnings.companyName} 실적발표` : title,
        date: date,
        time: toss.view.economicIndicatorValue?.time?.substring(0, 5),
        country,
        countryName,
        importance,
        category,
        categoryName,
        previous: undefined, // 토스 API에서 이전/예상값은 좀 더 깊은 정보가 필요할 수 있음
        forecast: toss.view.economicIndicatorValue?.forecast?.toString(),
        actual: toss.view.economicIndicatorValue?.actual?.toString(),
        description: subtitle
    };

    return ev;
}

/**
 * 이번 달과 다음 달의 토스 캘린더 데이터를 가져옵니다.
 */
export async function fetchTossCalendarData(): Promise<EconomicEvent[]> {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // 다음 달 계산
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextYM = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    console.log(`[Toss Scraper] Fetching data for ${currentYM} and ${nextYM}`);

    const [currentEvents, nextEvents] = await Promise.all([
        fetchTossMonthlyData(currentYM),
        fetchTossMonthlyData(nextYM)
    ]);

    const allTossEvents = [...currentEvents, ...nextEvents];
    return allTossEvents.map(mapTossEvent);
}

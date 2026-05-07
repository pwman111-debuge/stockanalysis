export type CoupangProduct = {
  name: string;
  desc: string;
  url: string;
  htmlSnippet: string;
};

const COUPANG_LINKS: Record<string, CoupangProduct[]> = {
  투자서적: [
    {
      name: '현명한 투자자 (개정판 4판)',
      desc: '워런 버핏의 스승 벤저민 그레이엄, 가치투자 바이블',
      url: 'https://link.coupang.com/a/eEmrx5',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmsgI" target="_blank" referrerpolicy="unsafe-url"><img src="https://img2c.coupangcdn.com/image/affiliate/banner/0682be60f773ba4199bf15419e146fb1@2x.jpg" alt="현명한 투자자 (개정판 4판) / 사은품증정" width="120" height="240"></a>`,
    },
  ],
  차트분석서: [
    {
      name: '차트의 기술',
      desc: '한 권으로 끝내는 기술적 분석의 모든 것, 김정환 저',
      url: 'https://link.coupang.com/a/eEmyGk',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmzkI" target="_blank" referrerpolicy="unsafe-url"><img src="https://img5a.coupangcdn.com/image/affiliate/banner/0c7e4590625fd7b2a423077a58742f98@2x.jpg" alt="차트의 기술:한 권으로 끝내는 기술적 분석의 모든 것, 이레미디어, &lt;김정환&gt; 저" width="120" height="240"></a>`,
    },
  ],
  모니터: [
    {
      name: 'LG 27U411A 27인치 IPS 모니터',
      desc: '120Hz FHD 광시야각, HTS 듀얼 모니터로 호가창·차트 분리 배치',
      url: 'https://link.coupang.com/a/eEmDRX',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmFgU" target="_blank" referrerpolicy="unsafe-url"><img src="https://img3c.coupangcdn.com/image/affiliate/banner/4572961f79910664d313b95fea992987@2x.jpg" alt="LG모니터 27U411A 27인치 IPS광시야각 120Hz FHD 사무용 가정용 듀얼모니터" width="120" height="240"></a>`,
    },
  ],
  키보드: [
    {
      name: '로이체 무선 키보드 마우스 세트 RX-3100',
      desc: '장시간 트레이딩에 적합한 무선 키보드+마우스 세트',
      url: 'https://link.coupang.com/a/eEmHCR',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmIce" target="_blank" referrerpolicy="unsafe-url"><img src="https://img2c.coupangcdn.com/image/affiliate/banner/4885c720952e0a462fdd1b2ee9ad7218@2x.jpg" alt="로이체 무선 키보드 마우스 세트, RX-3100, 블랙, 일반형" width="120" height="240"></a>`,
    },
  ],
  의자: [
    {
      name: '사무용 인체공학 의자',
      desc: '장시간 트레이딩에 적합한 허리 지지·메쉬 통풍 사무용 의자',
      url: 'https://link.coupang.com/a/eEmKoi',
      htmlSnippet: `<iframe src="https://coupa.ng/cmLcfw" width="120" height="240" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics></iframe>`,
    },
  ],
  매매일지: [
    {
      name: '트레이딩 기록 노트 (매매일지 다이어리)',
      desc: '주식 투자 분석·복기 습관화, 종목별 진입가·손절가 기록',
      url: 'https://link.coupang.com/a/eEmNe3',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmN0e" target="_blank" referrerpolicy="unsafe-url"><img src="https://img1a.coupangcdn.com/image/affiliate/banner/2ce8c1e4aad0e546fb2a6508aaf55850@2x.jpg" alt="트레이딩 기록 노트 주식 투자 분석용 매매일지 다이어리, 1. 레더패턴 1권" width="120" height="240"></a>`,
    },
  ],
  재테크서적: [
    {
      name: '브라운스톤 3권 세트 (부의 본능·부의 인문학·투자의 정석)',
      desc: '20만부 베스트셀러 — 자본주의 본질과 부의 축적 원리',
      url: 'https://link.coupang.com/a/eEmQdH',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmReI" target="_blank" referrerpolicy="unsafe-url"><img src="https://img3c.coupangcdn.com/image/affiliate/banner/3afe9480ddebbc2c6d0f8bd8a247e414@2x.jpg" alt="브라운스톤(우석) 3권세트 - 부의 본능 (골드에디션) + 부의 인문학 (20만부 기념판) + 초보자를 위한 투자의 정석" width="120" height="240"></a>`,
    },
  ],
  스마트워치: [
    {
      name: 'DAICOO R6 통화가능 스마트워치',
      desc: 'GPS+블루투스 한글판, 실시간 시세 알림·뉴스 푸시 수신 가능',
      url: 'https://link.coupang.com/a/eEmTbg',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmT9Q" target="_blank" referrerpolicy="unsafe-url"><img src="https://image15.coupangcdn.com/image/affiliate/banner/75469f3ed8f4e006ef14b7b6fbc23ab3@2x.jpg" alt="DAICOO 통화가능 GPS 블루투스 스마트워치 대화면 한글판 R6" width="120" height="240"></a>`,
    },
  ],
  경제신문: [
    {
      name: '한경비즈니스 1년 정기구독',
      desc: '거시경제·산업 트렌드·FOMC·환율 심층 분석 주간지',
      url: 'https://link.coupang.com/a/eEmVIZ',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEmWqs" target="_blank" referrerpolicy="unsafe-url"><img src="https://img1c.coupangcdn.com/image/affiliate/banner/10594ce863e312062bd82f0f821dc1d8@2x.jpg" alt="주간잡지 한경비즈니스 1년 정기구독, 최신발행호" width="120" height="240"></a>`,
    },
  ],
  코인서적: [
    {
      name: '부의 자율주행: AI MONEY FLOW',
      desc: 'AI 시대 자금 흐름과 디지털 자산 트렌드를 짚는 투자 인사이트',
      url: 'https://link.coupang.com/a/eEm0HB',
      htmlSnippet: `<a href="https://link.coupang.com/a/eEm1sM" target="_blank" referrerpolicy="unsafe-url"><img src="https://image9.coupangcdn.com/image/affiliate/banner/d50a8e382beba8d60d6573241c4f4cab@2x.jpg" alt="부의 자율주행: AI MONEY FLOW [쁘띠수첩+책갈피]" width="120" height="240"></a>`,
    },
  ],
};

const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  투자서적: ['주식', '투자', '종목', '코스피', '코스닥', '장기투자', '가치투자', '버핏', '주주'],
  차트분석서: ['차트', '기술적분석', '캔들', '보조지표', 'rsi', 'macd', '이평선'],
  모니터: ['hts', '트레이딩', '데이트레이딩', '스캘핑'],
  코인서적: ['비트코인', '이더리움', '코인', '가상화폐', '암호화폐', '리플', 'btc', 'eth'],
  재테크서적: ['배당', 'etf', '펀드', '재테크', '포트폴리오', '연금', '퇴직'],
  경제신문: ['경제', '금리', '환율', '달러', 'fomc', '물가', 'cpi', 'ppi', '인플레이션', 'fed'],
  매매일지: ['매매', '복기', '투자일지'],
  스마트워치: [],
  키보드: [],
  의자: [],
};

const FALLBACK_CATEGORIES = ['투자서적', '재테크서적', '매매일지', '모니터'];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function pickCoupangProducts(seed: string, keywords: string[], limit = 2): CoupangProduct[] {
  const kw = keywords.join(' ').toLowerCase();
  const matched = Object.entries(CATEGORY_KEYWORD_MAP)
    .filter(([, kws]) => kws.some((k) => kw.includes(k)))
    .map(([cat]) => cat);
  const orderedCats = [...matched, ...FALLBACK_CATEGORIES.filter((c) => !matched.includes(c))];

  const candidates: CoupangProduct[] = [];
  const seenUrls = new Set<string>();
  for (const cat of orderedCats) {
    for (const p of COUPANG_LINKS[cat] ?? []) {
      if (seenUrls.has(p.url)) continue;
      candidates.push(p);
      seenUrls.add(p.url);
    }
  }
  if (candidates.length === 0) return [];

  const h = hashSeed(seed);
  const picked: CoupangProduct[] = [];
  const usedIdx = new Set<number>();
  for (let i = 0; picked.length < limit && picked.length < candidates.length; i++) {
    const idx = (h + i * 7919) % candidates.length;
    if (!usedIdx.has(idx)) {
      usedIdx.add(idx);
      picked.push(candidates[idx]);
    }
  }
  return picked;
}

import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { CoupangBanner } from '@/components/common/CoupangBanner';

export const metadata: Metadata = {
    title: '제네시스 모의 포트폴리오',
    description: '코스피200 ETF 50%와 규칙으로 고른 5종목으로 운용하는 월간 모의 포트폴리오의 구성과 운용 기준을 공개합니다.',
    alternates: { canonical: 'https://genesis-report.com/portfolio' },
};

export const dynamic = 'force-static';

interface Holding {
    role: string;
    name: string;
    code: string;
    weight: number;
    close: number;
    open: number | null;
    reason: string;
    reportUrl: string | null;
}

interface Portfolio {
    month: string;
    scoreDate: string;
    startDate: string;
    holdings: Holding[];
}

const RULES = [
    { label: '시작', text: '정해진 날의 시가에 모든 종목을 정해진 비중으로 담습니다.' },
    { label: '점검 주기', text: '매달 마지막 거래일 종가로 점수를 계산해 그날 저녁 명단을 교체하고 공개합니다. 성과는 다음 거래일 시가부터 계산합니다.' },
    { label: '비중 재조정', text: '명단 교체 때 코어 50%, 위성 각 10%로 되돌립니다. 달 중간에는 바꾸지 않습니다.' },
    { label: '멀티팩터 종목', text: '점수 15위 밖으로 밀리면 편출합니다. 후보 250종목 중 최근 1달 수익률 상위 10%(약 25위 안)에 들어도 편출합니다.' },
    { label: '주도산업 종목', text: '해당 산업의 사이클이 끝나거나 이익 전망 하향이 확정되면 편출합니다. 후보 250종목 중 최근 1달 수익률 상위 10%(약 25위 안)에 들어도 편출합니다.' },
    { label: '코어', text: '편출하지 않습니다.' },
    { label: '가격 기준 편출', text: '두지 않습니다. 종목별 비중을 10%로 제한해 위험을 나눕니다.' },
    { label: '사건 편출', text: '횡령·배임, 감사의견 거절, 관리종목 지정, 상장폐지 사유가 생기면 다음 거래일 시가에 편출하고, 다음 명단 교체 때까지 현금으로 둡니다.' },
    { label: '규칙 변경', text: '연 1회만 하며, 사유와 전후 성과를 공개합니다.' },
];

const FACTORS = ['낮은 PER', '낮은 PBR', '높은 ROE', '높은 배당수익률', '12-1개월 모멘텀', '낮은 변동성'];

interface PortfolioEvent {
    date: string;
    type: string;
    detail: string;
}

function loadEvents(): PortfolioEvent[] {
    const file = path.join(process.cwd(), 'public/charts/portfolio/events.json');
    return (JSON.parse(fs.readFileSync(file, 'utf8')) as PortfolioEvent[]).sort((a, b) => b.date.localeCompare(a.date));
}

function loadPortfolio(): Portfolio {
    const dir = path.join(process.cwd(), 'public/charts/portfolio');
    const latest = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort().pop();
    return JSON.parse(fs.readFileSync(path.join(dir, latest as string), 'utf8')) as Portfolio;
}

export default function PortfolioPage() {
    const portfolio = loadPortfolio();
    const events = loadEvents();
    const [year, month] = portfolio.month.split('-').map(Number);
    const hasOpen = portfolio.holdings.every((h) => h.open !== null);

    return (
        <div className="space-y-8 pb-20">
            <section className="rounded-3xl bg-slate-900 p-8 text-white md:p-10">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-primary p-2">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-slate-300 uppercase">Model Portfolio</span>
                </div>
                <h1 className="mb-3 text-4xl font-extrabold tracking-tight">제네시스 모의 포트폴리오</h1>
                <p className="max-w-2xl text-lg text-slate-300">
                    코스피200 ETF 50%에 규칙으로 고른 5종목을 더한 월간 모의 포트폴리오입니다. 실제 자금을 운용하지 않으며, 투자 권유가 아닙니다.
                </p>
            </section>

            <section>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-bold">{year}년 {month}월 구성</h2>
                    <p className="text-sm text-muted-foreground">점수 기준일 {portfolio.scoreDate}, 시작 {portfolio.startDate} 시가</p>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-muted-foreground">
                                <th className="px-4 py-3 font-medium">구분</th>
                                <th className="px-4 py-3 font-medium">종목</th>
                                <th className="px-4 py-3 text-right font-medium">비중</th>
                                <th className="px-4 py-3 text-right font-medium">{hasOpen ? '시작 시가' : '점수일 종가'}</th>
                                <th className="px-4 py-3 font-medium">편입 이유</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.holdings.map((h) => (
                                <tr key={h.code} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{h.role}</td>
                                    <td className="px-4 py-3 font-bold whitespace-nowrap">
                                        {h.reportUrl ? <Link href={h.reportUrl} className="text-primary hover:underline">{h.name}</Link> : h.name}
                                        <span className="ml-2 text-xs font-medium text-muted-foreground">{h.code}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">{h.weight}%</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{(hasOpen ? h.open as number : h.close).toLocaleString('ko-KR')}원</td>
                                    <td className="px-4 py-3 text-muted-foreground">{h.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-lg font-bold">변경 내역</h2>
                {events.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                        <table className="w-full min-w-[480px] text-sm">
                            <tbody>
                                {events.map((e) => (
                                    <tr key={`${e.date}-${e.detail}`} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{e.date}</td>
                                        <td className="px-4 py-3 font-bold whitespace-nowrap">{e.type}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{e.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">아직 변경 내역이 없습니다.</p>
                )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold">종목을 고르는 방법</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    코스피 시가총액 상위 200종목과 코스닥 상위 50종목을 같은 규칙으로 평가합니다. 사람이 종목을 고르지 않습니다.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                    {FACTORS.map((f) => (
                        <li key={f} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium">{f}</li>
                    ))}
                </ul>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                    <li>여섯 항목의 순위를 같은 비중으로 합산합니다. PER과 PBR은 시장 전체 순위와 산업 내 순위의 평균을 씁니다.</li>
                    <li>최근 1달 수익률 상위 10% 종목은 제외합니다.</li>
                    <li>같은 업종은 최대 2종목, 코스닥은 최대 2종목입니다.</li>
                    <li>멀티팩터 4종목은 점수 순으로, 주도산업 1종목은 사이클이 진행 중인 산업의 점수 1위로 정합니다.</li>
                </ul>
            </section>

            <section>
                <h2 className="mb-3 text-lg font-bold">운용 기준</h2>
                <dl className="divide-y divide-border rounded-2xl border border-border bg-card">
                    {RULES.map((r) => (
                        <div key={r.label} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[9rem_1fr] sm:gap-4">
                            <dt className="font-bold">{r.label}</dt>
                            <dd className="leading-relaxed text-muted-foreground">{r.text}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <CoupangBanner seed={`portfolio-${portfolio.month}`} variant="bottom" />

            <p className="text-sm leading-relaxed text-muted-foreground">
                이 페이지는 규칙에 따른 모의 운용 기록을 공개하는 정보이며, 투자 권유나 개별 투자 상담이 아닙니다. 개별 종목에 대한 질문에는 답변하지 않습니다.
                운영자는 공개한 다음 거래일 이후에만 본인 매매를 합니다. 모의 결과는 실제 수익을 보장하지 않으며, 투자 판단과 책임은 투자자 본인에게 있습니다.
            </p>
        </div>
    );
}

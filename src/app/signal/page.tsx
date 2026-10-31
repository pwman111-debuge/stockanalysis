import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { Gauge } from 'lucide-react';
import { CoupangBanner } from '@/components/common/CoupangBanner';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: '시장 신호등',
    description: '코스피 4막 위치와 수급·금리·환율·신용시장 상태를 매일 한 화면에 정리합니다.',
    alternates: { canonical: 'https://genesis-report.com/signal' },
};

export const dynamic = 'force-static';

type Light = 'g' | 'y' | 'r';

interface SignalItem {
    key: string;
    title: string;
    light: Light | null;
    state: string;
    detail: string;
    levels?: { label: string; value: number }[];
    asof: string;
}

interface SignalDay {
    date: string;
    kospi: number;
    act: {
        code: string;
        name: string;
        desc: string;
        light: Light;
        fromPeak: number;
        firstLow?: number;
        firstLowDate?: string;
        fromFirstLow?: number;
        history: { up250: number; episodes: number } | null;
    };
    items: SignalItem[];
    count: Record<Light, number>;
}

const LIGHTS: Record<Light, { label: string; dot: string; text: string }> = {
    g: { label: '양호', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    y: { label: '주의', dot: 'bg-amber-400', text: 'text-amber-700' },
    r: { label: '경계', dot: 'bg-red-500', text: 'text-red-700' },
};

const STAGES = [
    { code: '1', label: '1막 매집' },
    { code: '2', label: '2막 손바뀜' },
    { code: '3', label: '3막 과열' },
    { code: '4-1', label: '4-1 버티기' },
    { code: '4-2', label: '4-2 투매' },
    { code: '4-3', label: '4-3 안도 반등' },
    { code: '4-4', label: '4-4 바닥 다지기' },
];

function loadDays(): SignalDay[] {
    const dir = path.join(process.cwd(), 'public/charts/signal');
    return fs.readdirSync(dir)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .sort()
        .reverse()
        .slice(0, 20)
        .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as SignalDay);
}

function LightDot({ light }: { light: Light | null }) {
    if (!light) return <span className="text-xs font-bold text-muted-foreground">참고</span>;
    const l = LIGHTS[light];
    return (
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold', l.text)}>
            <span className={cn('h-2.5 w-2.5 rounded-full', l.dot)} />
            {l.label}
        </span>
    );
}

export default function SignalPage() {
    const days = loadDays();
    const today = days[0];
    const { act } = today;
    const stageCode = act.code === '3!' ? '3' : act.code;

    return (
        <div className="space-y-8 pb-20">
            <section className="rounded-3xl bg-slate-900 p-8 text-white md:p-10">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-primary p-2">
                        <Gauge className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-slate-300 uppercase">Market Signal</span>
                </div>
                <h1 className="mb-3 text-4xl font-extrabold tracking-tight">시장 신호등</h1>
                <p className="text-lg text-slate-300">
                    {today.date} 종가 기준, 코스피 {today.kospi.toLocaleString('ko-KR')}
                </p>
                <div className="mt-6 flex flex-wrap gap-6">
                    {(Object.keys(LIGHTS) as Light[]).map((k) => (
                        <div key={k} className="flex items-center gap-2 text-sm">
                            <span className={cn('h-3 w-3 rounded-full', LIGHTS[k].dot)} />
                            <span className="text-slate-300">{LIGHTS[k].label}</span>
                            <span className="font-bold">{today.count[k]}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-muted-foreground">4막 위치</h2>
                    <LightDot light={act.light} />
                </div>
                <p className="mt-2 text-3xl font-black tracking-tight">{act.name}</p>
                <p className="mt-2 text-muted-foreground">{act.desc}</p>

                <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {STAGES.map((s) => (
                        <li
                            key={s.code}
                            aria-current={s.code === stageCode ? 'step' : undefined}
                            className={cn(
                                'rounded-lg border px-2 py-2 text-center text-xs font-bold',
                                s.code === stageCode
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border text-muted-foreground'
                            )}
                        >
                            {s.label}
                        </li>
                    ))}
                </ol>

                <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
                    <div>
                        <dt className="text-muted-foreground">고점 대비</dt>
                        <dd className="text-lg font-bold">{act.fromPeak.toFixed(1)}%</dd>
                    </div>
                    {act.firstLow && act.fromFirstLow !== undefined && (
                        <div>
                            <dt className="text-muted-foreground">1차 저점 {act.firstLow.toLocaleString('ko-KR')} 대비</dt>
                            <dd className="text-lg font-bold">{act.fromFirstLow > 0 ? '+' : ''}{act.fromFirstLow.toFixed(1)}%</dd>
                        </div>
                    )}
                    {act.history && (
                        <div>
                            <dt className="text-muted-foreground">과거 이 구간 250거래일 뒤 상승 비율</dt>
                            <dd className="text-lg font-bold">{act.history.up250}% <span className="text-xs font-medium text-muted-foreground">({act.history.episodes}개 구간)</span></dd>
                        </div>
                    )}
                </dl>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {today.items.map((item) => (
                    <article key={item.key} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-sm font-bold text-muted-foreground">{item.title}</h2>
                            <LightDot light={item.light} />
                        </div>
                        <p className="mt-2 text-xl font-black tracking-tight">{item.state}</p>
                        {item.levels && (
                            <dl className="mt-3 space-y-1 text-sm">
                                {item.levels.map((level) => (
                                    <div key={level.label} className="flex justify-between">
                                        <dt className="text-muted-foreground">{level.label}</dt>
                                        <dd className="font-bold tabular-nums">{level.value.toLocaleString('ko-KR')}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        <p className="mt-2 flex-grow text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                        <p className="mt-3 text-xs text-muted-foreground">기준일 {item.asof}</p>
                    </article>
                ))}
            </section>

            <CoupangBanner seed={`signal-${today.date}`} variant="bottom" />

            {days.length > 1 && (
                <section>
                    <h2 className="mb-3 text-lg font-bold">최근 기록</h2>
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">날짜</th>
                                    <th className="px-4 py-3 text-right font-medium">코스피</th>
                                    <th className="px-4 py-3 font-medium">4막 위치</th>
                                    <th className="px-4 py-3 text-right font-medium">양호·주의·경계</th>
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((d) => (
                                    <tr key={d.date} className="border-b border-border last:border-0">
                                        <td className="px-4 py-3 whitespace-nowrap">{d.date}</td>
                                        <td className="px-4 py-3 text-right tabular-nums">{d.kospi.toLocaleString('ko-KR')}</td>
                                        <td className="px-4 py-3">{d.act.name}</td>
                                        <td className="px-4 py-3 text-right tabular-nums">{d.count.g}·{d.count.y}·{d.count.r}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <p className="text-sm leading-relaxed text-muted-foreground">
                시장 신호등은 시장의 위치와 상태를 보여주는 정보이며, 투자 권유가 아닙니다. 색은 항목별 기준에 따른 상태 표시이고, 과거 통계는 미래 수익을 보장하지 않습니다.
                미국 시장과 신용 지표는 발표 시차가 있어 기준일이 다를 수 있습니다.
            </p>
        </div>
    );
}

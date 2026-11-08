// 코스피 종가 위에 4막 구간을 색 띠로 칠한 차트 — scripts/signal_acts_chart.py 가 만든 acts.json 을 그린다.
// 서버 컴포넌트(정적 SVG)라 클라이언트 JS가 필요 없다. 가로는 거래일 간격이다.

export interface ActsData {
    asof: string;
    dates: string[];
    close: number[];
    segments: { code: string; start: string; end: string; days: number; calDays: number }[];
}

const STAGE: Record<string, { name: string; short: string; fill: string; text: string }> = {
    '1': { name: '1막 매집', short: '1막', fill: '#10b981', text: '#047857' },
    '2': { name: '2막 손바뀜', short: '2막', fill: '#eab308', text: '#a16207' },
    '3': { name: '3막 과열', short: '3막', fill: '#f97316', text: '#c2410c' },
    '4-1': { name: '4-1 버티기', short: '4-1', fill: '#ef4444', text: '#b91c1c' },
    '4-2': { name: '4-2 투매', short: '4-2', fill: '#a855f7', text: '#7e22ce' },
    '4-3': { name: '4-3 안도 반등', short: '4-3', fill: '#3b82f6', text: '#1d4ed8' },
    '4-4': { name: '4-4 바닥 다지기', short: '4-4', fill: '#0ea5e9', text: '#0369a1' },
    x: { name: '일시 하락(4막 미진행)', short: '일시 하락', fill: '#94a3b8', text: '#475569' },
    '—': { name: '구분 없음', short: '—', fill: '#94a3b8', text: '#475569' },
};
const info = (code: string) => STAGE[code] ?? STAGE['—'];

const W = 800, H = 320, PL = 8, PR = 56, PT = 34, PB = 26;

export function ActsChart({ data }: { data: ActsData }) {
    const { dates, close } = data;
    // 4-1로 들어갔어도 4-2(투매)로 이어지지 않고 회복한 구간은 4막이 아니라 일시 하락으로 따로 표시한다
    const segments = data.segments.map((s, k, arr) => {
        const next = arr[k + 1];
        return s.code === '4-1' && next && !next.code.startsWith('4') ? { ...s, code: 'x' } : s;
    });
    const n = dates.length;
    const lo0 = Math.min(...close), hi0 = Math.max(...close);
    const pad = (hi0 - lo0) * 0.06;
    const lo = lo0 - pad, hi = hi0 + pad;
    const step = (W - PL - PR) / n;
    const x = (i: number) => PL + (i + 0.5) * step;
    const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
    const idx = (d: string) => dates.indexOf(d);

    const path = close.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    const grid = [0, 1, 2, 3, 4].map((k) => lo + ((hi - lo) * (k + 0.5)) / 5);

    const ticks: { i: number; label: string }[] = [];
    let prev = '';
    dates.forEach((d, i) => {
        const m = d.slice(0, 7);
        if (m !== prev) {
            prev = m;
            if (Number(m.slice(5)) % 2 === 1 && i * step > 24) ticks.push({ i, label: `${m.slice(2, 4)}/${m.slice(5)}` });
        }
    });

    const peakI = close.indexOf(hi0);
    const last = n - 1;
    const cur = segments[segments.length - 1];

    return (
        <figure className="mt-6">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img"
                aria-label={`코스피 종가와 4막 구간. 현재 ${info(cur.code).name}, ${cur.start}부터`}>
                {grid.map((v) => (
                    <g key={v}>
                        <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke="#e2e8f0" />
                        <text x={W - PR + 6} y={y(v) + 4} fontSize="11" fill="#64748b">{Math.round(v).toLocaleString('ko-KR')}</text>
                    </g>
                ))}

                {segments.map((s) => {
                    const a = idx(s.start), b = idx(s.end);
                    const x0 = PL + a * step, w = (b - a + 1) * step;
                    const st = info(s.code);
                    return (
                        <g key={s.start}>
                            <rect x={x0} y={PT - 8} width={w} height={H - PT - PB + 8} fill={st.fill} opacity={0.16} />
                            <rect x={x0} y={PT - 8} width={w} height={4} fill={st.fill} />
                            <line x1={x0} x2={x0} y1={PT - 8} y2={H - PB} stroke={st.fill} strokeOpacity={0.5} strokeDasharray="3 3" />
                            <text x={x0 + w / 2} y={PT - 14} fontSize="12" fontWeight="700" fill={st.text} textAnchor="middle">
                                {st.short}
                            </text>
                        </g>
                    );
                })}

                {ticks.map((t) => (
                    <text key={t.i} x={x(t.i)} y={H - 8} fontSize="11" fill="#64748b" textAnchor="middle">{t.label}</text>
                ))}

                <path d={path} fill="none" stroke="#0f172a" strokeWidth={1.8} strokeLinejoin="round" />

                <circle cx={x(peakI)} cy={y(hi0)} r={3.5} fill="#0f172a" />
                <text x={x(peakI) + 6} y={y(hi0) - 6} fontSize="11" fontWeight="700" fill="#0f172a">
                    고점 {Math.round(hi0).toLocaleString('ko-KR')}
                </text>
                <circle cx={x(last)} cy={y(close[last])} r={4} fill={info(cur.code).fill} stroke="#fff" strokeWidth={1.5} />
                <text x={x(last) - 6} y={y(close[last]) + 18} fontSize="11" fontWeight="700" fill="#0f172a" textAnchor="end">
                    {Math.round(close[last]).toLocaleString('ko-KR')}
                </text>
            </svg>

            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {segments.map((s, k) => {
                    const st = info(s.code);
                    const now = k === segments.length - 1;
                    return (
                        <li key={s.start} className="flex items-center gap-2">
                            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: st.fill }} />
                            <span className={now ? 'font-bold' : 'font-medium'}>{st.name}</span>
                            <span className="text-muted-foreground tabular-nums">
                                {s.start.slice(2).replace(/-/g, '.')} ~ {now ? '현재' : s.end.slice(2).replace(/-/g, '.')} · {s.calDays}일
                            </span>
                        </li>
                    );
                })}
            </ul>
            <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {data.asof} 종가 기준. 막은 그날까지 알 수 있는 외국인·개인 수급, 신용잔고, 고점 대비 낙폭으로 판정하며,
                며칠씩 깜빡이는 구간은 앞 구간에 합쳐 표시합니다. 3막은 경보 구간을 포함하고, 회색은 고점 대비 -15%까지 빠졌다가 4막으로 이어지지 않고 회복한 구간입니다.
            </figcaption>
        </figure>
    );
}

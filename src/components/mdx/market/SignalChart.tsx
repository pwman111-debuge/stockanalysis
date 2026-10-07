"use client";

// 차트 신호 캔들 차트 — scripts/market_brief.py 가 만든 public/charts/market/*.json 을 읽어 그린다.
// 규칙은 주도섹터 chart_signal.py 와 동일: 파란 박스=매수 구간(눌림→반등), 보라 박스=과열 구간(과열→꺾임).
import { useEffect, useMemo, useRef, useState } from "react";

interface Signal { kind: "B" | "S"; start: number; fire: number; date: string; price: number }
interface ChartData {
    code: string; name: string; asof: string; dates: string[];
    open: number[]; high: number[]; low: number[]; close: number[];
    ma5: (number | null)[]; ma20: (number | null)[]; ma120: (number | null)[];
    bbUp: (number | null)[]; bbDn: (number | null)[];
    macdHist: (number | null)[]; rsi7: (number | null)[];
    signals: Signal[]; state: string; label: string;
}

const C = {
    up: "#e03131", dn: "#1c7ed6", ma5: "#f59f00", ma20: "#2f9e44", ma120: "#343a40",
    buy: "#1971c2", sell: "#9333ea", band: "#fab005", grid: "#e9ecef", txt: "#64748b",
};
const STATE_STYLE: Record<string, string> = {
    buy_fire: "bg-blue-600 text-white", buy_arm: "bg-blue-100 text-blue-800",
    sell_fire: "bg-purple-600 text-white", sell_arm: "bg-purple-100 text-purple-800",
    none: "bg-slate-100 text-slate-700",
};

const PL = 6, PR = 62;   // 가로폭 W는 컨테이너 실측(글자 크기가 화면과 1:1)
const H_PRICE = 300, H_GAP = 14, H_SUB = 64, H_AXIS = 22;
const Y_MACD = H_PRICE + H_GAP, Y_RSI = Y_MACD + H_SUB + H_GAP;
const H = Y_RSI + H_SUB + H_AXIS;

const fmt = (v: number | null | undefined, d = 2) =>
    v == null ? "—" : v.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });

export function SignalChart({ src, title }: { src: string; title?: string }) {
    const [data, setData] = useState<ChartData | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [days, setDays] = useState(250);
    const [hover, setHover] = useState<number | null>(null);
    const [W, setW] = useState(800);
    const svgRef = useRef<SVGSVGElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    // 컨테이너 폭에 맞춰 다시 그린다 — 폰에서 800폭을 축소하면 글자가 5px로 깨진다
    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const fit = () => setW(Math.max(320, Math.round(el.clientWidth)));
        fit();
        if (el.clientWidth < 560) setDays(125);
        const ro = new ResizeObserver(fit);
        ro.observe(el);
        return () => ro.disconnect();
    }, [data]);

    useEffect(() => {
        fetch(src).then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            return r.json();
        }).then(setData).catch((e) => setErr(`차트 데이터를 불러오지 못했습니다 (${e.message})`));
    }, [src]);

    const view = useMemo(() => {
        if (!data) return null;
        const n = data.dates.length;
        const off = Math.max(0, n - days);
        const len = n - off;
        const step = (W - PL - PR) / len;
        const x = (i: number) => PL + (i - off + 0.5) * step;

        let lo = Infinity, hi = -Infinity;
        for (let i = off; i < n; i++) {
            for (const v of [data.low[i], data.high[i], data.bbDn[i], data.bbUp[i], data.ma120[i]]) {
                if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
            }
        }
        const rng = hi - lo;
        lo -= rng * 0.12; hi += rng * 0.16;
        const y = (v: number) => 8 + (1 - (v - lo) / (hi - lo)) * (H_PRICE - 16);

        const line = (arr: (number | null)[]) => {
            let d = "", pen = false;
            for (let i = off; i < n; i++) {
                const v = arr[i];
                if (v == null) { pen = false; continue; }
                d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
                pen = true;
            }
            return d;
        };
        let band = "";
        const idx = [...Array(len).keys()].map((k) => k + off).filter((i) => data.bbUp[i] != null && data.bbDn[i] != null);
        if (idx.length) {
            band = idx.map((i, k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(data.bbUp[i]!).toFixed(1)}`).join("")
                + [...idx].reverse().map((i) => `L${x(i).toFixed(1)},${y(data.bbDn[i]!).toFixed(1)}`).join("") + "Z";
        }

        let mMax = 0;
        for (let i = off; i < n; i++) mMax = Math.max(mMax, Math.abs(data.macdHist[i] ?? 0));
        const yM = (v: number) => Y_MACD + H_SUB / 2 - (v / (mMax || 1)) * (H_SUB / 2 - 4);
        const yR = (v: number) => Y_RSI + 4 + (1 - v / 100) * (H_SUB - 8);

        const ticks: { i: number; label: string }[] = [];
        let prev = "";
        for (let i = off; i < n; i++) {
            const m = data.dates[i].slice(0, 7);
            if (m !== prev) {
                const mm = Number(m.slice(5));
                // 첫 눈금이 잘린 달이면 다음 눈금과 겹치므로 버린다
                if (ticks.length === 1 && i - ticks[0].i < 12) ticks.pop();
                ticks.push({ i, label: ticks.length === 0 || mm === 1 ? `${m.slice(2, 4)}/${m.slice(5)}` : `${mm}월` });
                prev = m;
            }
        }
        const pTicks = [...Array(5).keys()].map((k) => lo + ((hi - lo) * (k + 0.5)) / 5);
        const sigs = data.signals.filter((s) => s.fire >= off);
        return { off, n, len, step, x, y, yM, yR, line, band, ticks, pTicks, sigs };
    }, [data, days, W]);

    if (err) return <div className="my-6 rounded-xl border border-border p-6 text-sm text-muted-foreground">{err}</div>;
    if (!data || !view) return <div className="my-6 h-[420px] animate-pulse rounded-xl border border-border bg-muted/40" />;

    const { off, n, step, x, y, yM, yR, line, band, ticks, pTicks, sigs } = view;
    const last = n - 1;
    const hi = hover ?? last;
    const cw = Math.max(1, step * 0.66);

    const onMove = (e: React.PointerEvent<SVGRectElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * W;
        const i = Math.round((px - PL) / step - 0.5) + off;
        setHover(Math.min(last, Math.max(off, i)));
    };
    const chg = hi > 0 ? (data.close[hi] / data.close[hi - 1] - 1) * 100 : 0;
    // 지수는 소수 둘째 자리, 개별 종목(원 단위 정수 시세)은 소수점 없이
    const dp = data.close.every((v) => Number.isInteger(v)) ? 0 : 2;

    return (
        <figure className="not-prose my-6 rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{title ?? `${data.name} 차트 신호`}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATE_STYLE[data.state] ?? STATE_STYLE.none}`}>
                        지금: {data.label}
                    </span>
                </div>
                <div className="flex rounded-lg border border-border p-0.5 text-xs">
                    {[[125, "6개월"], [250, "1년"]].map(([d, l]) => (
                        <button key={d} onClick={() => setDays(d as number)}
                            className={`rounded-md px-3 py-1 font-semibold transition-colors ${days === d ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-800"}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* 호버 정보 줄 — 고정 위치라 모바일에서도 가리지 않는다 */}
            <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-slate-600">
                <span className="font-semibold text-slate-800">{data.dates[hi]}</span>
                <span>종가 <b className={chg >= 0 ? "text-rose-600" : "text-blue-600"}>{fmt(data.close[hi], dp)} ({chg >= 0 ? "+" : ""}{chg.toFixed(2)}%)</b></span>
                <span>고 {fmt(data.high[hi], dp)} · 저 {fmt(data.low[hi], dp)}</span>
                <span style={{ color: C.ma20 }}>20일선 {fmt(data.ma20[hi], dp)}</span>
                <span style={{ color: C.ma120 }}>120일선 {fmt(data.ma120[hi], dp)}</span>
                <span>RSI(7) {fmt(data.rsi7[hi], 0)}</span>
            </div>

            <div ref={boxRef} className="w-full">
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none touch-pan-y" role="img"
                aria-label={`${data.name} 1년 일봉 차트와 매수·매도 신호 구간`}>
                {/* 가격 격자 */}
                {pTicks.map((v) => (
                    <g key={v}>
                        <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke={C.grid} />
                        <text x={W - PR + 6} y={y(v) + 4} fontSize="11" fill={C.txt}>{fmt(v, 0)}</text>
                    </g>
                ))}
                {ticks.map((t) => (
                    <g key={t.i}>
                        <line x1={x(t.i)} x2={x(t.i)} y1={0} y2={H - H_AXIS} stroke={C.grid} strokeDasharray="2 3" />
                        <text x={Math.max(PL + 16, x(t.i))} y={H - 6} fontSize="11" fill={C.txt} textAnchor="middle">{t.label}</text>
                    </g>
                ))}

                {/* 볼린저 밴드 */}
                <path d={band} fill={C.band} opacity={0.1} />

                {/* 신호 박스 */}
                {sigs.map((s) => {
                    const a = Math.max(s.start, off), b = s.fire;
                    let lo = Infinity, hiP = -Infinity;
                    for (let i = a; i <= b; i++) { lo = Math.min(lo, data.low[i]); hiP = Math.max(hiP, data.high[i]); }
                    const buy = s.kind === "B", col = buy ? C.buy : C.sell;
                    const x0 = x(a) - step / 2, x1 = x(b) + step / 2;
                    const y0 = y(hiP) - 4, y1 = y(lo) + 4;
                    const my = buy ? y1 + 9 : y0 - 9;
                    const tri = buy
                        ? `M${x(b)},${my - 6}L${x(b) - 6},${my + 5}L${x(b) + 6},${my + 5}Z`
                        : `M${x(b)},${my + 6}L${x(b) - 6},${my - 5}L${x(b) + 6},${my - 5}Z`;
                    return (
                        <g key={s.date + s.kind}>
                            <rect x={x0} y={y0} width={Math.max(x1 - x0, 4)} height={y1 - y0} rx={3}
                                fill={col} fillOpacity={0.13} stroke={col} strokeWidth={1.4} />
                            <path d={tri} fill={col} stroke="#fff" strokeWidth={1} />
                            <text x={Math.min(W - PR - 34, Math.max(PL + 34, x(b)))} y={buy ? my + 20 : my - 11} fontSize="11.5" fontWeight="700" fill={col} textAnchor="middle"
                                paintOrder="stroke" stroke="#fff" strokeWidth={3}>
                                {buy ? "매수" : "매도"} {s.date.slice(5).replace("-", "/")}
                            </text>
                        </g>
                    );
                })}

                {/* 캔들 */}
                {[...Array(n - off).keys()].map((k) => {
                    const i = k + off, o = data.open[i], c = data.close[i];
                    const col = c >= o ? C.up : C.dn;
                    const top = y(Math.max(o, c)), h = Math.max(1, Math.abs(y(o) - y(c)));
                    return (
                        <g key={i}>
                            <line x1={x(i)} x2={x(i)} y1={y(data.high[i])} y2={y(data.low[i])} stroke={col} strokeWidth={0.9} />
                            <rect x={x(i) - cw / 2} y={top} width={cw} height={h} fill={col} />
                        </g>
                    );
                })}

                {/* 이동평균 */}
                <path d={line(data.ma5)} fill="none" stroke={C.ma5} strokeWidth={1.1} opacity={0.8} />
                <path d={line(data.ma20)} fill="none" stroke={C.ma20} strokeWidth={1.8} />
                <path d={line(data.ma120)} fill="none" stroke={C.ma120} strokeWidth={2} />

                {/* 마지막 종가 태그 */}
                <line x1={PL} x2={W - PR} y1={y(data.close[last])} y2={y(data.close[last])} stroke={C.up} strokeDasharray="2 3" opacity={0.7} />
                <rect x={W - PR + 2} y={y(data.close[last]) - 10} width={PR - 4} height={20} rx={4} fill={C.up} />
                <text x={W - PR / 2} y={y(data.close[last]) + 4} fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle">
                    {fmt(data.close[last], 0)}
                </text>

                {/* MACD 막대 */}
                <text x={PL + 2} y={Y_MACD + 11} fontSize="11" fontWeight="600" fill={C.txt}>MACD 막대 (방향 전환)</text>
                <line x1={PL} x2={W - PR} y1={yM(0)} y2={yM(0)} stroke="#adb5bd" />
                {[...Array(n - off).keys()].map((k) => {
                    const i = k + off, v = data.macdHist[i];
                    if (v == null) return null;
                    return <rect key={i} x={x(i) - cw / 2} y={Math.min(yM(v), yM(0))} width={cw}
                        height={Math.max(0.5, Math.abs(yM(v) - yM(0)))} fill={v >= 0 ? C.up : C.dn} opacity={0.6} />;
                })}

                {/* RSI(7) */}
                <text x={PL + 2} y={Y_RSI + 11} fontSize="11" fontWeight="600" fill={C.txt}>RSI(7) — 35 미만 눌림 · 70 초과 과열</text>
                <rect x={PL} y={yR(70)} width={W - PL - PR} height={yR(35) - yR(70)} fill="#adb5bd" opacity={0.1} />
                {[[70, C.up], [35, C.dn]].map(([v, col]) => (
                    <g key={v as number}>
                        <line x1={PL} x2={W - PR} y1={yR(v as number)} y2={yR(v as number)} stroke={col as string} strokeDasharray="4 3" opacity={0.7} />
                        <text x={W - PR + 6} y={yR(v as number) + 4} fontSize="11" fill={C.txt}>{v}</text>
                    </g>
                ))}
                <path d={(() => {
                    let d = "", pen = false;
                    for (let i = off; i < n; i++) {
                        const v = data.rsi7[i];
                        if (v == null) { pen = false; continue; }
                        d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${yR(v).toFixed(1)}`; pen = true;
                    }
                    return d;
                })()} fill="none" stroke={C.buy} strokeWidth={1.4} />

                {/* 호버 크로스헤어 */}
                {hover != null && (
                    <line x1={x(hover)} x2={x(hover)} y1={0} y2={H - H_AXIS} stroke="#0f172a" strokeOpacity={0.35} />
                )}
                <rect x={PL} y={0} width={W - PL - PR} height={H - H_AXIS} fill="transparent"
                    onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} />
            </svg>
            </div>

            <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <Legend color={C.ma20} label="20일선" />
                <Legend color={C.ma120} label="120일선" thick />
                <Legend color={C.ma5} label="5일선" />
                <span className="inline-flex items-center gap-1.5"><i className="inline-block h-3 w-4 rounded-sm" style={{ background: C.band, opacity: 0.35 }} />볼린저 밴드</span>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block h-3 w-4 rounded-sm border" style={{ background: "#1971c222", borderColor: C.buy }} />▲ 매수 구간</span>
                <span className="inline-flex items-center gap-1.5"><i className="inline-block h-3 w-4 rounded-sm border" style={{ background: "#9333ea22", borderColor: C.sell }} />▼ 매도 구간(더 사지 않음)</span>
                <span className="text-slate-400">기준 {data.asof} · 일봉</span>
            </figcaption>
        </figure>
    );
}

function Legend({ color, label, thick }: { color: string; label: string; thick?: boolean }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <i className="inline-block w-4 rounded" style={{ background: color, height: thick ? 3 : 2 }} />
            {label}
        </span>
    );
}

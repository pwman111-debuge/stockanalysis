"use client";

// 쉬운 시황(v4) MDX 블록 — scripts/market_brief.py 가 props 를 한 줄 JSX 로 채운다.
// 색 규칙: 한국식 상승 빨강(rose) / 하락 파랑(blue). 숫자는 tabular-nums.

type Num = number | null | undefined;

const tone = (v: Num) => (v == null || v === 0 ? "text-slate-500" : v > 0 ? "text-rose-600" : "text-blue-600");
const arrow = (v: Num) => (v == null || v === 0 ? "" : v > 0 ? "▲" : "▼");
const num = (v: Num, d = 2) =>
    v == null ? "—" : v.toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v: Num) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`);
const eok = (v: Num) => {
    if (v == null) return "—";
    const s = v > 0 ? "+" : v < 0 ? "-" : "";
    const a = Math.abs(v);
    return a >= 10000 ? `${s}${(a / 10000).toFixed(2)}조` : `${s}${a.toLocaleString("ko-KR")}억`;
};

/* ── 오늘 3줄 요약 ───────────────────────────── */
export function KeyPoints({ title = "오늘 시장 3줄 요약", items }: { title?: string; items: string[] }) {
    return (
        <section className="not-prose my-6 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-cyan-800">✦ {title}</h3>
            <ol className="space-y-2.5">
                {items.map((t, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-800">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">{i + 1}</span>
                        <span>{t}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

/* ── 지수 카드 (값 · 등락 · 52주 위치 · 수급 · 등락 종목수) ─────────── */
interface IndexItem {
    name: string; value: number; change: Num; rate: Num; high?: Num; low?: Num; high52?: Num; low52?: Num;
    flows?: { individual: number; foreign: number; institution: number };
    breadth?: { up: number; flat: number; down: number; upper?: number; lower?: number };
}

export function IndexBoard({ items }: { items: IndexItem[] }) {
    return (
        <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
            {items.map((it) => {
                const pos = it.high52 && it.low52 ? ((it.value - it.low52) / (it.high52 - it.low52)) * 100 : null;
                const b = it.breadth;
                const tot = b ? b.up + b.flat + b.down : 0;
                return (
                    <div key={it.name} className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${!it.flows ? "sm:col-span-2" : ""}`}>
                        <div className="text-sm font-semibold text-slate-500">{it.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                            <span className="text-2xl font-bold tabular-nums text-slate-900">{num(it.value)}</span>
                            <span className={`text-sm font-semibold tabular-nums ${tone(it.rate)}`}>
                                {arrow(it.rate)} {num(it.change == null ? null : Math.abs(it.change))} ({pct(it.rate)})
                            </span>
                        </div>
                        {it.high != null && it.low != null && (
                            <div className="mt-1 text-xs tabular-nums text-slate-500">오늘 고가 {num(it.high)} · 저가 {num(it.low)}</div>
                        )}
                        {pos != null && (
                            <div className="mt-3">
                                <div className="mb-1 flex justify-between text-[11px] tabular-nums text-slate-400">
                                    <span>52주 최저 {num(it.low52, 0)}</span><span>최고 {num(it.high52, 0)}</span>
                                </div>
                                <div className="relative h-1.5 rounded-full bg-slate-200">
                                    <div className="absolute -top-[3px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-slate-800 shadow"
                                        style={{ left: `${Math.min(100, Math.max(0, pos))}%` }} />
                                </div>
                            </div>
                        )}
                        {it.flows && (
                            <div className="mt-4">
                                <div className="mb-1.5 text-xs font-semibold text-slate-500">누가 샀나 (순매수)</div>
                                <FlowBars flows={it.flows} />
                            </div>
                        )}
                        {b && tot > 0 && (
                            <div className="mt-4">
                                <div className="mb-1.5 flex justify-between text-xs tabular-nums">
                                    <span className="font-semibold text-rose-600">오른 종목 {b.up.toLocaleString()}</span>
                                    <span className="text-slate-400">보합 {b.flat}</span>
                                    <span className="font-semibold text-blue-600">내린 종목 {b.down.toLocaleString()}</span>
                                </div>
                                <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
                                    <div className="bg-rose-500" style={{ width: `${(b.up / tot) * 100}%` }} />
                                    <div className="bg-slate-300" style={{ width: `${(b.flat / tot) * 100}%` }} />
                                    <div className="bg-blue-500" style={{ width: `${(b.down / tot) * 100}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function FlowBars({ flows }: { flows: { individual: number; foreign: number; institution: number } }) {
    const rows: [string, number][] = [["개인", flows.individual], ["외국인", flows.foreign], ["기관", flows.institution]];
    const max = Math.max(...rows.map(([, v]) => Math.abs(v)), 1);
    return (
        <div className="space-y-1.5">
            {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[3rem_1fr_4.8rem] items-center gap-2 text-xs">
                    <span className="text-slate-600">{k}</span>
                    {/* 가운데 0 기준 양방향 막대 */}
                    <div className="relative h-2.5 rounded bg-slate-100">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                        <div className={`absolute inset-y-0 rounded ${v >= 0 ? "bg-rose-500" : "bg-blue-500"}`}
                            style={v >= 0 ? { left: "50%", width: `${(v / max) * 50}%` } : { right: "50%", width: `${(-v / max) * 50}%` }} />
                    </div>
                    <span className={`text-right font-semibold tabular-nums ${tone(v)}`}>{eok(v)}</span>
                </div>
            ))}
        </div>
    );
}

/* ── 해외·환율·금리 칩 ─────────────────────────── */
interface MacroItem { name: string; value: Num; change: Num; rate: Num; unit?: string; isRate?: boolean }

export function MacroStrip({ items }: { items: MacroItem[] }) {
    return (
        <div className="not-prose my-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((m) => (
                <div key={m.name} className="rounded-xl border border-border bg-card px-3 py-2.5">
                    <div className="truncate text-xs text-slate-500">{m.name}</div>
                    <div className="text-base font-bold tabular-nums text-slate-900">
                        {m.isRate ? `${num(m.value, 3)}%` : num(m.value)}
                    </div>
                    <div className={`text-xs font-semibold tabular-nums ${tone(m.change)}`}>
                        {m.isRate
                            ? `${arrow(m.change)} ${num(m.change == null ? null : Math.abs(m.change), 3)}%p`
                            : `${arrow(m.rate)} ${pct(m.rate)}`}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── 업종·테마 막대 ───────────────────────────── */
interface Group { name: string; rate: number }

export function SectorBoard({ up, down, themes }: { up: Group[]; down: Group[]; themes?: Group[] }) {
    const max = Math.max(...[...up, ...down, ...(themes ?? [])].map((g) => Math.abs(g.rate)), 1);
    const Col = ({ title, rows }: { title: string; rows: Group[] }) => (
        <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2.5 text-sm font-bold text-slate-700">{title}</div>
            <div className="space-y-2">
                {rows.map((g) => (
                    <div key={g.name} className="text-sm">
                        <div className="flex justify-between gap-2">
                            <span className="truncate text-slate-700">{g.name}</span>
                            <span className={`shrink-0 font-semibold tabular-nums ${tone(g.rate)}`}>{pct(g.rate)}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${g.rate >= 0 ? "bg-rose-500" : "bg-blue-500"}`}
                                style={{ width: `${(Math.abs(g.rate) / max) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    return (
        <div className={`not-prose my-6 grid gap-3 ${themes?.length ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <Col title="🔥 강한 업종" rows={up} />
            <Col title="🧊 약한 업종" rows={down} />
            {themes?.length ? <Col title="⭐ 강한 테마" rows={themes} /> : null}
        </div>
    );
}

/* ── 순위 리스트 묶음 (거래대금·순매수) ───────────────── */
interface RankItem { name: string; sub?: string; rate?: Num }

export function RankGroup({ lists }: { lists: { label: string; items: RankItem[] }[] }) {
    return (
        <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
            {lists.map((l) => (
                <div key={l.label} className="rounded-2xl border border-border bg-card p-4">
                    <div className="mb-2 text-sm font-bold text-slate-700">{l.label}</div>
                    {l.items.length === 0 ? (
                        <div className="py-3 text-sm text-slate-400">아직 집계 전입니다</div>
                    ) : (
                        <ol className="divide-y divide-border">
                            {l.items.map((it, i) => (
                                <li key={it.name} className="flex items-center gap-3 py-2 text-sm">
                                    <span className="w-4 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                                    <span className="flex-1 truncate font-medium text-slate-800">{it.name}</span>
                                    {it.sub && <span className="tabular-nums text-xs text-slate-500">{it.sub}</span>}
                                    <span className={`w-16 text-right font-semibold tabular-nums ${tone(it.rate)}`}>{pct(it.rate)}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── 차트 신호 상태 카드 (조건 체크리스트 + 다음 방아쇠) ─────────── */
interface SignalCardData {
    state: string; label: string; summary: string;
    checks: { label: string; ok: boolean; value: string }[];
    next: string;
}
const CARD_TONE: Record<string, string> = {
    buy_fire: "border-blue-300 bg-blue-50", buy_arm: "border-blue-200 bg-blue-50/60",
    sell_fire: "border-purple-300 bg-purple-50", sell_arm: "border-purple-200 bg-purple-50/60",
    none: "border-slate-200 bg-slate-50",
};

export function SignalCard({ data }: { data: SignalCardData }) {
    return (
        <div className={`not-prose my-6 rounded-2xl border p-4 sm:p-5 ${CARD_TONE[data.state] ?? CARD_TONE.none}`}>
            <div className="mb-2 text-sm font-bold text-slate-900">지금 상태: {data.label}</div>
            <p className="mb-4 text-[15px] leading-relaxed text-slate-700">{data.summary}</p>
            <ul className="mb-4 space-y-1.5">
                {data.checks.map((c) => (
                    <li key={c.label} className="grid grid-cols-[1.25rem_1fr] gap-x-2 text-sm">
                        <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${c.ok ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                            {c.ok ? "✓" : "–"}
                        </span>
                        <span className="text-slate-700">{c.label}
                            <span className="block text-xs tabular-nums text-slate-500">{c.value}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <div className="rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-slate-800">
                <b>👀 다음에 볼 것</b> — {data.next}
            </div>
        </div>
    );
}

/* ── 차트 신호 읽는 법 (고정 안내) ─────────────────── */
export function SignalGuide() {
    return (
        <details className="not-prose my-6 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-slate-700">
            <summary className="cursor-pointer font-bold text-slate-900">📘 차트 신호, 어떻게 읽나요?</summary>
            <div className="mt-3 space-y-2">
                <p>신호는 <b>두 단계</b>로 켜집니다. 먼저 <b>준비</b>(많이 눌렸다 / 많이 올랐다)가 확인되면 박스가 시작되고,
                    그 뒤 <b>방아쇠</b>(방향이 꺾였다)가 확인되면 박스가 끝나며 ▲▼ 표시가 붙습니다.</p>
                <p><b className="text-blue-700">▲ 매수 구간</b> — 큰 흐름(120일선) 위에서 20일선 아래로 눌렸다가(볼린저 %B 20 미만 또는 RSI(7) 35 미만),
                    MACD 막대가 플러스로 바뀌고 종가가 20일선을 되찾은 날. 단, 이미 너무 많이 오른 자리(120일선 이격이 1년 중 상위 8%)에서는 신호를 내지 않습니다.</p>
                <p><b className="text-purple-700">▼ 매도 구간</b> — 1년 기준으로 높은 자리에서 과열(RSI(7) 70 초과 또는 %B 85 초과)된 뒤,
                    MACD 막대가 마이너스로 바뀌고 종가가 20일선 아래로 내려온 날. 과거 검증에서 맞히는 힘이 약해서
                    <b> &lsquo;팔아라&rsquo;가 아니라 &lsquo;여기서 더 사지 말자&rsquo;</b>로 읽습니다.</p>
                <p className="text-slate-500">차트는 &lsquo;언제&rsquo;를 보는 도구일 뿐, 무엇을 살지 정해 주지 않습니다. 단독 매매 근거로 쓰지 마세요.</p>
            </div>
        </details>
    );
}

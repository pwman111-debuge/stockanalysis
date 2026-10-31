import { allStockPickFeedbacks } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Search, ArrowRight, Calendar, ClipboardCheck, TrendingUp, CheckCircle2, Award, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

const POSTS_PER_PAGE = 9;

export const dynamic = 'force-static';

interface LegacyRow {
    name: string; count: number; from: string; to: string;
    w1: number; w1beat: number; m1: number; m1beat: number; m3: number; m3n: number; m3beat: number;
    up: number; ret: number; kospi: number;
}

function loadLegacy(): { asof: string; rows: LegacyRow[] } {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/charts/portfolio/legacy.json'), 'utf8'));
}

const signed = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`;

export default function PerformanceReviewPage() {
    const legacy = loadLegacy();
    const currentPage = 1;

    const allReviews = allStockPickFeedbacks.sort((a, b) =>
        compareDesc(parseISO(a.date), parseISO(b.date))
    );

    const totalPages = Math.ceil(allReviews.length / POSTS_PER_PAGE);
    const reviews = allReviews.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header Section with elegant layout */}
            <section className="relative py-16 px-8 rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 via-transparent to-blue-600/30" />

                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-violet-500 p-2.5 rounded-2xl shadow-lg shadow-violet-500/20">
                            <Award className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-sm font-black tracking-[0.2em] text-violet-300 uppercase">Performance Archives</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-8 leading-[1.1]">
                        투자 성과 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">리뷰</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed font-medium">
                        공개한 종목의 이후 결과를 날짜별로 기록한 공간입니다. <br className="hidden md:block" />
                        2026년 11월부터는 제네시스 모의 포트폴리오의 결과를 기록합니다.
                    </p>
                </div>
            </section>


            <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold">구 시스템 최종 성적표</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    2026년 3월부터 10월까지 공개한 단기·중기·장기 추천 {legacy.rows.reduce((n, r) => n + r.count, 0)}건을 리포트 날짜 종가에 샀다고 보고 다시 계산했습니다. 코스피 대비 수익률은 대부분의 기간에서 마이너스였습니다.
                    추천 직전에 많이 오른 종목을 뒤따라 산 영향이 컸고, 이 결과 때문에 월간 모의 포트폴리오로 바꿨습니다.
                </p>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-muted-foreground">
                                <th className="py-2 pr-3 font-medium">구분</th>
                                <th className="px-3 py-2 text-right font-medium">건수</th>
                                <th className="px-3 py-2 text-right font-medium">1주 뒤 코스피 대비</th>
                                <th className="px-3 py-2 text-right font-medium">1달 뒤</th>
                                <th className="px-3 py-2 text-right font-medium">3달 뒤</th>
                                <th className="px-3 py-2 text-right font-medium">10/30 기준 오른 비율</th>
                            </tr>
                        </thead>
                        <tbody>
                            {legacy.rows.map((r) => (
                                <tr key={r.name} className="border-b border-border last:border-0">
                                    <td className="py-2 pr-3 font-bold">{r.name}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{signed(r.w1)}%p</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{signed(r.m1)}%p</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{signed(r.m3)}%p <span className="text-xs text-muted-foreground">({r.m3n}건)</span></td>
                                    <td className="px-3 py-2 text-right tabular-nums">{r.up}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    같은 종목을 여러 번 추천한 경우 각각 계산했습니다. 단기는 {legacy.rows[0].to}까지의 정식 추천만 포함합니다. 3달 뒤 값은 3달이 지난 추천만 계산했습니다.
                    이번 표는 평균이며 손절 규칙과 거래비용은 반영하지 않았습니다. 구 시스템의 추적 종목 기록은 {legacy.asof}로 마감합니다.
                </p>
            </section>

            {/* Reviews List */}
            <div className="space-y-8">
                {reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {reviews.map((review) => (
                            <Link key={review._id} href={review.url} className="block group">
                                <article className="relative h-full space-y-6 rounded-[2.5rem] border border-border bg-card p-10 shadow-sm transition-all duration-500 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-2 overflow-hidden">
                                    {/* Accent background element */}
                                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl group-hover:bg-violet-500/10 transition-colors duration-700" />

                                    <div className="relative flex flex-col justify-between h-full">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-violet-500/10 p-2.5 rounded-xl text-violet-500 group-hover:bg-violet-500 group-hover:text-white transition-all duration-500">
                                                        <ClipboardCheck className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-black text-violet-500 uppercase tracking-widest">Performance Feed</span>
                                                </div>
                                                <div className="flex items-center text-xs font-bold text-muted-foreground bg-muted/50 px-3.5 py-1.5 rounded-full">
                                                    <Calendar className="mr-2 h-3.5 w-3.5" />
                                                    {format(parseISO(review.date), 'yyyy.MM.dd')}
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-black tracking-tight group-hover:text-violet-500 transition-colors leading-snug">
                                                {review.title}
                                            </h2>

                                            <p className="text-muted-foreground line-clamp-2 text-base leading-relaxed">
                                                {review.summary}
                                            </p>

                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {review.tags?.map((tag) => (
                                                    <span key={tag} className="px-3 py-1 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground group-hover:bg-violet-50 transition-colors">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-8 mt-8 border-t border-border/50 flex items-center justify-between">
                                            <span className="text-sm font-black text-muted-foreground group-hover:text-violet-500 transition-colors">리뷰 상세 분석 읽기</span>
                                            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white group-hover:rotate-[360deg] transition-all duration-700 shadow-sm">
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center rounded-[3rem] border-2 border-dashed border-border bg-muted/10">
                        <TrendingUp className="h-16 w-16 text-muted-foreground/20 mb-6" />
                        <h3 className="text-2xl font-black text-muted-foreground">성과 추적 데이터 수집 중</h3>
                        <p className="text-muted-foreground mt-3 max-w-sm mx-auto font-medium">
                            투자 성과 리포트가 발행되면 이곳에 표시됩니다.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {allReviews.length > POSTS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-2 pt-8">
                    <Link
                        href="#"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all pointer-events-none opacity-30"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={page === 1 ? '/picks/feedback' : `/picks/feedback/page/${page}`}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                                currentPage === page
                                    ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                                    : 'border-border hover:bg-muted'
                            }`}
                        >
                            {page}
                        </Link>
                    ))}

                    <Link
                        href={currentPage < totalPages ? `/picks/feedback/page/${currentPage + 1}` : '#'}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-all ${
                            currentPage < totalPages ? 'hover:bg-violet-500 hover:text-white hover:border-violet-500' : 'pointer-events-none opacity-30'
                        }`}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>
            )}
        </div>
    );
}

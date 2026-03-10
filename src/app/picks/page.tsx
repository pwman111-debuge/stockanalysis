
import { allStockPicks } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Search, TrendingUp, AlertTriangle, Target, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PicksPage() {
    const picks = allStockPicks.sort((a, b) =>
        compareDesc(parseISO(a.date), parseISO(b.updatedAt || a.date))
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight">유망 종목</h1>
                <p className="text-muted-foreground mt-2">단기, 중기, 장기별로 선별된 유망 종목과 상세 투자 전략을 확인하세요.</p>
            </section>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">진행 중 종목</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{picks.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">평균 목표 수익률</p>
                    <p className="mt-1 text-2xl font-bold text-kr-up">
                        {picks.length > 0
                            ? `+${(picks.reduce((acc, p) => acc + parseFloat(p.expectedReturn?.replace(/[+%]/g, '') || '0'), 0) / picks.length).toFixed(1)}%`
                            : "0.0%"
                        }
                    </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">최근 업데이트</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                        {picks.length > 0 ? format(parseISO(picks[0].date), 'MM.dd') : '-'}
                    </p>
                </div>
            </div>

            {/* Grid of Picks */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {picks.map((pick) => (
                    <div key={pick._id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/50">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <span className={cn(
                                            "rounded-md px-2 py-1 text-[10px] font-bold uppercase",
                                            pick.term === 'short' ? "bg-amber-100 text-amber-700" :
                                                pick.term === 'mid' ? "bg-blue-100 text-blue-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {pick.term === 'short' ? "단기" : pick.term === 'mid' ? "중기" : "장기"}
                                        </span>
                                        <span className="text-sm font-bold">{pick.ticker}</span>
                                    </div>
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                                        pick.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-700 border-slate-200"
                                    )}>
                                        {pick.status === 'active' ? "운영 중" : "종료"}
                                    </span>
                                </div>

                                <Link href={pick.url}>
                                    <h2 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                                        {pick.title}
                                    </h2>
                                </Link>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {pick.summary}
                                </p>

                                <div className="grid grid-cols-3 gap-2 py-3 border-t border-border/50 text-center">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">편입가</p>
                                        <p className="text-sm font-bold">{pick.currentPrice.toLocaleString()}원</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold text-primary">목표가</p>
                                        <p className="text-sm font-bold text-primary">{pick.targetPrice.toLocaleString()}원</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase">손절가</p>
                                        <p className="text-sm font-bold text-kr-down">{pick.stopLoss.toLocaleString()}원</p>
                                    </div>
                                </div>
                            </div>

                            <Link href={pick.url} className="md:w-12 bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors border-l border-border/50">
                                <ArrowUpRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {picks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border bg-muted/5">
                    <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-muted-foreground">유망 종목이 등록되지 않았습니다.</h3>
                    <p className="text-sm text-muted-foreground mt-1">곧 새로운 분석 종목이 업데이트될 예정입니다.</p>
                </div>
            )}
        </div>
    );
}

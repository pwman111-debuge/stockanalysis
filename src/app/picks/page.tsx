
import { allStockPicks } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Search, TrendingUp, AlertTriangle, Target, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function PicksPage() {
    const picks = [...allStockPicks].sort((a, b) =>
        compareDesc(parseISO(a.date), parseISO(b.updatedAt || a.date))
    );

    // Group picks by date
    const groupedPicks = picks.reduce((acc, pick) => {
        const dateKey = format(parseISO(pick.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(pick);
        return acc;
    }, {} as Record<string, typeof allStockPicks>);

    const sortedDates = Object.keys(groupedPicks).sort((a, b) =>
        compareDesc(parseISO(a), parseISO(b))
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight">유망 종목</h1>
                <p className="text-muted-foreground mt-2">일자별로 엄선된 유망 종목 리포트를 확인하세요.</p>
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

            {/* Grid of Date Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedDates.map((date) => (
                    <Link
                        key={date}
                        href={`/picks/${date}`}
                        className="group flex flex-col items-center justify-center aspect-square rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md hover:-translate-y-1 text-center"
                    >
                        <div className="mb-2 rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-bold text-primary/70 mb-1">{format(parseISO(date), 'MM.dd')}</p>
                        <h3 className="text-sm font-bold text-foreground break-keep">
                            {format(parseISO(date), 'yyyy.MM.dd')}
                            <br />
                            유망종목
                        </h3>
                        <div className="mt-3 text-[10px] font-medium text-muted-foreground">
                            종목 {groupedPicks[date].length}개
                        </div>
                    </Link>
                ))}
            </div>

            {sortedDates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border bg-muted/5">
                    <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-muted-foreground">유망 종목이 등록되지 않았습니다.</h3>
                    <p className="text-sm text-muted-foreground mt-1">곧 새로운 분석 종목이 업데이트될 예정입니다.</p>
                </div>
            )}
        </div>
    );
}

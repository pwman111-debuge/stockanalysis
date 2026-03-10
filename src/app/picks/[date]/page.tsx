
import { allStockPicks } from 'contentlayer2/generated';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, ArrowUpRight, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const dates = allStockPicks.map(p => format(parseISO(p.date), 'yyyy-MM-dd'));
    return Array.from(new Set(dates)).map(date => ({ date }));
}

export default async function PicksDatePage({ params }: { params: Promise<{ date: string }> }) {
    const { date } = await params;

    const picks = allStockPicks.filter(
        p => format(parseISO(p.date), 'yyyy-MM-dd') === date
    ).sort((a, b) => a.title.localeCompare(b.title));

    if (picks.length === 0) notFound();

    return (
        <div className="space-y-8 pb-10">
            <Link
                href="/picks"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-2 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <section>
                <h1 className="text-3xl font-bold tracking-tight">{format(parseISO(date), 'yyyy년 MM월 dd일')} 유망 종목</h1>
                <p className="text-muted-foreground mt-2">이날 선정된 {picks.length}개의 유망 종목과 상세 투자 전략입니다.</p>
            </section>

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
        </div>
    );
}

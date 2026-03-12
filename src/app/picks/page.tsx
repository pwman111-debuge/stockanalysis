import { allStockPicks } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Search, ArrowRight, Calendar, Tag, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function PicksPage() {
    const picks = allStockPicks.sort((a, b) =>
        compareDesc(parseISO(a.date), parseISO(b.date))
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <div className="flex items-center gap-3">
                    <Search className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">유망 종목</h1>
                </div>
                <p className="text-muted-foreground mt-2">
                    제네시스 AI가 수급과 차트, 재무를 종합 분석하여 선정한 단기 유망 종목입니다.
                </p>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {picks.map((pick) => (
                    <article key={pick._id} className="group relative flex flex-col space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${pick.market === 'KOSPI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {pick.market}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">{pick.ticker}</span>
                            </div>
                            <div className="flex items-center text-[10px] text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                {format(parseISO(pick.date), 'yyyy.MM.dd')}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                                {pick.title}
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {pick.summary}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-4 border-y border-border/50 my-2">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">목표가</p>
                                <p className="text-sm font-bold text-kr-up">{pick.targetPrice.toLocaleString()}원</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">기대수익</p>
                                <p className="text-sm font-bold text-kr-up">+{pick.expectedReturn}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {pick.tags?.slice(0, 2).map((tag) => (
                                    <span key={tag} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground border border-border/50">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <Link href={pick.url} className="inline-flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                                상세 리포트 <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>

            {picks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border-2 border-dashed border-border bg-muted/5">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">발굴된 종목이 없습니다</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                        제네시스 AI가 시장을 분석 중입니다. <br/>잠시 후 다시 확인해 주세요.
                    </p>
                </div>
            )}
        </div>
    );
}

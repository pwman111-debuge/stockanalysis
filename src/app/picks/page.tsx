import { allStockPicks } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Search, ArrowRight, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PicksPage() {
    // 일일 통합 리포트(GENESIS) 형식만 필터링하거나, 최신 리포트만 그룹화하여 표시
    // 여기서는 ticker가 'GENESIS'인 통합 리포트 형태를 우선적으로 표시하도록 구성
    const dailyReports = allStockPicks
        .filter(pick => pick.ticker === 'GENESIS')
        .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));

    return (
        <div className="space-y-8 pb-10">
            <section>
                <div className="flex items-center gap-3">
                    <Search className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">유망 종목 발굴</h1>
                </div>
                <p className="text-muted-foreground mt-2">
                    제네시스 AI가 매일 수급과 모멘텀을 분석하여 선정한 단기 유망 종목 리스트입니다.
                </p>
            </section>

            <div className="max-w-md">
                {dailyReports.map((report) => (
                    <Link key={report._id} href={report.url} className="block group">
                        <article className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Layers className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-bold text-primary">DAILY REPORT</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground font-medium">
                                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                    {format(parseISO(report.date), 'yyyy.MM.dd')}
                                </div>
                            </div>

                            {/* Card Title */}
                            <h2 className="text-xl font-extrabold tracking-tight mb-4 group-hover:text-primary transition-colors">
                                {format(parseISO(report.date), 'MM월 dd일')} 유망 종목 발굴
                            </h2>

                            {/* Stock List inside Square */}
                            <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border/50">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">포함 종목</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 삼성중공업
                                        </span>
                                        <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">KOSPI</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 유니온머티리얼
                                        </span>
                                        <span className="text-[10px] font-medium bg-green-100 text-green-600 px-1.5 py-0.5 rounded">KOSDAQ</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 한전기술
                                        </span>
                                        <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">KOSPI</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="mt-6 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-medium">전체 분석 보기</span>
                                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {dailyReports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border-2 border-dashed border-border bg-muted/5">
                    <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-bold">발굴 리포트 대기 중</h3>
                    <p className="text-sm text-muted-foreground mt-1">오늘의 분석이 진행 중입니다.</p>
                </div>
            )}
        </div>
    );
}

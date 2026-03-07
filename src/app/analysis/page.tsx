
import { allStockReports } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';
import { BarChart3, FileText, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisPage() {
    const reports = allStockReports.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight">종목 리포트</h1>
                <p className="text-muted-foreground mt-2">개별 종목에 대한 심층 적인 펀더멘털 및 기술적 분석 리포트를 확인하세요.</p>
            </section>

            <div className="space-y-4">
                {reports.map((report) => (
                    <div key={report._id} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                        {report.reportType}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{report.market} | {report.ticker}</span>
                                </div>
                                <Link href={report.url}>
                                    <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
                                        {report.title}
                                    </h2>
                                </Link>
                                <p className="text-sm text-muted-foreground max-w-2xl line-clamp-1">
                                    {report.summary}
                                </p>
                            </div>

                            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center md:space-y-2">
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase">투자의견</p>
                                        <p className="text-sm font-bold text-kr-up uppercase">{report.rating}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-muted-foreground uppercase">목표가</p>
                                        <p className="text-sm font-bold">{report.targetPrice.toLocaleString()}원</p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(parseISO(report.date), 'yyyy.MM.dd')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {reports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border bg-muted/5">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-muted-foreground">분석 리포트가 없습니다.</h3>
                    <p className="text-sm text-muted-foreground mt-1">연구원들이 종목을 심도 있게 분석 중입니다.</p>
                </div>
            )}
        </div>
    );
}

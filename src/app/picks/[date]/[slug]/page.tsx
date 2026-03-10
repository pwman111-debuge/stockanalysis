
import { allStockPicks } from 'contentlayer2/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { MdxRenderer } from '@/components/content/MdxRenderer';
import { cn } from '@/lib/utils';

export async function generateStaticParams() {
    return allStockPicks.map((post) => ({
        date: format(parseISO(post.date), 'yyyy-MM-dd'),
        slug: post._raw.flattenedPath.split('/').pop() || '',
    }));
}

export default async function PickDetailPage({ params }: { params: Promise<{ date: string, slug: string }> }) {
    const { date, slug } = await params;
    const post = allStockPicks.find(
        (p) =>
            format(parseISO(p.date), 'yyyy-MM-dd') === date &&
            p._raw.flattenedPath.split('/').pop() === slug
    );

    if (!post) notFound();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href={`/picks/${date}`}
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
            </Link>

            <article className="space-y-8">
                {/* Header Card */}
                <header className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />

                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold uppercase",
                            post.term === 'short' ? "bg-amber-100 text-amber-700" :
                                post.term === 'mid' ? "bg-blue-100 text-blue-700" :
                                    "bg-emerald-100 text-emerald-700"
                        )}>
                            {post.term === 'short' ? "단기 투자" : post.term === 'mid' ? "중기 투자" : "장기 투자"}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <Calendar className="mr-1.5 h-4 w-4" />
                            {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                        </div>
                    </div>

                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <div className="text-sm font-bold text-primary mb-1">{post.ticker} | {post.market}</div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                {post.title}
                            </h1>
                        </div>
                        <div className={cn(
                            "hidden md:flex items-center rounded-full px-4 py-1.5 text-sm font-bold border",
                            post.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-700 border-slate-200"
                        )}>
                            {post.status === 'active' ? "운영 중" : "종료"}
                        </div>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        {post.summary}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-xl bg-muted/30 border border-border/50">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">편입 가격</p>
                            <p className="text-xl font-bold">{post.currentPrice.toLocaleString()}원</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-primary uppercase mb-1 flex items-center">
                                <Target className="mr-1 h-3 w-3" />
                                목표 가격
                            </p>
                            <p className="text-xl font-bold text-primary">{post.targetPrice.toLocaleString()}원</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-kr-down uppercase mb-1 flex items-center">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                손절 가격
                            </p>
                            <p className="text-xl font-bold text-kr-down">{post.stopLoss.toLocaleString()}원</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-kr-up uppercase mb-1 flex items-center">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                기대 수익률
                            </p>
                            <p className="text-xl font-bold text-kr-up">{post.expectedReturn}</p>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-sm">
                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl">
                        <MdxRenderer code={post.body.code} />
                    </div>

                    <footer className="mt-12 pt-8 border-t border-border">
                        <div className="flex flex-wrap gap-2">
                            {post.tags?.map((tag) => (
                                <span key={tag} className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                                    <Tag className="mr-1 h-3 w-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                보유 예상 기간: <span className="font-bold text-foreground">{post.holdingPeriod}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Share2 className="h-4 w-4" />
                                    <span>공유</span>
                                </button>
                                <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Bookmark className="h-4 w-4" />
                                    <span>저장</span>
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </article>
        </div>
    );
}

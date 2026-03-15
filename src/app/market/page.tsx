
import Link from 'next/link';
import { allMarketAnalyses } from 'contentlayer2/generated';
import { compareDesc, format, parseISO } from 'date-fns';
import { Activity, ArrowRight, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const POSTS_PER_PAGE = 9;

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function MarketAnalysisPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams.page) || 1;
    
    const allPosts = allMarketAnalyses.sort((a, b) =>
        compareDesc(parseISO(a.date), parseISO(b.date))
    );

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    const posts = allPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    return (
        <div className="space-y-8 pb-10">
            <section>
                <h1 className="text-3xl font-bold tracking-tight">시황 분석</h1>
                <p className="text-muted-foreground mt-2">전문가와 AI가 분석한 국내외 시장의 흐름과 핵심 지표를 확인하세요.</p>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <article key={post._id} className="group relative flex flex-col space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {format(parseISO(post.date), 'yyyy년 MM월 dd일')}
                            </div>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-[10px] uppercase">
                                {post.category}
                            </span>
                        </div>

                        <div className="flex-1">
                            <Link href={post.url} className="block">
                                <h2 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    {post.title}
                                </h2>
                                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                    {post.summary}
                                </p>
                            </Link>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-border/50">
                            <div className="flex flex-wrap gap-1">
                                {post.tags?.slice(0, 2).map((tag) => (
                                    <span key={tag} className="inline-flex items-center text-[10px] text-muted-foreground">
                                        <Tag className="mr-1 h-2 w-2" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <Link href={post.url} className="text-xs font-semibold text-primary flex items-center group-hover:translate-x-1 transition-transform">
                                읽어보기 <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>

            {allPosts.length > POSTS_PER_PAGE && (
                <div className="flex items-center justify-center space-x-2 pt-8">
                    <Link
                        href={currentPage > 1 ? `/market?page=${currentPage - 1}` : '#'}
                        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors ${
                            currentPage > 1 ? 'hover:bg-accent hover:text-accent-foreground' : 'pointer-events-none opacity-50'
                        }`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/market?page=${page}`}
                            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                                currentPage === page
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:bg-accent hover:text-accent-foreground'
                            }`}
                        >
                            {page}
                        </Link>
                    ))}

                    <Link
                        href={currentPage < totalPages ? `/market?page=${currentPage + 1}` : '#'}
                        className={`flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors ${
                            currentPage < totalPages ? 'hover:bg-accent hover:text-accent-foreground' : 'pointer-events-none opacity-50'
                        }`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            {allPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                    <Activity className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">아직 작성된 분석글이 없습니다.</p>
                </div>
            )}
        </div>
    );
}

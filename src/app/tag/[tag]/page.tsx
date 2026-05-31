// 한글 등 비ASCII 태그가 다수라, Cloudflare(next-on-pages)의 프리렌더 경로 매칭 버그를
// 피하기 위해 엣지 런타임에서 요청 시 동적 렌더링한다. (sitemap.ts 가 색인용 URL을 제공)
export const runtime = 'edge';

import {
    allMarketAnalyses,
    allStockReports,
    allMarketInsights,
    allStockPicks,
    allStockPickFeedbacks,
} from 'contentlayer2/generated';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

type TaggedDoc = {
    _id: string;
    url: string;
    title: string;
    summary: string;
    date: string;
    tags?: string[];
};

const SECTION_LABEL: Record<string, string> = {
    market: '시황 분석',
    analysis: '종목 리포트',
    insight: '마켓 인사이트',
    picks: '유망 종목',
};

function sectionOf(url: string): string {
    const seg = url.split('/')[1] ?? '';
    if (url.startsWith('/picks/feedback')) return '투자 성과';
    return SECTION_LABEL[seg] ?? seg;
}

function allTagged(): TaggedDoc[] {
    return [
        ...allMarketAnalyses,
        ...allStockReports,
        ...allMarketInsights,
        ...allStockPicks,
        ...allStockPickFeedbacks,
    ] as unknown as TaggedDoc[];
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
    const { tag } = await params;
    const decoded = decodeURIComponent(tag);
    return {
        title: `${decoded} 관련 리포트`,
        description: `'${decoded}' 태그가 포함된 제네시스 주식 리포트 모음 — 시황 분석, 종목 리포트, 마켓 인사이트, 유망 종목을 한눈에 확인하세요.`,
        alternates: { canonical: `https://genesis-report.com/tag/${encodeURIComponent(decoded)}` },
    };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const decoded = decodeURIComponent(tag);
    const target = decoded.toLowerCase();

    const posts = allTagged()
        .filter((doc) => (doc.tags ?? []).some((t) => t.trim().toLowerCase() === target))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (posts.length === 0) notFound();

    return (
        <div className="space-y-8 pb-10">
            <section>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary mb-3">
                    <TagIcon className="h-4 w-4" />
                    {decoded}
                </div>
                <h1 className="text-3xl font-bold tracking-tight">‘{decoded}’ 관련 리포트</h1>
                <p className="text-muted-foreground mt-2">
                    {decoded} 태그가 포함된 리포트 {posts.length}건입니다.
                </p>
            </section>

            <div className="space-y-4">
                {posts.map((post) => (
                    <Link
                        key={post._id}
                        href={post.url}
                        className="group block rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                {sectionOf(post.url)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {format(parseISO(post.date), 'yyyy.MM.dd')}
                            </span>
                        </div>
                        <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
                            {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.summary}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

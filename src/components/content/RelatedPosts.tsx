import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type RelatedItem = {
    url: string;
    title: string;
    summary?: string;
};

/**
 * 상세 페이지 하단 "관련 리포트" 내부링크 블록.
 * 내부 순환(체류시간·페이지뷰)과 색인 깊이를 높여 SEO/AdSense 모두에 기여한다.
 */
export function RelatedPosts({
    items,
    heading = '함께 보면 좋은 리포트',
}: {
    items: RelatedItem[];
    heading?: string;
}) {
    if (!items || items.length === 0) return null;

    return (
        <section className="mt-10" aria-label={heading}>
            <h2 className="text-lg font-bold mb-4">{heading}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                    <Link
                        key={item.url}
                        href={item.url}
                        className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                    >
                        <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                        </h3>
                        {item.summary && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                {item.summary}
                            </p>
                        )}
                        <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
                            자세히 보기
                            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

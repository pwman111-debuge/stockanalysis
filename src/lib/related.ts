// 콘텐츠 상세 페이지의 "관련 리포트" 추천 로직.
// 같은 컬렉션 내에서 태그 겹침 우선, 부족하면 최신순으로 채운다.

type RelatablePost = {
    _id: string;
    url: string;
    title: string;
    summary: string;
    date: string;
    tags?: string[];
};

export function getRelatedPosts<T extends RelatablePost>(
    all: T[],
    current: T,
    limit = 4,
): T[] {
    const currentTags = new Set((current.tags ?? []).map((t) => t.toLowerCase()));

    const scored = all
        .filter((p) => p._id !== current._id)
        .map((p) => {
            const overlap = (p.tags ?? []).reduce(
                (n, t) => n + (currentTags.has(t.toLowerCase()) ? 1 : 0),
                0,
            );
            return { post: p, overlap, time: new Date(p.date).getTime() };
        });

    // 1순위: 공통 태그 수 내림차순, 2순위: 최신순
    scored.sort((a, b) => b.overlap - a.overlap || b.time - a.time);

    return scored.slice(0, limit).map((s) => s.post);
}

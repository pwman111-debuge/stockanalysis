import React from 'react';

const SITE = 'https://genesis-report.com';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;

type ContentJsonLdProps = {
    /** 기사 제목 */
    headline: string;
    /** 요약 (메타 설명과 동일) */
    description: string;
    /** 사이트 루트 기준 경로, 예: /analysis/2026-05-26-samsung-electronics */
    path: string;
    /** ISO 날짜 문자열 (contentlayer date 필드) */
    datePublished: string;
    /** 수정일 (없으면 발행일로 대체) */
    dateModified?: string;
    /** 대표 이미지 (절대 URL 또는 /로 시작하는 경로). 없으면 OG 기본 이미지 */
    image?: string;
    /** 상위 섹션 이름, 예: 종목 리포트 */
    sectionLabel: string;
    /** 상위 섹션 경로, 예: /analysis */
    sectionPath: string;
};

/**
 * 콘텐츠 상세 페이지용 구조화 데이터 (Article + BreadcrumbList).
 * 구글 리치결과/뉴스 색인 및 빵부스러기 노출을 위해 각 상세 페이지 상단에 렌더한다.
 */
export function ContentJsonLd({
    headline,
    description,
    path,
    datePublished,
    dateModified,
    image,
    sectionLabel,
    sectionPath,
}: ContentJsonLdProps) {
    const url = `${SITE}${path}`;
    const img = image
        ? image.startsWith('http')
            ? image
            : `${SITE}${image}`
        : DEFAULT_IMAGE;

    const article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        datePublished,
        dateModified: dateModified || datePublished,
        image: [img],
        author: {
            '@type': 'Person',
            name: '황 원장',
            url: `${SITE}/about`,
        },
        publisher: {
            '@type': 'Organization',
            name: '제네시스 주식 리포트',
            logo: { '@type': 'ImageObject', url: `${SITE}/favicon.png` },
        },
        inLanguage: 'ko-KR',
    };

    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: SITE },
            { '@type': 'ListItem', position: 2, name: sectionLabel, item: `${SITE}${sectionPath}` },
            { '@type': 'ListItem', position: 3, name: headline, item: url },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
            />
        </>
    );
}

import { NextResponse } from 'next/server'

const BASE_URL = 'https://genesis-report.com'

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

export async function GET() {
    let items: { title: string; url: string; date: string; summary: string; category: string }[] = []

    try {
        const {
            allMarketAnalyses,
            allStockReports,
            allMarketInsights,
            allStockPicks,
        } = require('contentlayer2/generated')

        if (allMarketAnalyses) {
            for (const post of allMarketAnalyses) {
                items.push({
                    title: post.title,
                    url: `${BASE_URL}${post.url}`,
                    date: post.date,
                    summary: post.summary || '',
                    category: '시황분석',
                })
            }
        }

        if (allStockReports) {
            for (const post of allStockReports) {
                items.push({
                    title: post.title,
                    url: `${BASE_URL}${post.url}`,
                    date: post.date,
                    summary: post.summary || '',
                    category: '종목분석',
                })
            }
        }

        if (allMarketInsights) {
            for (const post of allMarketInsights) {
                items.push({
                    title: post.title,
                    url: `${BASE_URL}${post.url}`,
                    date: post.date,
                    summary: post.summary || '',
                    category: '마켓인사이트',
                })
            }
        }

        if (allStockPicks) {
            for (const post of allStockPicks) {
                items.push({
                    title: post.title,
                    url: `${BASE_URL}${post.url}`,
                    date: post.date,
                    summary: post.summary || '',
                    category: '유망종목',
                })
            }
        }
    } catch (e) {
        console.warn('RSS generation: contentlayer not available', e)
    }

    // 최신순 정렬, 최대 50개
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    items = items.slice(0, 50)

    const rssItems = items
        .map(
            (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.summary)}</description>
      <category>${escapeXml(item.category)}</category>
    </item>`
        )
        .join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>제네시스 주식 리포트</title>
    <link>${BASE_URL}</link>
    <description>한국 주식시장 실시간 시황 분석, 유망 종목 리포트, 투자 전략 정보 플랫폼</description>
    <language>ko</language>
    <managingEditor>pwman111@gmail.com (제네시스 주식 리포트)</managingEditor>
    <webMaster>pwman111@gmail.com (제네시스 주식 리포트)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>제네시스 주식 리포트</title>
      <link>${BASE_URL}</link>
    </image>${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    })
}

import { MetadataRoute } from 'next'

const BASE_URL = 'https://genesis-report.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        '',
        '/market',
        '/analysis',
        '/education',
        '/calendar',
        '/picks',
        '/insight',
        '/about',
        '/privacy',
        '/terms',
        '/contact',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    let dynamicRoutes: MetadataRoute.Sitemap = []

    try {
        const {
            allMarketAnalyses,
            allStockReports,
            allMarketInsights,
            allStockPicks,
            allEducations,
            allStockPickFeedbacks,
        } = require('contentlayer2/generated')

        if (allMarketAnalyses) {
            dynamicRoutes = [
                ...dynamicRoutes,
                ...allMarketAnalyses.map((post: any) => ({
                    url: `${BASE_URL}${post.url}`,
                    lastModified: new Date(post.date),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                })),
            ]
        }

        if (allStockReports) {
            dynamicRoutes = [
                ...dynamicRoutes,
                ...allStockReports.map((post: any) => ({
                    url: `${BASE_URL}${post.url}`,
                    lastModified: new Date(post.date),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                })),
            ]
        }

        if (allMarketInsights) {
            dynamicRoutes = [
                ...dynamicRoutes,
                ...allMarketInsights.map((post: any) => ({
                    url: `${BASE_URL}${post.url}`,
                    lastModified: new Date(post.date),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                })),
            ]
        }

        if (allStockPicks) {
            dynamicRoutes = [
                ...dynamicRoutes,
                ...allStockPicks.map((post: any) => ({
                    url: `${BASE_URL}${post.url}`,
                    lastModified: new Date(post.date),
                    changeFrequency: 'daily' as const,
                    priority: 0.8,
                })),
            ]
        }

        if (allEducations) {
            dynamicRoutes = [
                ...dynamicRoutes,
                ...allEducations.map((post: any) => ({
                    url: `${BASE_URL}${post.url}`,
                    lastModified: new Date(post.date),
                    changeFrequency: 'monthly' as const,
                    priority: 0.5,
                })),
            ]
        }

        if (allStockPickFeedbacks) {
            dynamicRoutes = [
                ...dynamicRoutes,
                ...allStockPickFeedbacks.map((post: any) => ({
                    url: `${BASE_URL}${post.url}`,
                    lastModified: new Date(post.date),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                })),
            ]
        }
    } catch (e) {
        console.warn('Sitemap: contentlayer not available (normal during dev before build):', e)
    }

    return [...staticRoutes, ...dynamicRoutes]
}

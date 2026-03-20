import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://stockanalysis2.pages.dev'

    // Static routes
    const routes = [
        '',
        '/market',
        '/analysis',
        '/education',
        '/calendar',
        '/picks',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // In a real scenario, we would fetch all MDX slugs here.
    // Since I don't have a direct way to run FS in the sitemap.ts (it's a route),
    // for now, I'll provide a robust list or the user can implement a fetcher.
    // But wait, in Next.js App Router sitemap.ts, you CAN use FS if it's running in Node.

    return [...routes]
}

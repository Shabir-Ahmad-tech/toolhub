import type { MetadataRoute } from 'next'
import { TOOLS, BUILT_TOOLS, CATEGORIES } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toolhub.com'

  const toolPages = TOOLS
    .filter(t => BUILT_TOOLS.includes(t.slug))
    .map(tool => ({
      url: `${baseUrl}/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ]

  return [...staticPages, ...toolPages]
}
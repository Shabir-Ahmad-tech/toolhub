import type { MetadataRoute } from 'next'
import { TOOLS, BUILT_TOOLS } from '@/lib/constants'
import { SEO_VARIANTS } from '@/lib/seo-variants'

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

  const variantPages = SEO_VARIANTS.map(v => ({
    url: `${baseUrl}/${v.toolSlug}/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/free-developer-tools`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  return [...staticPages, ...toolPages, ...variantPages]
}
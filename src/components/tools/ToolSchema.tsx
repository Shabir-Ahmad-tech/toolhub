'use client'

import { SITE_CONFIG, CATEGORIES } from '@/lib/constants'

interface ToolSchemaProps {
  name: string
  description: string
  slug: string
  categorySlug?: string
  faq?: Array<{ question: string; answer: string }>
}

export function ToolSchema({ name, description, slug, categorySlug, faq }: ToolSchemaProps) {
  const schemas: any[] = []

  // 1. WebApplication Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: `${SITE_CONFIG.url}/${slug}`,
    description,
    applicationCategory: 'CalculatorApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  })

  // 2. BreadcrumbList Schema
  const breadcrumbElements = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_CONFIG.url
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Tools',
      item: `${SITE_CONFIG.url}/tools`
    }
  ]

  if (categorySlug) {
    const matchedCategory = CATEGORIES.find(c => c.slug === categorySlug)
    const categoryName = matchedCategory ? matchedCategory.name : categorySlug
    breadcrumbElements.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryName,
      item: `${SITE_CONFIG.url}/tools?cat=${categorySlug}`
    })
  }

  breadcrumbElements.push({
    '@type': 'ListItem',
    position: categorySlug ? 4 : 3,
    name,
    item: `${SITE_CONFIG.url}/${slug}`
  })

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbElements
  })

  // 3. FAQPage Schema (if provided)
  if (faq && faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
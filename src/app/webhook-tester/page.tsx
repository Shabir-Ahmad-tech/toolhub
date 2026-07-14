import type { Metadata } from 'next'
import WebhookTesterClient from './_client'

export const metadata: Metadata = {
  title: 'Webhook Tester -- Send & Debug Webhook Payloads Free',
  description: 'Test local webhook endpoints with realistic Stripe, Shopify, and GitHub payloads. Inspect response codes, headers, and debug CORS issues — all client-side.',
  openGraph: {
    title: 'Webhook Tester -- Send & Debug Webhook Payloads Free',
    description: 'Test local webhook endpoints with realistic Stripe, Shopify, and GitHub payloads. Inspect response codes, headers, and debug CORS issues — all client-side.',
    type: 'website',
  }
}

export default function WebhookTesterPage() {
  return <WebhookTesterClient />
}




import type { Metadata } from 'next'
import WebhookTesterClient from './_client'

export const metadata: Metadata = {
  title: 'Webhook Tester â�--�-- Send & Debug Webhook Payloads Free',
  description: 'Test local webhook endpoints with realistic payloads. Generate and send Stripe, Shopify, GitHub, and custom mock payloads client-side. Inspect response codes, headers, and debug CORS issues.',
  openGraph: {
    title: 'Webhook Tester â�--�-- Send & Debug Webhook Payloads Free',
    description: 'Test local webhook endpoints with realistic payloads. Generate and send Stripe, Shopify, GitHub, and custom mock payloads client-side. Inspect response codes, headers, and debug CORS issues.',
    type: 'website',
  }
}

export default function WebhookTesterPage() {
  return <WebhookTesterClient />
}




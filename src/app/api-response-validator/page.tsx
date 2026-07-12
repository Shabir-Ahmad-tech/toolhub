import type { Metadata } from 'next'
import ApiResponseValidatorClient from './ApiResponseValidatorClient'

export const metadata: Metadata = {
  title: 'API Response Validator â�--�-- Free Online Header & JSON Parser',
  description: 'Format, validate and parse HTTP response headers and JSON bodies online. Inspect HTTP status codes and troubleshoot errors locally.',
  openGraph: {
    title: 'API Response Validator â�--�-- Free Online Header & JSON Parser',
    description: 'Format, validate and parse HTTP response headers and JSON bodies online. Inspect HTTP status codes and troubleshoot errors locally.',
    type: 'website',
  }
}

export default function ApiResponseValidatorPage() {
  return <ApiResponseValidatorClient />
}




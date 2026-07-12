import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'IBAN & SWIFT Validator',
  description: 'Validate and parse IBAN numbers and SWIFT/BIC codes. Check IBAN structure, country, and checksum for 80+ countries.',
}
export { default } from './_client'

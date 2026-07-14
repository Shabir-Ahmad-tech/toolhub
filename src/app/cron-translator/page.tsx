import type { Metadata } from 'next'
export { default } from './_client'

export const metadata: Metadata = {
  title: 'Cron Schedule Translator — Decode Cron Expressions to English',
  description: 'Translate cron expressions into plain English. Paste any cron string like "*/15 * * * 1-5" and see the schedule explained in simple language.',
  openGraph: {
    title: 'Cron Schedule Translator — Decode Cron Expressions to English',
    description: 'Translate cron expressions into plain English. Paste any cron string like "*/15 * * * 1-5" and see the schedule explained in simple language.',
  },
}

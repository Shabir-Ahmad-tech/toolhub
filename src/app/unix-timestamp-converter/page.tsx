import type { Metadata } from 'next'
import UnixTimestampClient from './_client'

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter â�--�-- Epoch Time to Date',
  description: 'Convert Unix timestamps (epoch time) to human-readable dates and vice versa. Free online tool for developers to work with Unix time, milliseconds, and UTC formats.',
  openGraph: {
    title: 'Unix Timestamp Converter â�--�-- Epoch Time to Date',
    description: 'Convert Unix timestamps to date/time strings and back. Support for seconds, milliseconds, and UTC formats.',
    type: 'website',
  }
}

export default function Page() {
  return <UnixTimestampClient />
}



import type { Metadata } from "next"
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Footer } from "@/components/layout/Footer"
import { CommandPalette } from "@/components/ui/CommandPalette"
import { TopBar } from "@/components/layout/TopBar"
import { ToastProvider } from "@/components/ui/Toast"
import { ScrollToTop } from "@/components/ui/ScrollToTop"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-tools",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://krumb.dev"),
  title: {
    default:
      "ToolHub — 46 Free Developer Tools: JSON Formatter, Regex Tester, Code Beautifier & More",
    template: "%s — ToolHub | KRUMB.DEV",
  },
  description:
    "46 free online developer tools — JSON formatter, JWT decoder, regex tester, code beautifier, password generator, base64 encoder, and more. No signup, no upload, instant results.",
  keywords: [
    "free developer tools", "online developer tools", "dev tools online",
    "JSON formatter", "JWT decoder", "regex tester", "code formatter",
    "base64 encoder", "URL encoder", "password generator",
    "UUID generator", "hash generator", "diff checker",
    "Unix timestamp converter", "YAML to JSON", "HTML playground",
    "free online tools for developers", "dev utilities",
  ],
  openGraph: {
    title:
      "ToolHub — 46 Free Developer Tools: JSON Formatter, Regex Tester, Code Beautifier & More",
    description:
      "46 free online developer tools. JSON formatter, JWT decoder, regex tester, code beautifier, generators, converters & more. No signup, no upload.",
    type: "website",
    siteName: "KRUMB.DEV",
    locale: "en_US",
    images: [
      {
        url: "/krumb-icon.svg",
        width: 1200,
        height: 1200,
        alt: "KRUMB.DEV — Free Developer Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@krumbdev",
    title: "ToolHub — 46 Free Developer Tools: JSON Formatter, Regex Tester, Code Beautifier & More",
    description:
      "46 free online developer tools. JSON formatter, JWT decoder, regex tester, code beautifier, generators, converters & more. No signup, no upload.",
  },
  alternates: {
    canonical: "https://krumb.dev",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#000000] dark:bg-[#000000] text-[#F9F9F9] font-sans"
        suppressHydrationWarning
      >
        {/* Organization + WebSite JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "KRUMB.DEV",
                url: "https://krumb.dev",
                logo: "https://krumb.dev/logo.png",
                sameAs: [
                  "https://github.com/krumbdev",
                  "https://x.com/krumbdev",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "KRUMB.DEV",
                url: "https://krumb.dev",
                description:
                  "Free online developer tools — JSON formatter, JWT decoder, regex tester, code beautifier, and more. No signup, no upload.",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://krumb.dev/tools?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        {/* CRT ambient overlays — fixed, pointer-events: none */}
        <div className="crt-grid" aria-hidden="true" />
        <div className="crt-scanlines" aria-hidden="true" />
        <div className="crt-noise" aria-hidden="true" />
        <div className="crt-vignette" aria-hidden="true" />

        <ToastProvider>
          <main className="flex-1 relative z-10">
            <TopBar />
            {children}
          </main>

          <Footer />
          <CommandPalette />
          <ScrollToTop />
        </ToastProvider>
      </body>
    </html>
  )
}

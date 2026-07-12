import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About KRUMB.DEV — Private, Local-First Online Utilities',
  description: 'Learn about KRUMB.DEV: the private-by-design utility portal built for developers. Fully local browser execution, zero file uploads.',
  alternates: {
    canonical: './'
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 max-w-4xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="space-y-4 border-b border-[#333333] pb-8">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-[#F9F9F9] tracking-tight">
            <span className="text-[#00FF41] font-mono text-xl mr-3">&gt;</span>ABOUT_US
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
            SYSTEM_DESC: An open, private-by-design, local-first utility workspace for modern web engineers.
          </p>
        </div>

        {/* Core Principles Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="border border-[#333333] p-6 hover:border-[#00FF41] transition-colors duration-300">
            <h3 className="font-heading text-lg font-bold text-[#F9F9F9] mb-3 flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">01/</span> Local-First Architecture
            </h3>
            <p className="font-mono text-xs text-[#888888] leading-relaxed">
              Every operation — from cryptographic key generation to JSON formatting — is executed entirely within your browser's JavaScript sandbox. No input payloads, raw files, or secret tokens are ever transmitted to any external server.
            </p>
          </div>

          <div className="border border-[#333333] p-6 hover:border-[#00FF41] transition-colors duration-300">
            <h3 className="font-heading text-lg font-bold text-[#F9F9F9] mb-3 flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">02/</span> Zero Tracking Policy
            </h3>
            <p className="font-mono text-xs text-[#888888] leading-relaxed">
              ToolHub maintains a strict privacy policy. There are no tracking scripts, database logging systems, session records, or intrusive cookies. Your data never leaves your environment.
            </p>
          </div>

          <div className="border border-[#333333] p-6 hover:border-[#00FF41] transition-colors duration-300">
            <h3 className="font-heading text-lg font-bold text-[#F9F9F9] mb-3 flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">03/</span> WebAssembly Execution
            </h3>
            <p className="font-mono text-xs text-[#888888] leading-relaxed">
              For complex runtimes like Python execution and parsing engines, we use WebAssembly (WASM) and local iframe sandboxes to deliver desktop-grade performance without server dependencies.
            </p>
          </div>

          <div className="border border-[#333333] p-6 hover:border-[#00FF41] transition-colors duration-300">
            <h3 className="font-heading text-lg font-bold text-[#F9F9F9] mb-3 flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">04/</span> Developer UX First
            </h3>
            <p className="font-mono text-xs text-[#888888] leading-relaxed">
              No login walls, no cookie consents, and no advertisement banners. We focus on lightweight assets, fast interactions, and a clean, command-line-inspired user interface optimized for daily developer use.
            </p>
          </div>
        </div>

        {/* Detailed Philosophy */}
        <div className="space-y-6 font-mono text-xs md:text-sm text-[#888888] leading-relaxed border-t border-[#333333] pt-8">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-[#F9F9F9] uppercase">
            The Philosophy of KRUMB.DEV
          </h2>
          <p>
            The modern web has become increasingly centralized, with simple tasks requiring round-trips to remote cloud services. This poses significant security risks when handling confidential data (such as user records, internal configuration variables, or production access tokens).
          </p>
          <p>
            KRUMB.DEV addresses this by building web utilities that run entirely client-side. By leveraging advanced Web APIs and client-side sandboxes, we ensure that your development activities remain private and secure without sacrificing convenience.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-[#333333]">
          <Link
            href="/tools"
            className="terminal-btn"
          >
            [<span className="green-chevron">&gt;</span> Explore Dev Suite]
          </Link>
          <Link
            href="/privacy"
            className="terminal-btn text-[#888888] hover:text-[#00FF41]"
          >
            [<span className="green-chevron">&gt;</span> Data Security details]
          </Link>
        </div>

      </div>
    </div>
  )
}

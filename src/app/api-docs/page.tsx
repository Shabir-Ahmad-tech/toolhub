import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation',
  description: 'KRUMB.DEV API reference — all tools run client-side, there is no server API to document. Every tool works entirely in your browser.',
  alternates: {
    canonical: './'
  }
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F9F9F9]">
      <div className="pt-24 md:pt-32 pb-16 px-6 md:px-10 space-y-10">
        <div className="space-y-4 border-b border-[#333333] pb-6">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F9F9F9] leading-none tracking-tight">
            <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> API DOCUMENTATION
          </h1>
          <p className="font-mono text-xs md:text-sm text-[#888888]">
            <span className="text-[#555555]">#</span> There is no API. Everything runs in your browser.
          </p>
        </div>

        <div className="space-y-10 font-mono text-xs md:text-sm text-[#888888] leading-relaxed">
          <section className="space-y-3 border-l-2 border-[#333333] pl-5">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
              <span className="text-[#00FF41] font-mono text-sm">01</span>
              NO SERVER, NO API
            </h2>
          <p>
            Every tool on KRUMB.DEV runs entirely in your browser. There are no backend servers, no API endpoints, and no data transmission. This is intentional — your data never leaves your device.
          </p>
          <p>
            If you need to integrate these tools programmatically, you can inspect the source code directly. Each tool is built with standard JavaScript and works independently of any server infrastructure.
          </p>
        </section>

        <section className="space-y-3 border-l-2 border-[#333333] pl-5">
          <h2 className="font-heading text-lg md:text-xl font-bold text-[#F9F9F9] flex items-center gap-2">
            <span className="text-[#00FF41] font-mono text-sm">02</span>
            USING THE TOOLS PROGRAMMATICALLY
          </h2>
          <p>
            Since every tool is client-side, you can open your browser&apos;s developer tools, inspect the JavaScript, and reuse the logic in your own projects. The site is open for you to learn from and build upon.
          </p>
        </section>
      </div>

      {/* Terminal footer */}
      <div className="border-t border-[#333333] pt-6">
        <p className="font-mono text-[10px] text-[#555555]">
          <span className="text-[#444444]">$</span> EOF — End of API documentation
        </p>
      </div>
    </div>
  </div>
  )
}

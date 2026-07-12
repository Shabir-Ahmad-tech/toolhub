import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] px-6 md:px-10 pt-24 md:pt-32">
      <div className="space-y-4">
        <h1 className="text-6xl md:text-8xl font-heading font-bold text-[#F9F9F9] leading-none tracking-tight">
          <span className="text-[#00FF41] font-mono text-lg mr-3">$</span> 404
        </h1>
        <p className="font-mono text-xs md:text-sm text-[#888888]">
          <span className="text-[#555555]">#</span> Page not found
        </p>
        <Link
          href="/"
          className="terminal-btn mt-6 inline-flex"
        >
          [ <span className="green-chevron">&gt;</span> Go Home ]
        </Link>
      </div>
    </div>
  )
}

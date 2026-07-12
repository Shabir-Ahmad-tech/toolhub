import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Tools', href: '/tools' },
  { name: 'About', href: '/about' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
  { name: 'Report Bug', href: '/report-bug' },
]

export function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-[#333333] mt-16 select-none">
      <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-6">
        {/* Left: Brand + copyright + [ SYSTEM OFFLINE ] */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-xs font-mono text-[#888888]">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
          </span>
          <span className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">
            [ SYSTEM OFFLINE ]
          </span>
        </div>

        {/* Right: Terminal-style nav links */}
        <nav className="flex items-center gap-4 flex-wrap justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="terminal-btn"
            >
              [<span className="green-chevron">&gt;</span> {link.name}]
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

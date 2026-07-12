'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

/**
 * TopBar — Kinetic Terminal header for all pages.
 * Layout: Logo icon (left) → nav links (center desktop, hidden mobile with hamburger)
 * → KRUMB.DEV (right)
 * Pure terminal style — no backgrounds, no rectangles, just text.
 * Mobile: hamburger menu with overlay.
 */
export function TopBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isHome = pathname === '/'
  const isTools = pathname === '/tools'
  const isAbout = pathname === '/about'
  const isPrivacy = pathname === '/privacy'
  const isReportBug = pathname === '/report-bug'

  const navLinks = [
    { href: '/', label: 'Home', active: isHome },
    { href: '/tools', label: 'Tools', active: isTools },
    { href: '/about', label: 'About', active: isAbout },
    { href: '/report-bug', label: 'Report Bug', active: isReportBug },
  ]

  return (
    <>
      <div className="flex items-center justify-between md:grid md:grid-cols-3 py-4 md:py-4 border-b border-[#333333] bg-transparent relative z-20">
        {/* Left: Desktop nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6 justify-self-start">
          {navLinks.map((link) =>
            link.active ? (
              <span key={link.href} className="terminal-nav-link-active font-mono text-xs uppercase tracking-wider">
                [<span className="text-[#555555]">&gt;</span> {link.label}]
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="terminal-nav-link"
              >
                [<span className="green-chevron">&gt;</span> {link.label}]
              </Link>
            )
          )}
        </nav>

        {/* Center: Logo */}
        <Link
          href="/"
          className="flex items-center justify-center md:justify-self-center"
          aria-label="KRUMB.DEV Home"
        >
          <img src="/icons/logo-icon.svg" alt="K" className="w-10 h-10 md:w-12 md:h-12" />
        </Link>

        {/* Right: Terminal prompt (desktop) + Mobile controls */}
        <div className="flex items-center gap-3 justify-self-end">
          {/* Desktop prompt */}
          <span className="hidden md:inline-flex items-center gap-2 font-mono text-sm text-[#00FF41] font-bold">
            <span className="text-[#F9F9F9]">dev</span>@
            <span className="text-[#00FF41]">krumb.dev</span>:<span className="text-[#F9F9F9]">~</span>$
            <span className="inline-block w-[6px] h-4 md:h-5 bg-[#00FF41] animate-terminal-blink" />
          </span>

          {/* Mobile: prompt + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <span className="font-mono text-xs text-[#00FF41] font-bold">
              krumb.dev:~$
            </span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="terminal-btn p-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay — click background to close */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#000000]/95 flex flex-col pt-20 px-6 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link) =>
              link.active ? (
                <span
                  key={link.href}
                  className="font-mono text-base uppercase tracking-wider text-[#555555] select-none py-2"
                >
                  [<span className="text-[#555555]">&gt;</span> {link.label}]
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-base uppercase tracking-wider text-[#F9F9F9] hover:text-[#00FF41] transition-none py-2"
                >
                  [<span className="text-[#00FF41]">&gt;</span> {link.label}]
                </Link>
              )
            )}
          </nav>
          <div className="mt-auto pb-10 text-center">
            <span className="font-mono text-sm text-[#555555]">
              dev@krumb.dev:~$ <span className="animate-terminal-blink">_</span>
            </span>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

// ─── Glitch character pool ──────────────────────────────────────────────
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#$%&@0123456789'

// ─── Error log lines (terminal output) ──────────────────────────────────
const ERROR_LOG = [
  { prefix: 'ERROR', text: 'route_not_found: target path does not exist in filesystem', delay: 600 },
  { prefix: 'WARN',  text: 'dns_resolve failed — A record for requested path returned NXDOMAIN', delay: 1400 },
  { prefix: 'FATAL', text: 'http_404: resource not found on this server', delay: 2200 },
  { prefix: 'SYS',   text: 'suggesting fallback: redirect to /', delay: 3000 },
]

export default function NotFound() {
  const [glitchText, setGlitchText] = useState('404')
  const [logs, setLogs] = useState<typeof ERROR_LOG>([])
  const [booted, setBooted] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── 404 glitch scramble ────────────────────────────────────────────────
  useEffect(() => {
    let frame: ReturnType<typeof setTimeout>
    let step = 0
    const TOTAL_STEPS = 12

    const scramble = () => {
      if (step >= TOTAL_STEPS) {
        setGlitchText('404')
        return
      }
      const chars = '404'.split('').map(c => {
        if (Math.random() > 0.3) {
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        }
        return c
      })
      setGlitchText(chars.join(''))
      step++
      frame = setTimeout(scramble, 80 + Math.random() * 60)
    }

    const timer = setTimeout(scramble, 300)
    return () => { clearTimeout(timer); clearTimeout(frame) }
  }, [])

  // ── Terminal log reveal ────────────────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    ERROR_LOG.forEach((entry, i) => {
      const t = setTimeout(() => {
        setLogs(prev => [...prev, entry])
        if (i === ERROR_LOG.length - 1) {
          setTimeout(() => setBooted(true), 600)
        }
      }, entry.delay)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // ── Mouse position for glitch intensity ────────────────────────────────
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMouseX(((e.clientX - rect.left) / rect.width - 0.5) * 2)
      setMouseY(((e.clientY - rect.top) / rect.height - 0.5) * 2)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const glitchIntensity = Math.min(1, Math.abs(mouseX) + Math.abs(mouseY))
  const glitchOffsetX = mouseX * 6 * glitchIntensity
  const glitchOffsetY = mouseY * 4 * glitchIntensity

  return (
    <div
      ref={containerRef}
      className="relative min-h-[80vh] px-6 md:px-10 pt-16 md:pt-24 overflow-hidden select-none"
    >
      {/* ── Ambient glitch bars ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-[18%] left-0 h-[2px] bg-[#00FF41] opacity-20"
          style={{ width: `${30 + Math.abs(mouseX) * 20}%`, transform: `translateX(${mouseX * 10}px)` }}
        />
        <div
          className="absolute top-[42%] right-0 h-[1px] bg-[#FF0040] opacity-15"
          style={{ width: `${25 + Math.abs(mouseY) * 15}%`, transform: `translateX(${mouseY * -8}px)` }}
        />
        <div
          className="absolute bottom-[30%] left-[20%] h-[1px] bg-[#00FF41] opacity-10"
          style={{ width: `${20 + Math.abs(mouseX) * 25}%` }}
        />
        <div
          className="absolute top-[60%] right-[10%] h-[2px] bg-[#0088FF] opacity-10"
          style={{ width: `${15 + Math.abs(mouseY) * 20}%` }}
        />
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="relative z-10">
        {/* 404 Heading with glitch */}
        <div className="space-y-2 mb-8">
          <div
            className="relative inline-block"
            style={{
              transform: `translate(${glitchOffsetX}px, ${glitchOffsetY}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Glitch ghost layers */}
            <span
              className="absolute inset-0 text-7xl md:text-9xl font-heading font-bold leading-none tracking-tight text-[#FF0040] opacity-40"
              style={{
                clipPath: 'inset(20% 0 40% 0)',
                transform: `translate(${-4 - glitchOffsetX * 0.3}px, ${-2}px)`,
              }}
              aria-hidden="true"
            >
              {glitchText}
            </span>
            <span
              className="absolute inset-0 text-7xl md:text-9xl font-heading font-bold leading-none tracking-tight text-[#00BFFF] opacity-40"
              style={{
                clipPath: 'inset(55% 0 10% 0)',
                transform: `translate(${4 + glitchOffsetX * 0.3}px, ${2}px)`,
              }}
              aria-hidden="true"
            >
              {glitchText}
            </span>

            {/* Main 404 */}
            <h1 className="text-7xl md:text-9xl font-heading font-bold text-[#F9F9F9] leading-none tracking-tight relative">
              <span className="text-[#00FF41] font-mono text-lg md:text-xl mr-3 align-middle">$</span>
              {glitchText}
              <span className="animate-terminal-blink text-[#00FF41] font-mono text-2xl md:text-4xl ml-2">_</span>
            </h1>
          </div>

          <p className="font-mono text-xs md:text-sm text-[#555555]">
            <span className="text-[#555555]">#</span> exit_code: 404 — resource not found
          </p>
        </div>

        {/* ── Terminal error log ────────────────────────────────────── */}
        <div className="font-mono text-xs space-y-1.5 mb-8 max-w-xl">
          {logs.map((entry, i) => (
            <div
              key={i}
              className="boot-line-enter flex items-start gap-2"
              style={{ animationDelay: '0s' }}
            >
              <span
                className={
                  entry.prefix === 'ERROR'
                    ? 'text-[#FF0040]'
                    : entry.prefix === 'WARN'
                    ? 'text-[#FF8800]'
                    : 'text-[#00FF41]'
                }
              >
                [{entry.prefix}]
              </span>
              <span className="text-[#AAAAAA]">{entry.text}</span>
            </div>
          ))}

          {/* Blinking cursor after log */}
          {logs.length === ERROR_LOG.length && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#00FF41]">$</span>
              <span className="text-[#F9F9F9]">redirecting...</span>
              <span className="animate-terminal-blink text-[#00FF41]">_</span>
            </div>
          )}
        </div>

        {/* ── Action buttons ────────────────────────────────────────── */}
        {booted && (
          <div className="space-x-4 animate-fade-in-up">
            <Link
              href="/"
              className="terminal-btn terminal-btn-lg inline-flex"
            >
              [ <span className="green-chevron">&gt;</span> Go Home ]
            </Link>
            <Link
              href="/tools"
              className="terminal-btn terminal-btn-lg inline-flex"
            >
              [ <span className="green-chevron">&gt;</span> All Tools ]
            </Link>
          </div>
        )}

        {/* ── ASCII art ─────────────────────────────────────────────── */}
        <pre className="font-mono text-[#1a1a1a] text-[6px] md:text-[8px] leading-[1.1] mt-12 select-none pointer-events-none">
{`   .--.    ___       ___       ___       ___       ___       ___       ___       ___       ___       ___       ___       ___  `}
{`  /    \\  |   \\     /   \\     |   \\     /   \\     |   \\     /   \\     |   \\     /   \\     |   \\     /   \\     |   \\     /   \\ `}
{` /  /\\  \\ |    \\   /     \\    |    \\   /     \\    |    \\   /     \\    |    \\   /     \\    |    \\   /     \\    |    \\   /     \\`}
{`|  |  |  ||  |\\ \\ /  /\\   \\   |  |\\ \\ /  /\\   \\   |  |\\ \\ /  /\\   \\   |  |\\ \\ /  /\\   \\   |  |\\ \\ /  /\\   \\   |  |\\ \\ /  /\\   \\`}
{`|  |  |  ||  | \\   /  /__\\   \\ |  | \\   /  /__\\   \\ |  | \\   /  /__\\   \\ |  | \\   /  /__\\   \\ |  | \\   /  /__\\   \\ |  | \\   /  /__\\  `}
{`|  |  |  ||  |  \\ /  /    \\   \\|  |  \\ /  /    \\   \\|  |  \\ /  /    \\   \\|  |  \\ /  /    \\   \\|  |  \\ /  /    \\   \\|  |  \\ /  /    \\`}
{`|  \\ \\/ /  |  |   /  /      \\   |  |   /  /      \\   |  |   /  /      \\   |  |   /  /      \\   |  |   /  /      \\   |  |   /  /      \\`}
{` \\  \\/  /  |__|  /__/        \\__|__|  /__/        \\__|__|  /__/        \\__|__|  /__/        \\__|__|  /__/        \\__|__|  /__/        \\`}
{`  \\____/                                                                                                                           `}
{`                                                                                                                                   `}
{`   ██████   ██████  ██   ██                    ███████ ███████ ███████ ██████   ██████  ██████                                      `}
{`  ██       ██    ██ ██   ██                    ██      ██      ██      ██   ██ ██    ██ ██   ██                                     `}
{`  ██   ███ ██    ██ ███████                    █████   █████   █████   ██████  ██    ██ ██████                                      `}
{`  ██    ██ ██    ██     ██                    ██      ██      ██      ██   ██ ██    ██ ██   ██                                     `}
{`   ██████   ██████      ██                    ██      ███████ ███████ ██   ██  ██████  ██   ██                                     `}
{`                                                                                                                                   `}
{`   ██████  ███████  ██████  ██████  ██████  ██████                                                                                 `}
{`  ██      ██      ██    ██    ██  ██    ██    ██                                                                                   `}
{`  ██      █████   ██    ██    ██  ██    ██    ██                                                                                   `}
{`  ██      ██      ██    ██    ██  ██    ██    ██                                                                                   `}
{`   ██████ ███████  ██████     ██    ██████     ██                                                                                   `}</pre>
      </div>
    </div>
  )
}

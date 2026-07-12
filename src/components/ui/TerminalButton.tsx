import { type ReactNode } from 'react'
import Link from 'next/link'

interface TerminalButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  external?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
  title?: string
}

/**
 * TerminalButton — [> text] style terminal button.
 * No rectangles, no backgrounds. Just brackets with green glow on hover.
 */
export function TerminalButton({
  children,
  onClick,
  href,
  external,
  className = '',
  disabled = false,
  type = 'button',
  title,
}: TerminalButtonProps) {
  const sizeClass = 'terminal-btn'
  const classes = `${sizeClass} ${className}`.trim()

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} title={title}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes} title={title}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} title={title}>
      {children}
    </button>
  )
}

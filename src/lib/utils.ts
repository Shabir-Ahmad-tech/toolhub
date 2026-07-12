import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function trackToolUsage(toolSlug: string): void {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: toolSlug }),
      keepalive: true
    }).catch(() => {})

    // Save to localStorage for "Recently Used" feature
    if (typeof window !== 'undefined') {
      const recent = JSON.parse(localStorage.getItem('toolhub-recent') || '[]') as string[]
      const updated = [toolSlug, ...recent.filter(s => s !== toolSlug)].slice(0, 10)
      localStorage.setItem('toolhub-recent', JSON.stringify(updated))
    }
  } catch {
    // Silently fail
  }
}

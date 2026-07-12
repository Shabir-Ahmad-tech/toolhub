'use client'

import { useState, useCallback, useRef } from 'react'

const CHARS = '$#@%&?*!<>~^'

/**
 * useTextScramble
 * Animates text by cycling through random symbols before settling on the final string.
 * Mimics the "Matrix decrypt" effect from the Kinetic Terminal design system.
 *
 * @param duration - Duration of scramble in ms (default 500)
 * @returns [displayText, scramble] — displayText is the current animated string, scramble() starts the effect
 */
export function useTextScramble(duration: number = 500): [string, (final: string) => void] {
  const [displayText, setDisplayText] = useState('')
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const finalRef = useRef('')

  const scramble = useCallback((final: string) => {
    finalRef.current = final

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    const len = final.length
    startRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Build scrambled string
      let result = ''
      const revealCount = Math.floor(progress * len)

      for (let i = 0; i < len; i++) {
        if (i < revealCount) {
          result += final[i]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }

      setDisplayText(result)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayText(final)
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(animate)
  }, [duration])

  return [displayText, scramble]
}

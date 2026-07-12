'use client'

import { useEffect, useRef } from 'react'

/**
 * CRT Noise Overlay
 * Subtle animated SVG noise overlay using feTurbulence.
 * Breaks up the digital perfection of the pure black background.
 * Low opacity so it never impairs text readability.
 */
export function CrtNoise() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    // Frame-by-frame noise at very low opacity
    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      const imageData = ctx.createImageData(w, h)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255
        data[i] = val
        data[i + 1] = val
        data[i + 2] = val
        data[i + 3] = 12 // very low alpha
      }

      ctx.putImageData(imageData, 0, 0)
      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]"
      aria-hidden="true"
    />
  )
}

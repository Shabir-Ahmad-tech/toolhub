'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID?.() ?? Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 border transition-none animate-glitch-flash ${
              t.type === 'success'
                ? 'bg-[#000000] border-[#00FF41] border-t-[4px] border-r-[4px] border-b-[4px] border-l-[4px]'
                : t.type === 'error'
                ? 'bg-[#F9F9F9] text-[#000000] border border-[#000000] relative overflow-hidden'
                : 'bg-[#000000] border border-[#F9F9F9] text-[#F9F9F9]'
            }`}
          >
            {/* Hazard stripe for errors */}
            {t.type === 'error' && (
              <div
                className="absolute left-0 top-0 bottom-0 w-3"
                style={{
                  background: `repeating-linear-gradient(
                    45deg,
                    #000000,
                    #000000 4px,
                    #F9F9F9 4px,
                    #F9F9F9 8px
                  )`,
                }}
              />
            )}
            <p className={`text-sm font-mono flex-1 leading-relaxed relative z-10 ${
              t.type === 'error' ? 'text-[#000000] pl-4' : ''
            }`}>
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-0.5 rounded hover:bg-[#333333]/50 transition-none relative z-10"
            >
              <X className="w-4 h-4 text-current" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

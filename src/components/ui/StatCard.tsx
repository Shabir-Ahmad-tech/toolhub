import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  color?: 'green' | 'red' | 'amber' | 'blue' | 'indigo' | 'purple' | 'pink' | 'teal' | 'cyan' | 'orange' | 'rose' | 'violet' | 'slate' | 'emerald'
  className?: string
}

const colorMap: Record<string, string> = {
  green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  amber: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800',
  purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  pink: 'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800',
  teal: 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800',
  cyan: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
  rose: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
  violet: 'bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800',
  slate: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
  emerald: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
}

const textColorMap: Record<string, string> = {
  green: 'text-green-800 dark:text-green-300',
  red: 'text-red-800 dark:text-red-300',
  amber: 'text-amber-800 dark:text-amber-300',
  blue: 'text-blue-800 dark:text-blue-300',
  indigo: 'text-indigo-800 dark:text-indigo-300',
  purple: 'text-purple-800 dark:text-purple-300',
  pink: 'text-pink-800 dark:text-pink-300',
  teal: 'text-teal-800 dark:text-teal-300',
  cyan: 'text-cyan-800 dark:text-cyan-300',
  orange: 'text-orange-800 dark:text-orange-300',
  rose: 'text-rose-800 dark:text-rose-300',
  violet: 'text-violet-800 dark:text-violet-300',
  slate: 'text-slate-800 dark:text-slate-300',
  emerald: 'text-emerald-800 dark:text-emerald-300',
}

export function StatCard({ label, value, color = 'blue', className }: StatCardProps) {
  return (
    <div className={cn('p-4 rounded-lg border text-center', colorMap[color], className)}>
      <p className={cn('text-xs font-medium opacity-75', textColorMap[color])}>{label}</p>
      <p className={cn('text-xl font-bold mt-1', textColorMap[color])}>{value}</p>
    </div>
  )
}
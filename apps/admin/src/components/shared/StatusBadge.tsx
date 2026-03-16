import { cn } from '@/lib/utils'

export const statusConfig = {
  new:       { label: 'Novo',            classes: 'bg-blue-700/20  text-blue-200  border-blue-700/30' },
  contacted: { label: 'Contactado',      classes: 'bg-yellow-800/20 text-yellow-200 border-yellow-700/30' },
  scheduled: { label: 'Visita Agendada', classes: 'bg-purple-900/20 text-purple-200 border-purple-700/30' },
  visited:   { label: 'Visitou',         classes: 'bg-orange-800/20 text-orange-200 border-orange-700/30' },
  converted: { label: 'Convertido',      classes: 'bg-green-900/20  text-green-200  border-green-700/30' },
  discarded: { label: 'Descartado',      classes: 'bg-white/5       text-gray-500   border-white/10' },
} as const

export type Status = keyof typeof statusConfig

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  if (!config) return null
  const { label, classes } = config

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        classes,
        className
      )}
    >
      {label}
    </span>
  )
}

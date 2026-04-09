import { cn } from '@/lib/utils'

export const statusConfig = {
  new:      { label: 'Novo',      classes: 'bg-blue-700/20  text-blue-200  border-blue-700/30' },
  frequent: { label: 'Frequente', classes: 'bg-green-900/20 text-green-200 border-green-700/30' },
  blocked:  { label: 'Bloqueado', classes: 'bg-red-900/20   text-red-200   border-red-700/30' },
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

import { cn } from '@/lib/utils'

const priorityConfig = {
  high:   { label: 'Alta',   dotClass: 'bg-red-500' },
  medium: { label: 'Média',  dotClass: 'bg-amber-500' },
  low:    { label: 'Baixa',  dotClass: 'bg-gray-500' },
} as const

type Priority = keyof typeof priorityConfig

interface PriorityIndicatorProps {
  priority: Priority
  showLabel?: boolean
  className?: string
}

export function PriorityIndicator({
  priority,
  showLabel = true,
  className,
}: PriorityIndicatorProps) {
  const { label, dotClass } = priorityConfig[priority]

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('h-2 w-2 rounded-full', dotClass)} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </span>
  )
}

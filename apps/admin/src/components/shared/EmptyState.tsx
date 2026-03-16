import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-3', className)}>
      <p className="text-sm text-muted-foreground text-center">{message}</p>
      {action}
    </div>
  )
}

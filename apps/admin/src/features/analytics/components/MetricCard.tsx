import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  isLoading?: boolean
  highlight?: 'green' | 'blue' | 'purple' | 'orange'
}

const highlightStyles = {
  green:  'text-green-400',
  blue:   'text-blue-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
}

export function MetricCard({ title, value, description, icon: Icon, isLoading, highlight }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className={cn('text-3xl font-bold', highlight && highlightStyles[highlight])}>
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useLeadActivities } from '../hooks/useLeadActivities'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { LeadStatus } from '../types/lead.types'

const actionLabels: Record<string, string> = {
  created:        'Cliente criado',
  status_changed: 'Status alterado',
  note_added:     'Nota adicionada',
  assigned:       'Responsável atribuído',
  field_updated:  'Dados atualizados',
}

export function LeadHistoryTab({ leadId }: { leadId: string }) {
  const { data: activities, isLoading } = useLeadActivities(leadId)

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />)}
      </div>
    )
  }

  if (!activities?.length) {
    return <p className="text-center text-sm text-muted-foreground py-8">Histórico vazio.</p>
  }

  return (
    <div className="p-4">
      <div className="relative space-y-4">
        {activities.map((activity: any, index: number) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              {index < activities.length - 1 && (
                <div className="flex-1 w-px bg-border mt-1" />
              )}
            </div>
            <div className="pb-4 min-w-0">
              <p className="text-sm font-medium">{actionLabels[activity.action_type] || activity.action_type}</p>
              {activity.action_type === 'status_changed' && activity.from_value && activity.to_value && (
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={activity.from_value as LeadStatus} />
                  <span className="text-xs text-muted-foreground">→</span>
                  <StatusBadge status={activity.to_value as LeadStatus} />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {activity.performer?.full_name} · {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

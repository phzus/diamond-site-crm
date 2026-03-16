'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lead } from '../../types/lead.types'

const priorityBorder: Record<string, string> = {
  high:   'border-l-red-500',
  medium: 'border-l-yellow-400',
  low:    'border-l-green-400',
}

interface KanbanCardProps {
  lead: Lead
  onClick: (leadId: string) => void
}

export function KanbanCard({ lead, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead.id)}
      className={cn(
        'bg-card border border-l-4 rounded-md p-3 space-y-2 cursor-pointer',
        'hover:shadow-md transition-shadow select-none',
        priorityBorder[lead.priority],
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
    >
      <div>
        <p className="text-sm font-medium leading-tight">{lead.full_name}</p>
        <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
      </div>

      {lead.phone && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          {lead.phone}
        </div>
      )}

      <div className="flex items-center justify-between">
        {lead.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {lead.assignee.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{lead.assignee.full_name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Não atribuído</span>
        )}
        <span className="text-xs text-muted-foreground">
          {format(new Date(lead.created_at), 'dd/MM', { locale: ptBR })}
        </span>
      </div>
    </div>
  )
}

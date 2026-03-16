'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '../../types/lead.types'
import { statusConfig } from '@/components/shared/StatusBadge'

interface KanbanColumnProps {
  status: LeadStatus
  leads: Lead[]
  onCardClick: (leadId: string) => void
}

export function KanbanColumn({ status, leads, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const config = statusConfig[status]

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {leads.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'rounded-md p-2 space-y-2 transition-colors',
          'bg-muted/30',
          'min-h-[200px] max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin',
          isOver && 'bg-primary/10 ring-2 ring-primary/30'
        )}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 gap-1 text-muted-foreground/50">
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-current" />
              <span className="text-xs">{config.label}</span>
            </div>
          ) : (
            leads.map((lead) => (
              <KanbanCard key={lead.id} lead={lead} onClick={onCardClick} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

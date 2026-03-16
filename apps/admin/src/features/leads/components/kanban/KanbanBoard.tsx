'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useState, useMemo } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useUpdateLeadStatus } from '../../hooks/useLeads'
import type { Lead, LeadStatus } from '../../types/lead.types'

const KANBAN_COLUMNS: LeadStatus[] = [
  'new', 'contacted', 'scheduled', 'visited', 'converted', 'discarded'
]

interface KanbanBoardProps {
  leads: Lead[]
  onCardClick: (leadId: string) => void
}

export function KanbanBoard({ leads, onCardClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const updateStatus = useUpdateLeadStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const leadsByStatus = useMemo(() => {
    return KANBAN_COLUMNS.reduce((acc, status) => {
      acc[status] = leads.filter(l => l.status === status)
      return acc
    }, {} as Record<LeadStatus, Lead[]>)
  }, [leads])

  const activeLead = leads.find(l => l.id === activeId)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    if (!KANBAN_COLUMNS.includes(newStatus)) return

    updateStatus.mutate({ id: leadId, status: newStatus })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={leadsByStatus[status]}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-2 opacity-90">
            <KanbanCard lead={activeLead} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

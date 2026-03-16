# Task 1 — Kanban Board com Drag & Drop

## Objetivo
Criar a visualização Kanban com 6 colunas de status, cards arrastáveis via @dnd-kit, e optimistic update ao soltar o card em outra coluna.

## Pré-requisitos
- Módulo 03 concluído (hooks e services de leads disponíveis)
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` instalados (task 02-auth-layout/task-1)

## Passos de Implementação

### 1. Criar o card do Kanban
Criar `features/leads/components/kanban/KanbanCard.tsx`:
```typescript
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
```

### 2. Criar a coluna do Kanban
Criar `features/leads/components/kanban/KanbanColumn.tsx`:
```typescript
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
      {/* Header da coluna */}
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Área droppable — scroll interno quando >10 cards (conforme spec §7.4) */}
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-md p-2 space-y-2 transition-colors',
          'bg-muted/30',
          'min-h-[200px] max-h-[calc(100vh-220px)] overflow-y-auto', // scroll interno
          isOver && 'bg-primary/10 ring-2 ring-primary/30'
        )}
      >
        <SortableContext
          items={leads.map(l => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.length === 0 ? (
            // Empty state com ícone sutil (conforme spec §7.9)
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
```

### 3. Criar o Kanban Board principal
Criar `features/leads/components/kanban/KanbanBoard.tsx`:
```typescript
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
      activationConstraint: { distance: 8 }, // Evita ativar drag em cliques
    })
  )

  // Agrupar leads por status
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

    // Verificar se realmente mudou de coluna
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    // Verificar se over.id é uma coluna válida
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

      {/* Card fantasma durante o drag */}
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
```

### 4. Integrar o Kanban na página /leads
Editar `app/(admin)/leads/page.tsx` — substituir o placeholder do Kanban:
```typescript
// Importar no topo:
import { KanbanBoard } from '@/features/leads/components/kanban/KanbanBoard'

// Substituir o placeholder:
{isKanban ? (
  isLoading ? (
    <div className="flex gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[280px] h-64 rounded-md bg-muted animate-pulse" />
      ))}
    </div>
  ) : (
    <KanbanBoard
      leads={data?.data || []}
      onCardClick={(id) => setSelectedLeadId(id)}
    />
  )
) : (
  // ... tabela existente
)}
```

> **Nota importante**: Para o Kanban, usar `pageSize: 200` e sem paginação (buscar todos os leads de uma vez). Ajustar o hook na página quando `isKanban === true`:
> ```typescript
> const { data, isLoading } = useLeads({
>   ...filtros,
>   pageSize: isKanban ? 200 : filters.pageSize,
>   page: isKanban ? 1 : filters.page,
> })
> ```

## Critérios de Conclusão
- [ ] 6 colunas renderizando com labels corretos
- [ ] Cards exibem nome, email, telefone (se houver), responsável e data
- [ ] Borda esquerda do card indica prioridade (vermelho/amarelo/verde)
- [ ] Drag & Drop funciona: arrastar card de uma coluna para outra
- [ ] Status atualiza imediatamente (optimistic update) ao soltar
- [ ] Em caso de erro, card volta à posição original com toast
- [ ] Clicar (sem arrastar) no card abre o Sheet de detalhes
- [ ] Card fantasma (DragOverlay) aparece durante o drag
- [ ] Skeleton de loading no Kanban enquanto carrega
- [ ] Colunas com scroll interno quando há muitos cards

## Arquivos Criados/Modificados
- `features/leads/components/kanban/KanbanCard.tsx`
- `features/leads/components/kanban/KanbanColumn.tsx`
- `features/leads/components/kanban/KanbanBoard.tsx`
- `app/(admin)/leads/page.tsx` (atualizado)

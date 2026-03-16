# Task 2 — DataTable de Leads com Filtros e Busca

## Objetivo
Criar a página `/leads` com DataTable (TanStack Table), filtros por status/prioridade/responsável, busca por texto e paginação, tudo persistido na URL via Nuqs.

## Pré-requisitos
- Task 1 deste módulo concluída (hooks e services)

## Passos de Implementação

### 1. Criar hook de filtros via URL (Nuqs)
Criar `features/leads/hooks/useLeadFilters.ts`:
```typescript
'use client'

import { useQueryStates, parseAsString, parseAsArrayOf, parseAsInteger } from 'nuqs'

export function useLeadFilters() {
  return useQueryStates({
    search:     parseAsString.withDefault(''),
    status:     parseAsArrayOf(parseAsString).withDefault([]),
    priority:   parseAsString.withDefault(''),
    assignedTo: parseAsString.withDefault(''),
    source:     parseAsString.withDefault(''),
    dateFrom:   parseAsString.withDefault(''), // filtro por período — de
    dateTo:     parseAsString.withDefault(''), // filtro por período — até
    page:       parseAsInteger.withDefault(1),
    pageSize:   parseAsInteger.withDefault(25),
    sortBy:     parseAsString.withDefault('created_at'),
    sortOrder:  parseAsString.withDefault('desc'),
    view:       parseAsString.withDefault('list'), // 'list' | 'kanban'
  })
}
```

### 2. Criar componente de StatusBadge
Criar `components/shared/StatusBadge.tsx`:
```typescript
import { Badge } from '@/components/ui/badge'
import type { LeadStatus } from '@/features/leads/types/lead.types'
import { cn } from '@/lib/utils'

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new:       { label: 'Novo',            className: 'bg-blue-500/15 text-blue-600 border-blue-200' },
  contacted: { label: 'Contactado',      className: 'bg-yellow-500/15 text-yellow-600 border-yellow-200' },
  scheduled: { label: 'Visita Agendada', className: 'bg-purple-500/15 text-purple-600 border-purple-200' },
  visited:   { label: 'Visitou',         className: 'bg-orange-500/15 text-orange-600 border-orange-200' },
  converted: { label: 'Convertido',      className: 'bg-green-500/15 text-green-600 border-green-200' },
  discarded: { label: 'Descartado',      className: 'bg-muted text-muted-foreground border-border' },
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}

export { statusConfig }
```

### 3. Criar as colunas do DataTable
Criar `features/leads/components/LeadColumns.tsx`:
```typescript
'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { Lead } from '../types/lead.types'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const priorityConfig = {
  high:   { label: 'Alta',   dot: 'bg-red-500' },
  medium: { label: 'Média',  dot: 'bg-yellow-500' },
  low:    { label: 'Baixa',  dot: 'bg-green-500' },
}

export const leadColumns: ColumnDef<Lead>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'full_name',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        Nome <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.full_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ row }) => row.original.phone || <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'priority',
    header: 'Prioridade',
    cell: ({ row }) => {
      const p = priorityConfig[row.original.priority]
      return (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${p.dot}`} />
          <span className="text-sm">{p.label}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'assigned_to',
    header: 'Responsável',
    cell: ({ row }) => {
      const assignee = row.original.assignee
      if (!assignee) return <span className="text-muted-foreground text-sm">Não atribuído</span>
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {assignee.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{assignee.full_name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        Criado em <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) =>
      format(new Date(row.original.created_at), "dd/MM/yyyy", { locale: ptBR }),
  },
]
```

### 4. Criar a Toolbar de filtros
Criar `features/leads/components/LeadToolbar.tsx`:
```typescript
'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, Download, X, CalendarIcon } from 'lucide-react'
import { useLeadFilters } from '../hooks/useLeadFilters'
import { useDebouncedCallback } from 'use-debounce'
import { useUsers } from '@/features/users/hooks/useUsers'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Dependência adicional necessária:
// pnpm add use-debounce

interface LeadToolbarProps {
  onNewLead: () => void
  onExport: () => void
  selectedCount: number
}

export function LeadToolbar({ onNewLead, onExport, selectedCount }: LeadToolbarProps) {
  const [filters, setFilters] = useLeadFilters()
  const { data: users } = useUsers()

  const handleSearch = useDebouncedCallback((value: string) => {
    setFilters({ search: value, page: 1 })
  }, 300)

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority ||
    filters.search ||
    filters.assignedTo ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="space-y-2">
      {/* Linha 1: busca + filtros secundários + ações */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Buscar por nome ou email..."
          defaultValue={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* Filtro por Prioridade */}
        <Select
          value={filters.priority || 'all'}
          onValueChange={(v) => setFilters({ priority: v === 'all' ? '' : v, page: 1 })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por Responsável */}
        <Select
          value={filters.assignedTo || 'all'}
          onValueChange={(v) => setFilters({ assignedTo: v === 'all' ? '' : v, page: 1 })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unassigned">Não atribuído</SelectItem>
            {users?.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Fonte */}
        <Select
          value={filters.source || 'all'}
          onValueChange={(v) => setFilters({ source: v === 'all' ? '' : v, page: 1 })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fontes</SelectItem>
            <SelectItem value="landing-page">Landing Page</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por Período */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {filters.dateFrom || filters.dateTo
                ? `${filters.dateFrom ? format(new Date(filters.dateFrom), 'dd/MM', { locale: ptBR }) : '?'} → ${filters.dateTo ? format(new Date(filters.dateTo), 'dd/MM', { locale: ptBR }) : '?'}`
                : 'Período'
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 space-y-2" align="start">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">De</label>
              <input
                type="date"
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ dateFrom: e.target.value, page: 1 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Até</label>
              <input
                type="date"
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ dateTo: e.target.value, page: 1 })}
              />
            </div>
            {(filters.dateFrom || filters.dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setFilters({ dateFrom: '', dateTo: '', page: 1 })}
              >
                Limpar período
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ search: '', status: [], priority: '', assignedTo: '', source: '', dateFrom: '', dateTo: '', page: 1 })}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}

        <div className="ml-auto flex gap-2">
          <Button onClick={onNewLead} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Linha 2: Filtro de status (pills multi-select) */}
      <div className="flex gap-2 flex-wrap">
        {(['new', 'contacted', 'scheduled', 'visited', 'converted', 'discarded'] as const).map((s) => {
          const isActive = filters.status.includes(s)
          const labels: Record<string, string> = {
            new: 'Novos', contacted: 'Contactados', scheduled: 'Agendados',
            visited: 'Visitaram', converted: 'Convertidos', discarded: 'Descartados'
          }
          return (
            <button
              key={s}
              onClick={() => {
                const newStatus = isActive
                  ? filters.status.filter(x => x !== s)
                  : [...filters.status, s]
                setFilters({ status: newStatus, page: 1 })
              }}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {labels[s]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

> Os campos `dateFrom`, `dateTo` e `source` já estão incluídos na definição do hook acima.

### 5. Criar a página `/leads`
Criar `app/(admin)/leads/page.tsx` — ver task-3 deste módulo para integração com o Sheet e Kanban.

> Instalar dependência adicional:
> ```bash
> pnpm add use-debounce
> ```

## Critérios de Conclusão
- [ ] Tabela renderiza leads com todas as colunas
- [ ] Busca com debounce de 300ms atualiza a tabela
- [ ] Filtro por status (pills) funciona e persiste na URL
- [ ] Filtro por prioridade funciona e persiste na URL
- [ ] Paginação server-side (25 por página)
- [ ] Ordenação por nome e data funciona
- [ ] Seleção múltipla via checkbox funciona
- [ ] Botão "Limpar filtros" aparece quando há filtros ativos

## Arquivos Criados/Modificados
- `features/leads/hooks/useLeadFilters.ts`
- `components/shared/StatusBadge.tsx`
- `features/leads/components/LeadColumns.tsx`
- `features/leads/components/LeadToolbar.tsx`

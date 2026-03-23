'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, X, CalendarIcon } from 'lucide-react'
import { useLeadFilters } from '../hooks/useLeadFilters'
import { useDebouncedCallback } from 'use-debounce'
import { useUsers } from '@/features/users/hooks/useUsers'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
    !!filters.priority ||
    !!filters.search ||
    !!filters.assignedTo ||
    !!filters.dateFrom ||
    !!filters.dateTo

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Buscar por nome ou email..."
          defaultValue={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />

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
            Novo Cliente
          </Button>
        </div>
      </div>

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

# Task 5 — Página /leads: Integração, Bulk Actions e Exportação CSV

## Objetivo
Montar a página `/leads` completa integrando DataTable, Sheet, Dialogs, filtros, bulk actions e exportação CSV.

## Pré-requisitos
- Tasks 1, 2, 3 e 4 deste módulo concluídas

## Passos de Implementação

### 1. Criar função de exportação CSV
Criar `features/leads/utils/exportCsv.ts`:
```typescript
import Papa from 'papaparse'
import { format } from 'date-fns'
import type { Lead } from '../types/lead.types'

const COLUMN_LABELS: Record<string, string> = {
  id: 'ID',
  full_name: 'Nome',
  email: 'Email',
  phone: 'Telefone',
  status: 'Status',
  priority: 'Prioridade',
  assignee: 'Responsável',
  source: 'Fonte',
  utm_source: 'UTM Source',
  utm_medium: 'UTM Medium',
  utm_campaign: 'UTM Campaign',
  created_at: 'Criado em',
  last_contacted_at: 'Último Contato',
  next_follow_up_at: 'Próximo Follow-up',
}

const EXPORT_LIMIT = 5000

export function exportLeadsToCsv(leads: Lead[], filename = 'diamond-leads') {
  if (leads.length > EXPORT_LIMIT) {
    // Avisar e truncar (toast deve ser chamado no componente pai)
    leads = leads.slice(0, EXPORT_LIMIT)
  }

  const rows = leads.map((lead) => ({
    [COLUMN_LABELS.id]:               lead.id,
    [COLUMN_LABELS.full_name]:        lead.full_name,
    [COLUMN_LABELS.email]:            lead.email,
    [COLUMN_LABELS.phone]:            lead.phone || '',
    [COLUMN_LABELS.status]:           lead.status,
    [COLUMN_LABELS.priority]:         lead.priority,
    [COLUMN_LABELS.assignee]:         lead.assignee?.full_name || '',
    [COLUMN_LABELS.source]:           lead.source,
    [COLUMN_LABELS.utm_source]:       lead.utm_source || '',
    [COLUMN_LABELS.utm_medium]:       lead.utm_medium || '',
    [COLUMN_LABELS.utm_campaign]:     lead.utm_campaign || '',
    [COLUMN_LABELS.created_at]:       format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm'),
    [COLUMN_LABELS.last_contacted_at]: lead.last_contacted_at
      ? format(new Date(lead.last_contacted_at), 'dd/MM/yyyy HH:mm') : '',
    [COLUMN_LABELS.next_follow_up_at]: lead.next_follow_up_at
      ? format(new Date(lead.next_follow_up_at), 'dd/MM/yyyy HH:mm') : '',
  }))

  const csv = Papa.unparse(rows, { delimiter: ';' })
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM para Excel BR
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

### 2. Criar o componente de Bulk Actions
Criar `features/leads/components/BulkActionsBar.tsx`:
```typescript
'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Download } from 'lucide-react'
import { useBulkUpdateStatus, useBulkAssign } from '../hooks/useLeads'
import { useUsers } from '@/features/users/hooks/useUsers'

interface BulkActionsBarProps {
  selectedIds: string[]
  onClear: () => void
  onExport: () => void
}

export function BulkActionsBar({ selectedIds, onClear, onExport }: BulkActionsBarProps) {
  const bulkUpdate = useBulkUpdateStatus()
  const bulkAssign = useBulkAssign()
  const { data: users } = useUsers()

  if (selectedIds.length === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-md">
      <span className="text-sm font-medium">
        {selectedIds.length} lead{selectedIds.length > 1 ? 's' : ''} selecionado{selectedIds.length > 1 ? 's' : ''}
      </span>

      {/* Mudar status em lote */}
      <Select onValueChange={(status) => bulkUpdate.mutate({ ids: selectedIds, status })}>
        <SelectTrigger className="w-44 h-7 text-sm">
          <SelectValue placeholder="Mudar status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="contacted">Contactado</SelectItem>
          <SelectItem value="scheduled">Visita Agendada</SelectItem>
          <SelectItem value="visited">Visitou</SelectItem>
          <SelectItem value="converted">Convertido</SelectItem>
          <SelectItem value="discarded">Descartado</SelectItem>
        </SelectContent>
      </Select>

      {/* Atribuir responsável em lote */}
      <Select onValueChange={(userId) =>
        bulkAssign.mutate({ ids: selectedIds, userId: userId === 'unassigned' ? null : userId })
      }>
        <SelectTrigger className="w-44 h-7 text-sm">
          <SelectValue placeholder="Atribuir a..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Não atribuído</SelectItem>
          {users?.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Exportar
      </Button>

      <Button variant="ghost" size="sm" onClick={onClear}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
```

### 3. Criar a página /leads completa
Criar `app/(admin)/leads/page.tsx`:
```typescript
'use client'

import { useState, useCallback } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { useLeads } from '@/features/leads/hooks/useLeads'
import { useLeadFilters } from '@/features/leads/hooks/useLeadFilters'
import { leadColumns } from '@/features/leads/components/LeadColumns'
import { LeadToolbar } from '@/features/leads/components/LeadToolbar'
import { LeadSheet } from '@/features/leads/components/LeadSheet'
import { CreateLeadDialog } from '@/features/leads/components/CreateLeadDialog'
import { EditLeadDialog } from '@/features/leads/components/EditLeadDialog'
import { BulkActionsBar } from '@/features/leads/components/BulkActionsBar'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, LayoutList, Columns } from 'lucide-react'
import { exportLeadsToCsv } from '@/features/leads/utils/exportCsv'
import type { Lead } from '@/features/leads/types/lead.types'

export default function LeadsPage() {
  const [filters, setFilters] = useLeadFilters()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [editLeadId, setEditLeadId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})

  const { data, isLoading } = useLeads({
    search:      filters.search,
    status:      filters.status as any,
    priority:    filters.priority as any,
    assigned_to: filters.assignedTo,
    page:        filters.page,
    pageSize:    filters.pageSize,
    sortBy:      filters.sortBy,
    sortOrder:   filters.sortOrder as any,
  })

  const table = useReactTable({
    data: data?.data || [],
    columns: leadColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    manualPagination: true,
    pageCount: data?.totalPages || 0,
  })

  const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id)
  const selectedLeads = table.getSelectedRowModel().rows.map(r => r.original)

  function handleExport() {
    const leadsToExport = selectedLeads.length > 0 ? selectedLeads : (data?.data || [])
    if (leadsToExport.length > 5000) {
      toast.warning('Exportação limitada a 5.000 registros. Os primeiros 5.000 serão exportados.')
    }
    exportLeadsToCsv(leadsToExport)
  }

  const isKanban = filters.view === 'kanban'

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Leads"
        description={data ? `${data.count} lead${data.count !== 1 ? 's' : ''} encontrado${data.count !== 1 ? 's' : ''}` : ''}
        actions={
          <div className="flex items-center gap-2 border rounded-md p-0.5">
            <Button
              variant={!isKanban ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilters({ view: 'list' })}
              className="h-7 px-2"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={isKanban ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilters({ view: 'kanban' })}
              className="h-7 px-2"
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Toolbar */}
        <LeadToolbar
          onNewLead={() => setCreateOpen(true)}
          onExport={handleExport}
          selectedCount={selectedIds.length}
        />

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <BulkActionsBar
            selectedIds={selectedIds}
            onClear={() => setRowSelection({})}
            onExport={handleExport}
          />
        )}

        {/* Visualização: Lista ou Kanban */}
        {isKanban ? (
          // Kanban importado na Task 04
          <div className="text-muted-foreground text-sm">Kanban — ver módulo 04</div>
        ) : (
          <>
            {/* Tabela */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {leadColumns.map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={leadColumns.length} className="text-center py-16 text-muted-foreground">
                        {filters.search || filters.status.length > 0
                          ? 'Nenhum lead encontrado com esses filtros.'
                          : 'Nenhum lead ainda. Os primeiros chegarão pela landing page.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedLeadId(row.original.id)}
                        data-state={row.getIsSelected() ? 'selected' : ''}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {filters.page} de {data.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ page: filters.page - 1 })}
                    disabled={filters.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ page: filters.page + 1 })}
                    disabled={filters.page >= data.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modais */}
      <LeadSheet
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onEdit={(id) => { setEditLeadId(id); setSelectedLeadId(null) }}
      />
      <CreateLeadDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditLeadDialog leadId={editLeadId} onClose={() => setEditLeadId(null)} />
    </div>
  )
}
```

## Critérios de Conclusão
- [ ] Página `/leads` renderiza sem erros
- [ ] Toggle lista/kanban funciona e persiste na URL
- [ ] Clicar na linha abre o Sheet de detalhes
- [ ] Bulk actions aparecem quando há seleção
- [ ] Exportação CSV gera arquivo com as colunas corretas
- [ ] Paginação funciona corretamente
- [ ] Empty states exibidos quando sem dados ou sem resultados nos filtros

## Arquivos Criados/Modificados
- `features/leads/utils/exportCsv.ts`
- `features/leads/components/BulkActionsBar.tsx`
- `app/(admin)/leads/page.tsx`

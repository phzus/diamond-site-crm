'use client'

import { useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { useLeads, useLeadsRealtime } from '@/features/leads/hooks/useLeads'
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
import { KanbanBoard } from '@/features/leads/components/kanban/KanbanBoard'
import { toast } from 'sonner'
import type { Lead } from '@/features/leads/types/lead.types'

export function LeadsPageContent() {
  useLeadsRealtime()
  const [filters, setFilters] = useLeadFilters()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [editLeadId, setEditLeadId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})

  const isKanban = filters.view === 'kanban'

  const { data, isLoading } = useLeads({
    search:      filters.search || undefined,
    status:      (filters.status as any) || undefined,
    priority:    (filters.priority as any) || undefined,
    assigned_to: filters.assignedTo || undefined,
    source:      (filters.source as any) || undefined,
    dateFrom:    filters.dateFrom || undefined,
    dateTo:      filters.dateTo || undefined,
    page:        isKanban ? 1 : filters.page,
    pageSize:    isKanban ? 200 : filters.pageSize,
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

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Clientes"
        description={data ? `${data.count} cliente${data.count !== 1 ? 's' : ''} encontrado${data.count !== 1 ? 's' : ''}` : ''}
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
        <LeadToolbar
          onNewLead={() => setCreateOpen(true)}
          onExport={handleExport}
          selectedCount={selectedIds.length}
        />

        {selectedIds.length > 0 && (
          <BulkActionsBar
            selectedIds={selectedIds}
            onClear={() => setRowSelection({})}
            onExport={handleExport}
          />
        )}

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
          <>
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
                          : 'Nenhum cliente ainda. Os primeiros chegarão pela landing page.'}
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

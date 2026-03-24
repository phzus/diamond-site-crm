'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { Lead } from '../types/lead.types'
import type { LeadStatus } from '../types/lead.types'
import { StatusBadge, statusConfig } from '@/components/shared/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import { useUpdateLeadStatus } from '../hooks/useLeads'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const STATUS_OPTIONS = Object.keys(statusConfig) as LeadStatus[]

function StatusCell({ lead }: { lead: Lead }) {
  const updateStatus = useUpdateLeadStatus()
  const { data: currentUser } = useCurrentUser()

  return (
    <Select
      value={lead.status}
      onValueChange={(value) => {
        updateStatus.mutate({
          id: lead.id,
          status: value as LeadStatus,
          fromStatus: lead.status,
          userId: currentUser?.id,
        })
      }}
    >
      <SelectTrigger
        className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <StatusBadge status={lead.status} />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s}>
            <StatusBadge status={s} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const priorityConfig = {
  high:   { label: 'Alta',  dot: 'bg-red-500' },
  medium: { label: 'Média', dot: 'bg-yellow-500' },
  low:    { label: 'Baixa', dot: 'bg-green-500' },
}

export function createLeadColumns(onDelete: (lead: Lead) => void): ColumnDef<Lead>[] {
  return [
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
      cell: ({ row }) => <StatusCell lead={row.original} />,
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
        format(new Date(row.original.created_at), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:bg-destructive hover:text-white"
          onClick={(e) => { e.stopPropagation(); onDelete(row.original) }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]
}

/** @deprecated use createLeadColumns */
export const leadColumns = createLeadColumns(() => {})

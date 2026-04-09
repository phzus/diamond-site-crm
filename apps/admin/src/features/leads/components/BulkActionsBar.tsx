'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Download, Trash2 } from 'lucide-react'
import { useBulkUpdateStatus, useBulkAssign } from '../hooks/useLeads'
import { useUsers } from '@/features/users/hooks/useUsers'

interface BulkActionsBarProps {
  selectedIds: string[]
  onClear: () => void
  onExport: () => void
  onDelete: () => void
  isAdmin?: boolean
}

export function BulkActionsBar({ selectedIds, onClear, onExport, onDelete, isAdmin }: BulkActionsBarProps) {
  const bulkUpdate = useBulkUpdateStatus()
  const bulkAssign = useBulkAssign()
  const { data: users } = useUsers()

  if (selectedIds.length === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-md">
      <span className="text-sm font-medium">
        {selectedIds.length} cliente{selectedIds.length > 1 ? 's' : ''} selecionado{selectedIds.length > 1 ? 's' : ''}
      </span>

      <Select onValueChange={(status) => bulkUpdate.mutate({ ids: selectedIds, status })}>
        <SelectTrigger className="w-44 h-7 text-sm">
          <SelectValue placeholder="Mudar status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="frequent">Frequente</SelectItem>
          <SelectItem value="blocked">Bloqueado</SelectItem>
        </SelectContent>
      </Select>

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

      {isAdmin && (
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Excluir
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={onClear}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

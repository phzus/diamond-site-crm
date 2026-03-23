'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus, MoreHorizontal, Trash2 } from 'lucide-react'
import {
  useUsers, useUpdateUserRole, useDeactivateUser,
  useReactivateUser, useDeleteUser, useBulkDeleteUsers,
} from '@/features/users/hooks/useUsers'
import { InviteUserDialog } from '@/features/users/components/InviteUserDialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { UserProfile } from '@/features/users/services/users.service'

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const updateRole = useUpdateUserRole()
  const deactivate = useDeactivateUser()
  const reactivate = useReactivateUser()
  const deleteUser = useDeleteUser()
  const bulkDelete = useBulkDeleteUsers()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirmUser, setConfirmUser] = useState<UserProfile | null>(null)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  }

  const allIds = users?.map((u) => u.id) ?? []
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleBulkDelete() {
    bulkDelete.mutate(Array.from(selected), {
      onSuccess: () => {
        setSelected(new Set())
        setBulkDeleteOpen(false)
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Colaboradores"
        description="Gerencie os colaboradores com acesso ao sistema"
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar usuário
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Bulk actions bar */}
        {someSelected && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2.5">
            <span className="text-sm font-medium">
              {selected.size} colaborador(es) selecionado(s)
            </span>
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto gap-1.5"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkDelete.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir selecionados
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Cancelar
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                : users?.map((user) => (
                    <TableRow
                      key={user.id}
                      className={!user.is_active ? 'opacity-50' : ''}
                      data-state={selected.has(user.id) ? 'selected' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(user.id)}
                          onCheckedChange={() => toggleOne(user.id)}
                          aria-label={`Selecionar ${user.full_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'outline' : 'destructive'}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === 'collaborator' ? (
                              <DropdownMenuItem
                                onClick={() => updateRole.mutate({ userId: user.id, role: 'admin' })}
                              >
                                Tornar administrador
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => updateRole.mutate({ userId: user.id, role: 'collaborator' })}
                              >
                                Tornar colaborador
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.is_active ? (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setConfirmUser(user)}
                              >
                                Desativar colaborador
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => reactivate.mutate(user.id)}
                              >
                                Reativar colaborador
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteConfirmUser(user)}
                            >
                              Excluir do sistema
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <ConfirmDialog
        open={!!confirmUser}
        title="Desativar colaborador"
        description={`Tem certeza que deseja desativar ${confirmUser?.full_name}? Ele perderá acesso ao sistema.`}
        confirmLabel="Desativar"
        confirmVariant="destructive"
        onConfirm={() => {
          if (confirmUser) deactivate.mutate(confirmUser.id)
          setConfirmUser(null)
        }}
        onCancel={() => setConfirmUser(null)}
      />

      <ConfirmDialog
        open={!!deleteConfirmUser}
        title="Excluir colaborador"
        description={`Tem certeza que deseja excluir permanentemente ${deleteConfirmUser?.full_name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir permanentemente"
        confirmVariant="destructive"
        onConfirm={() => {
          if (deleteConfirmUser) deleteUser.mutate(deleteConfirmUser.id)
          setDeleteConfirmUser(null)
        }}
        onCancel={() => setDeleteConfirmUser(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Excluir colaboradores selecionados"
        description={`Tem certeza que deseja excluir permanentemente ${selected.size} colaborador(es)? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir todos"
        confirmVariant="destructive"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  )
}

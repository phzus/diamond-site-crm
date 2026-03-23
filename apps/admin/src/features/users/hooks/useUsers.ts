import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getUsers,
  updateUserRole,
  deactivateUser,
  reactivateUser,
} from '../services/users.service'
import { inviteUser } from '../actions/invite.action'
import { deleteUser } from '../actions/delete.action'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role, fullName }: { email: string; role: 'admin' | 'collaborator'; fullName: string }) =>
      inviteUser(email, role, fullName).then((res) => {
        if (res.error) throw new Error(res.error)
        return res
      }),
    onSuccess: () => {
      toast.success('Convite enviado com sucesso')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'collaborator' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('Função atualizada')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Erro ao atualizar função')
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      toast.success('Usuário desativado')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Erro ao desativar usuário')
    },
  })
}

export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => reactivateUser(userId),
    onSuccess: () => {
      toast.success('Usuário reativado')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast.error('Erro ao reativar usuário')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      deleteUser(userId).then((res) => {
        if (res.error) throw new Error(res.error)
        return res
      }),
    onSuccess: () => {
      toast.success('Colaborador excluído')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userIds: string[]) =>
      Promise.all(
        userIds.map((id) =>
          deleteUser(id).then((res) => {
            if (res.error) throw new Error(res.error)
          })
        )
      ),
    onSuccess: (_, userIds) => {
      toast.success(`${userIds.length} colaborador(es) excluído(s)`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

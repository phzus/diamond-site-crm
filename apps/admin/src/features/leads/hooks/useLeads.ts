'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  getLeads, getLeadById, createLead, updateLead,
  updateLeadStatus, deleteLead, bulkUpdateStatus
} from '../services/leads.service'
import type { Lead, LeadFilters } from '../types/lead.types'
import { toast } from 'sonner'

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: LeadFilters) => [...leadKeys.lists(), filters] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
}

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => getLeads(filters),
    refetchInterval: 1000 * 60,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => getLeadById(id),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Lead criado com sucesso!')
    },
    onError: (error: any) => {
      if (error?.code === '23505') {
        toast.error('Este e-mail já está cadastrado.')
      } else {
        toast.error('Erro ao criar lead.')
      }
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) })
      toast.success('Lead atualizado!')
    },
    onError: () => toast.error('Erro ao atualizar lead.'),
  })
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, fromStatus, userId }: {
      id: string
      status: string
      fromStatus?: string
      userId?: string
    }) => {
      const supabase = createClient()
      await updateLeadStatus(id, status)
      if (userId) {
        await supabase.from('lead_activities').insert({
          lead_id: id,
          action_type: 'status_changed',
          from_value: fromStatus || null,
          to_value: status,
          performed_by: userId,
        })
      }
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: leadKeys.lists() })
      const previousLeads = queryClient.getQueriesData({ queryKey: leadKeys.lists() })

      queryClient.setQueriesData({ queryKey: leadKeys.lists() }, (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((lead: Lead) =>
            lead.id === id ? { ...lead, status } : lead
          ),
        }
      })

      return { previousLeads }
    },
    onError: (_, __, context) => {
      context?.previousLeads?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      toast.error('Erro ao atualizar status. Revertendo.')
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['lead-activities', id] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const supabase = createClient()
      await deleteLead(id)
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'lead.deleted',
        resource_type: 'lead',
        resource_id: id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Lead removido.')
    },
    onError: () => toast.error('Erro ao remover lead.'),
  })
}

export function useBulkUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      bulkUpdateStatus(ids, status),
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success(`${ids.length} leads atualizados.`)
    },
    onError: () => toast.error('Erro ao atualizar leads em lote.'),
  })
}

export function useBulkAssign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, userId }: { ids: string[]; userId: string | null }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to: userId, updated_at: new Date().toISOString() })
        .in('id', ids)
      if (error) throw error
    },
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success(`${ids.length} leads atribuídos.`)
    },
    onError: () => toast.error('Erro ao atribuir leads.'),
  })
}

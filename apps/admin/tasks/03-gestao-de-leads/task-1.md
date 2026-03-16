# Task 1 — Services e Hooks Base de Leads

## Objetivo
Criar a camada de serviços e hooks do TanStack Query para todas as operações CRUD de leads. Esta task é a base de todas as outras tasks de gestão de leads.

## Pré-requisitos
- Módulo 02 concluído
- Schema do banco criado (módulo 01)

## Passos de Implementação

### 1. Criar os tipos de domínio
Criar `features/leads/types/lead.types.ts`:
```typescript
export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'visited' | 'converted' | 'discarded'
export type LeadPriority = 'low' | 'medium' | 'high'
export type LeadSource = 'landing-page' | 'manual'

export interface Lead {
  id: string
  full_name: string
  email: string
  phone: string | null
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  assigned_to: string | null
  tags: string[]
  message: string | null
  last_contacted_at: string | null
  next_follow_up_at: string | null
  submission_count: number
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
  updated_at: string
  // Join
  assignee?: { full_name: string; avatar_url: string | null } | null
}

export interface LeadFilters {
  search?: string
  status?: LeadStatus[]
  priority?: LeadPriority
  assigned_to?: string
  source?: LeadSource
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface LeadsResponse {
  data: Lead[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
```

### 2. Criar o service de leads
Criar `features/leads/services/leads.service.ts`:
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadFilters, LeadsResponse } from '../types/lead.types'

const supabase = createClient()

export async function getLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
  const {
    search, status, priority, assigned_to, source,
    dateFrom, dateTo,
    page = 1, pageSize = 25,
    sortBy = 'created_at', sortOrder = 'desc'
  } = filters

  let query = supabase
    .from('leads')
    .select(`
      *,
      assignee:profiles!leads_assigned_to_fkey(full_name, avatar_url)
    `, { count: 'exact' })

  // Filtros
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  if (status?.length) {
    query = query.in('status', status)
  }
  if (priority) {
    query = query.eq('priority', priority)
  }
  if (assigned_to) {
    query = query.eq('assigned_to', assigned_to)
  }
  if (source) {
    query = query.eq('source', source)
  }
  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  // Paginação e ordenação
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: (data as Lead[]) || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getLeadById(id: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .select(`*, assignee:profiles!leads_assigned_to_fkey(full_name, avatar_url)`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Lead
}

export async function createLead(payload: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

export async function bulkUpdateStatus(ids: string[], status: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error
}
```

### 3. Criar os hooks TanStack Query
Criar `features/leads/hooks/useLeads.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeads, getLeadById, createLead, updateLead, updateLeadStatus, deleteLead, bulkUpdateStatus } from '../services/leads.service'
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
    refetchInterval: 1000 * 60, // Refetch a cada 60s
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
    onError: () => toast.error('Erro ao criar lead.'),
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
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, status, fromStatus, userId }: {
      id: string
      status: string
      fromStatus?: string
      userId?: string
    }) => {
      await updateLeadStatus(id, status)
      // Registrar atividade de mudança de status
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
      // Optimistic update
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
      // Reverter optimistic update
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

// Nota de uso: ao chamar useUpdateLeadStatus, passar fromStatus e userId:
// updateStatus.mutate({ id, status: newStatus, fromStatus: lead.status, userId: currentUser.id })

export function useDeleteLead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      await deleteLead(id)
      // Registrar em audit_logs (ação crítica conforme spec §3)
      await supabase.from('audit_logs').insert({
        user_id:       userId,
        action:        'lead.deleted',
        resource_type: 'lead',
        resource_id:   id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      toast.success('Lead removido.')
    },
    onError: () => toast.error('Erro ao remover lead.'),
  })
}
// Nota de uso: useDeleteLead().mutate({ id: leadId, userId: currentUser.id })

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
```

## Critérios de Conclusão
- [ ] Tipos de domínio definidos e exportados
- [ ] Service com todas as operações CRUD
- [ ] Hook `useLeads` com suporte a filtros e refetch automático
- [ ] Hook `useUpdateLeadStatus` com optimistic update
- [ ] Erros tratados com toast em todos os hooks
- [ ] Query keys organizadas para invalidação eficiente

## Arquivos Criados/Modificados
- `features/leads/types/lead.types.ts`
- `features/leads/services/leads.service.ts`
- `features/leads/hooks/useLeads.ts`

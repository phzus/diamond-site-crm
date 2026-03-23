import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadFilters, LeadsResponse } from '../types/lead.types'

export async function getLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
  const supabase = createClient()
  const {
    search, status, priority, assigned_to, source,
    dateFrom, dateTo,
    page = 1, pageSize = 25,
    sortBy = 'created_at', sortOrder = 'desc'
  } = filters

  let query = supabase
    .from('leads')
    .select(`*, assignee:profiles!leads_assigned_to_fkey(full_name, avatar_url)`, { count: 'exact' })

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
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .select(`*, assignee:profiles!leads_assigned_to_fkey(full_name, avatar_url)`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Lead
}

export async function createLead(payload: Partial<Lead>): Promise<Lead> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLead(id: string, payload: Partial<Lead>): Promise<Lead> {
  const supabase = createClient()
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
  const supabase = createClient()
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

export async function bulkDeleteLeads(ids: string[]): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('leads').delete().in('id', ids)
  if (error) throw error
}

export async function bulkUpdateStatus(ids: string[], status: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error
}

import { createClient } from '@/lib/supabase/client'
import { startOfDay, subDays } from 'date-fns'

export interface DashboardMetrics {
  totalLeads: number
  newToday: number
  frequentCount: number
  blockedCount: number
}

export interface StatusDistribution {
  status: string
  label: string
  count: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const todayStart = startOfDay(new Date()).toISOString()

  const [
    { count: totalLeads },
    { count: newToday },
    { count: frequentCount },
    { count: blockedCount },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'frequent'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
  ])

  return {
    totalLeads: totalLeads || 0,
    newToday: newToday || 0,
    frequentCount: frequentCount || 0,
    blockedCount: blockedCount || 0,
  }
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  const supabase = createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const statusLabels: Record<string, string> = {
    new:      'Novos',
    frequent: 'Frequentes',
    blocked:  'Bloqueados',
  }

  const { data, error } = await supabase
    .from('leads')
    .select('status')
    .gte('created_at', thirtyDaysAgo)

  if (error) throw error

  const counts: Record<string, number> = {}
  ;(data || []).forEach(({ status }) => {
    counts[status] = (counts[status] || 0) + 1
  })

  return Object.entries(statusLabels).map(([status, label]) => ({
    status,
    label,
    count: counts[status] || 0,
  }))
}

export async function getRecentLeads() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}

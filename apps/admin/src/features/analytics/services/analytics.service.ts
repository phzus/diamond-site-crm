import { createClient } from '@/lib/supabase/client'
import { startOfDay, subDays } from 'date-fns'

export interface DashboardMetrics {
  totalLeads: number
  newToday: number
  scheduledVisits: number
  conversionRate: number
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
    { count: scheduledVisits },
    { count: converted },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted').gte('created_at', thirtyDaysAgo),
  ])

  const conversionRate = totalLeads && totalLeads > 0
    ? Math.round(((converted || 0) / totalLeads) * 100)
    : 0

  return {
    totalLeads: totalLeads || 0,
    newToday: newToday || 0,
    scheduledVisits: scheduledVisits || 0,
    conversionRate,
  }
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  const supabase = createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const statusLabels: Record<string, string> = {
    new:       'Novos',
    contacted: 'Contactados',
    scheduled: 'Agendados',
    visited:   'Visitaram',
    converted: 'Convertidos',
    discarded: 'Descartados',
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

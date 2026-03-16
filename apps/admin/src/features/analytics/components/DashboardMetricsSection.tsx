'use client'

import { MetricCard } from './MetricCard'
import { useDashboardMetrics } from '../hooks/useDashboard'
import { Users, UserPlus, Calendar, TrendingUp } from 'lucide-react'

export function DashboardMetricsSection() {
  const { data, isLoading } = useDashboardMetrics()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total de Leads"
        value={data?.totalLeads ?? '—'}
        description="Últimos 30 dias"
        icon={Users}
        isLoading={isLoading}
        highlight="blue"
      />
      <MetricCard
        title="Leads Novos Hoje"
        value={data?.newToday ?? '—'}
        description="Desde meia-noite"
        icon={UserPlus}
        isLoading={isLoading}
        highlight="purple"
      />
      <MetricCard
        title="Visitas Agendadas"
        value={data?.scheduledVisits ?? '—'}
        description="Aguardando visita"
        icon={Calendar}
        isLoading={isLoading}
        highlight="orange"
      />
      <MetricCard
        title="Taxa de Conversão"
        value={data ? `${data.conversionRate}%` : '—'}
        description="Dos últimos 30 dias"
        icon={TrendingUp}
        isLoading={isLoading}
        highlight="green"
      />
    </div>
  )
}

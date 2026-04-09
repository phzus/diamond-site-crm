'use client'

import { MetricCard } from './MetricCard'
import { useDashboardMetrics } from '../hooks/useDashboard'
import { Users, UserPlus, Star, ShieldBan } from 'lucide-react'

export function DashboardMetricsSection() {
  const { data, isLoading } = useDashboardMetrics()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total de Clientes"
        value={data?.totalLeads ?? '—'}
        description="Últimos 30 dias"
        icon={Users}
        isLoading={isLoading}
        highlight="blue"
      />
      <MetricCard
        title="Clientes Novos Hoje"
        value={data?.newToday ?? '—'}
        description="Desde meia-noite"
        icon={UserPlus}
        isLoading={isLoading}
        highlight="purple"
      />
      <MetricCard
        title="Frequentes"
        value={data?.frequentCount ?? '—'}
        description="Clientes frequentes"
        icon={Star}
        isLoading={isLoading}
        highlight="green"
      />
      <MetricCard
        title="Bloqueados"
        value={data?.blockedCount ?? '—'}
        description="Clientes bloqueados"
        icon={ShieldBan}
        isLoading={isLoading}
        highlight="orange"
      />
    </div>
  )
}

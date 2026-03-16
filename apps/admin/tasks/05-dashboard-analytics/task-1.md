# Task 1 — Dashboard: Métricas, Gráfico e Leads Recentes

## Objetivo
Criar a página `/dashboard` com os 4 cards de métricas, gráfico de distribuição por status e tabela de leads recentes. Sem realtime — refetch automático a cada 60s.

## Pré-requisitos
- Módulo 02 concluído (layout)
- Módulo 03/task-1 concluída (services de leads)
- Recharts instalado

## Passos de Implementação

### 1. Criar o service de analytics
Criar `features/analytics/services/analytics.service.ts`:
```typescript
import { createClient } from '@/lib/supabase/client'
import { startOfDay, subDays, format } from 'date-fns'

const supabase = createClient()

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
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const todayStart = startOfDay(new Date()).toISOString()

  // Total de leads nos últimos 30 dias
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)

  // Leads criados hoje
  const { count: newToday } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart)

  // Visitas agendadas (sem filtro de data — agendamentos ativos)
  const { count: scheduledVisits } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')

  // Convertidos nos últimos 30 dias (para taxa)
  const { count: converted } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'converted')
    .gte('created_at', thirtyDaysAgo)

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
  const { data, error } = await supabase
    .from('leads')
    .select('*, assignee:profiles!leads_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}
```

### 2. Criar hooks de analytics
Criar `features/analytics/hooks/useDashboard.ts`:
```typescript
import { useQuery } from '@tanstack/react-query'
import { getDashboardMetrics, getStatusDistribution, getRecentLeads } from '../services/analytics.service'

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 1000 * 60, // 60 segundos
  })
}

export function useStatusDistribution() {
  return useQuery({
    queryKey: ['status-distribution'],
    queryFn: getStatusDistribution,
    refetchInterval: 1000 * 60,
  })
}

export function useRecentLeads() {
  return useQuery({
    queryKey: ['recent-leads'],
    queryFn: getRecentLeads,
    refetchInterval: 1000 * 60,
  })
}
```

### 3. Criar o componente MetricCard
Criar `features/analytics/components/MetricCard.tsx`:
```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  isLoading?: boolean
  highlight?: 'green' | 'blue' | 'purple' | 'orange'
}

const highlightStyles = {
  green:  'text-green-600',
  blue:   'text-blue-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
}

export function MetricCard({ title, value, description, icon: Icon, isLoading, highlight }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className={cn('text-3xl font-bold', highlight && highlightStyles[highlight])}>
                {value}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4. Criar o gráfico de distribuição por status
Criar `features/analytics/components/StatusChart.tsx`:
```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStatusDistribution } from '../hooks/useDashboard'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_COLORS: Record<string, string> = {
  new:       '#3b82f6',
  contacted: '#eab308',
  scheduled: '#a855f7',
  visited:   '#f97316',
  converted: '#22c55e',
  discarded: '#6b7280',
}

export function StatusChart() {
  const { data, isLoading } = useStatusDistribution()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribuição por Status</CardTitle>
        <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, 'Leads']}
                labelStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data?.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

### 5. Criar a página do Dashboard
Criar `app/(admin)/dashboard/page.tsx`:
```typescript
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricCard } from '@/features/analytics/components/MetricCard'
import { StatusChart } from '@/features/analytics/components/StatusChart'
import { RecentLeadsTable } from '@/features/analytics/components/RecentLeadsTable'
import { DashboardMetricsSection } from '@/features/analytics/components/DashboardMetricsSection'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos últimos 30 dias"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <DashboardMetricsSection />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart />
          <RecentLeadsTable />
        </div>
      </div>
    </div>
  )
}
```

Criar `features/analytics/components/DashboardMetricsSection.tsx`:
```typescript
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
```

Criar `features/analytics/components/RecentLeadsTable.tsx`:
```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentLeads } from '../hooks/useDashboard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import type { LeadStatus } from '@/features/leads/types/lead.types'

export function RecentLeadsTable() {
  const { data: leads, isLoading } = useRecentLeads()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Leads Recentes</CardTitle>
        <Link href="/leads" className="text-xs text-muted-foreground hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {leads?.map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{lead.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lead.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <StatusBadge status={lead.status as LeadStatus} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

## Critérios de Conclusão
- [ ] 4 cards de métricas renderizando com dados reais
- [ ] Skeleton exibido enquanto carrega
- [ ] Gráfico de barras com cores por status
- [ ] Tabela de 10 leads mais recentes com status
- [ ] Refetch automático a cada 60 segundos (sem reload visual)
- [ ] Página responsiva (2 colunas em mobile, 4 em desktop)

## Arquivos Criados/Modificados
- `features/analytics/services/analytics.service.ts`
- `features/analytics/hooks/useDashboard.ts`
- `features/analytics/components/MetricCard.tsx`
- `features/analytics/components/StatusChart.tsx`
- `features/analytics/components/DashboardMetricsSection.tsx`
- `features/analytics/components/RecentLeadsTable.tsx`
- `app/(admin)/dashboard/page.tsx`

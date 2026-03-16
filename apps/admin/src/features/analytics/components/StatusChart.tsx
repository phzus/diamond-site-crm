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

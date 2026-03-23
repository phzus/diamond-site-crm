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
        <CardTitle className="text-base">Clientes Recentes</CardTitle>
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

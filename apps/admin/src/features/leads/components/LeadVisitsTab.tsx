'use client'

import { useQuery } from '@tanstack/react-query'
import { getLeadVisits } from '@/features/checkin/services/checkin.service'
import { format, differenceInMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, Clock, DollarSign } from 'lucide-react'

function formatDuration(checkedIn: string, checkedOut: string): string {
  const mins = differenceInMinutes(new Date(checkedOut), new Date(checkedIn))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function LeadVisitsTab({ leadId }: { leadId: string }) {
  const { data: visits, isLoading } = useQuery({
    queryKey: ['lead-visits', leadId],
    queryFn: () => getLeadVisits(leadId),
    enabled: !!leadId,
  })

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
      </div>
    )
  }

  if (!visits?.length) {
    return (
      <p className="text-center text-sm text-white/40 py-10">
        Nenhuma visita registrada ainda.
      </p>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {visits.map((visit) => (
        <div key={visit.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              {format(new Date(visit.checked_in_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <CreditCard className="h-3.5 w-3.5" />
              Cartão {visit.card?.number ?? '—'}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(visit.checked_in_at), 'HH:mm', { locale: ptBR })}
              {' → '}
              {format(new Date(visit.checked_out_at), 'HH:mm', { locale: ptBR })}
              {' · '}
              {formatDuration(visit.checked_in_at, visit.checked_out_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              {visit.amount_spent != null
                ? `R$ ${visit.amount_spent.toFixed(2).replace('.', ',')}`
                : '—'}
            </span>
          </div>

          {visit.notes && (
            <p className="text-xs text-white/40 italic">"{visit.notes}"</p>
          )}
        </div>
      ))}
    </div>
  )
}

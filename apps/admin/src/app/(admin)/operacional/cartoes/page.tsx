'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { useCards, useOpenSessions, useCheckinRealtime, useCheckout } from '@/features/checkin/hooks/useCheckin'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Session } from '@/features/checkin/types/checkin.types'

interface CheckoutForm {
  amount: string
  notes: string
}

export default function CartoesPage() {
  useCheckinRealtime()

  const { data: cards, isLoading: cardsLoading } = useCards()
  const { data: openSessions } = useOpenSessions()
  const checkout = useCheckout()

  const [checkoutSession, setCheckoutSession] = useState<Session | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckoutForm>()

  // Mapeia card_id → sessão aberta para lookup rápido
  const sessionByCard = new Map(openSessions?.map((s) => [s.card_id, s]) ?? [])

  const available = cards?.filter((c) => c.status === 'available').length ?? 0
  const inUse = cards?.filter((c) => c.status === 'in_use').length ?? 0
  const blocked = cards?.filter((c) => c.status === 'blocked').length ?? 0

  function handleCardClick(cardId: string) {
    const session = sessionByCard.get(cardId)
    if (session) setCheckoutSession(session)
  }

  function handleCheckoutSubmit(values: CheckoutForm) {
    if (!checkoutSession) return
    const amount = parseFloat(values.amount.replace(',', '.'))
    if (isNaN(amount) || amount < 0) { toast.error('Valor inválido.'); return }
    checkout.mutate(
      { sessionId: checkoutSession.id, cardId: checkoutSession.card_id, amountSpent: amount, notes: values.notes },
      { onSuccess: () => { setCheckoutSession(null); reset() } }
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Mapa de Cartões"
        description={`${available} disponíveis · ${inUse} em uso · ${blocked} bloqueados`}
      />

      <div className="flex-1 overflow-auto p-6">
        {cardsLoading ? (
          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
            {Array.from({ length: 400 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Legenda */}
            <div className="flex items-center gap-6 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-emerald-500/80" /> Disponível
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-rose-500/80" /> Em uso
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-zinc-400/50" /> Bloqueado
              </span>
            </div>

            {/* Grid 20×20 */}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
              {cards?.map((card) => {
                const session = sessionByCard.get(card.id)
                const isInUse = card.status === 'in_use'
                const isBlocked = card.status === 'blocked'

                return (
                  <button
                    key={card.id}
                    title={isInUse && session ? `${session.lead?.full_name} — desde ${format(new Date(session.checked_in_at), 'HH:mm', { locale: ptBR })}` : `Cartão ${card.number}`}
                    onClick={() => isInUse && handleCardClick(card.id)}
                    className={[
                      'flex items-center justify-center rounded text-[10px] font-mono font-medium h-8 transition-all',
                      isInUse
                        ? 'bg-rose-500/80 text-white hover:bg-rose-500 cursor-pointer'
                        : isBlocked
                        ? 'bg-zinc-400/30 text-muted-foreground cursor-not-allowed'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 cursor-default',
                    ].join(' ')}
                  >
                    {card.number}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Dialog de check-out */}
      <Dialog open={!!checkoutSession} onOpenChange={(o) => { if (!o) { setCheckoutSession(null); reset() } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fechar Cartão nº {checkoutSession?.card?.number}
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>{checkoutSession?.lead?.full_name}</strong></p>
            <p>
              Entrada: {checkoutSession && format(new Date(checkoutSession.checked_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p>
              Tempo: {checkoutSession && formatDistanceToNow(new Date(checkoutSession.checked_in_at), { locale: ptBR })}
            </p>
          </div>

          <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="amount">Valor gasto (R$) *</Label>
              <Input
                id="amount"
                {...register('amount', { required: 'Informe o valor' })}
                placeholder="0,00"
                inputMode="decimal"
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" {...register('notes')} placeholder="Opcional" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setCheckoutSession(null); reset() }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={checkout.isPending}>
                {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Saída'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import {
  useCards, useOpenSessions, useCheckinRealtime,
  useCheckout, useAddCard, useDeleteCard, useUpdateCardStatus,
} from '@/features/checkin/hooks/useCheckin'
import { CardHistoryModal } from '@/features/checkin/components/CardHistoryModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Card, Session } from '@/features/checkin/types/checkin.types'

interface CheckoutForm { amount: string; notes: string }

export default function CartoesPage() {
  useCheckinRealtime()

  const { data: cards, isLoading: cardsLoading } = useCards()
  const { data: openSessions } = useOpenSessions()
  const checkout = useCheckout()
  const addCard = useAddCard()
  const deleteCard = useDeleteCard()
  const updateStatus = useUpdateCardStatus()

  // card history modal (all cards)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // checkout dialog (in_use cards)
  const [checkoutSession, setCheckoutSession] = useState<Session | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckoutForm>()

  // add card dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addNumber, setAddNumber] = useState('')

  const sessionByCard = new Map(openSessions?.map((s) => [s.card_id, s]) ?? [])

  const available = cards?.filter((c) => c.status === 'available').length ?? 0
  const inUse     = cards?.filter((c) => c.status === 'in_use').length ?? 0
  const blocked   = cards?.filter((c) => c.status === 'blocked').length ?? 0

  function handleCardClick(card: Card) {
    setSelectedCard(card)
  }

  function handleCardCheckout() {
    if (!selectedCard) return
    const session = sessionByCard.get(selectedCard.id)
    if (session) {
      setSelectedCard(null)
      setCheckoutSession(session)
    }
  }

  function handleToggleBlock() {
    if (!selectedCard) return
    const next = selectedCard.status === 'blocked' ? 'available' : 'blocked'
    updateStatus.mutate({ id: selectedCard.id, status: next }, {
      onSuccess: () => setSelectedCard(null),
    })
  }

  function handleDeleteCard() {
    if (!selectedCard) return
    deleteCard.mutate(selectedCard.id, {
      onSuccess: () => { setSelectedCard(null); setDeleteConfirmOpen(false) },
    })
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

  function handleAddCard() {
    const num = parseInt(addNumber, 10)
    if (isNaN(num) || num < 1) { toast.error('Número inválido.'); return }
    addCard.mutate(num, { onSuccess: () => { setAddOpen(false); setAddNumber('') } })
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Mapa de Comandas"
        description={`${available} disponíveis · ${inUse} em uso · ${blocked} bloqueados`}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar comanda
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {cardsLoading ? (
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
            {Array.from({ length: 450 }).map((_, i) => (
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
              <span className="text-muted-foreground/60">· Clique numa comanda para ver histórico</span>
            </div>

            {/* Grid */}
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
              {cards?.map((card) => {
                const session = sessionByCard.get(card.id)
                const isInUse   = card.status === 'in_use'
                const isBlocked = card.status === 'blocked'

                return (
                  <button
                    key={card.id}
                    title={
                      isInUse && session
                        ? `${session.lead?.full_name} — desde ${format(new Date(session.checked_in_at), 'HH:mm', { locale: ptBR })}`
                        : `Comanda ${card.number}${isBlocked ? ' (bloqueada)' : ''}`
                    }
                    onClick={() => handleCardClick(card)}
                    className={[
                      'flex items-center justify-center rounded text-[10px] font-mono font-medium h-8 transition-all cursor-pointer',
                      isInUse
                        ? 'bg-rose-500/80 text-white hover:bg-rose-500'
                        : isBlocked
                        ? 'bg-zinc-400/30 text-muted-foreground hover:bg-zinc-400/50'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/40',
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

      {/* Modal: histórico do cartão */}
      <CardHistoryModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onCheckout={handleCardCheckout}
        onBlock={handleToggleBlock}
        isUpdating={updateStatus.isPending}
      />

      {/* Dialog: confirmar exclusão */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(o) => !o && setDeleteConfirmOpen(false)}>
        <DialogContent className="sm:max-w-90">
          <DialogHeader>
            <DialogTitle>Excluir comanda nº {selectedCard?.number}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            A comanda será removida permanentemente do sistema. Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCard} disabled={deleteCard.isPending}>
              {deleteCard.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: adicionar cartão */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) { setAddOpen(false); setAddNumber('') } }}>
        <DialogContent className="sm:max-w-[320px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar comanda
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label htmlFor="card-number">Número da comanda</Label>
            <Input
              id="card-number"
              type="number"
              min={1}
              placeholder="Ex: 451"
              value={addNumber}
              onChange={(e) => setAddNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setAddNumber('') }}>
              Cancelar
            </Button>
            <Button onClick={handleAddCard} disabled={addCard.isPending}>
              {addCard.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: check-out */}
      <Dialog open={!!checkoutSession} onOpenChange={(o) => { if (!o) { setCheckoutSession(null); reset() } }}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>
              Fechar Comanda nº {checkoutSession?.card?.number}
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

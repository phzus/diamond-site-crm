'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { differenceInMinutes, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, Loader2, Lock, Trash2, Unlock, X } from 'lucide-react'
import { useCardHistory } from '../hooks/useCheckin'
import type { Card } from '../types/checkin.types'

interface Props {
  card: Card | null
  onClose: () => void
  onCheckout: () => void
  onBlock: () => void
  onDelete: () => void
  isUpdating?: boolean
  isDeleting?: boolean
}

const glassOverlay =
  'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
const glassContent =
  'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/8 outline-none max-h-[80vh] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'

export function CardHistoryModal({
  card,
  onClose,
  onCheckout,
  onBlock,
  onDelete,
  isUpdating,
  isDeleting,
}: Props) {
  const { data: history, isLoading } = useCardHistory(card?.id ?? null)

  if (!card) return null

  const isInUse = card.status === 'in_use'
  const isBlocked = card.status === 'blocked'

  return (
    <Dialog.Root open={!!card} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={glassOverlay} />
        <Dialog.Content
          className={glassContent}
          style={{
            background: 'linear-gradient(135deg, rgba(8,8,22,0.97) 0%, rgba(4,4,16,0.95) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.95)',
          }}
        >
          {/* Close */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white outline-none z-10"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Header */}
          <div
            className="flex items-center gap-3 px-6 py-5 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="rounded-lg p-2 shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <CreditCard className="h-4 w-4 text-white/60" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">
                Cartão nº {card.number}
              </span>
              {isInUse && (
                <span className="text-[10px] uppercase tracking-widest text-rose-400 font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)' }}>
                  Em uso
                </span>
              )}
              {isBlocked && (
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  Bloqueado
                </span>
              )}
              {!isInUse && !isBlocked && (
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)' }}>
                  Disponível
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-white/30" />
              </div>
            ) : !history || history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="h-8 w-8 text-white/15 mb-3" />
                <p className="text-sm text-white/35">Nenhum uso registrado ainda</p>
              </div>
            ) : (
              <div>
                {history.map((visit, i) => {
                  const mins = differenceInMinutes(
                    new Date(visit.checked_out_at),
                    new Date(visit.checked_in_at)
                  )
                  const h = Math.floor(mins / 60)
                  const m = mins % 60
                  const duration = h > 0 ? `${h}h ${m}min` : `${m}min`
                  const date = format(new Date(visit.checked_in_at), "dd 'de' MMM yyyy", { locale: ptBR })
                  const timeIn = format(new Date(visit.checked_in_at), 'HH:mm', { locale: ptBR })
                  const timeOut = format(new Date(visit.checked_out_at), 'HH:mm', { locale: ptBR })

                  return (
                    <div key={visit.id} className="flex gap-3">
                      {/* Dot + line */}
                      <div className="flex flex-col items-center pt-1.5 shrink-0">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ background: 'rgba(255,255,255,0.25)' }}
                        />
                        {i < history.length - 1 && (
                          <div
                            className="w-px flex-1 mt-1.5"
                            style={{ background: 'rgba(255,255,255,0.06)', minHeight: '1.5rem' }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-5 flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90 truncate leading-tight">
                          {visit.lead?.full_name ?? '—'}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {date} · {timeIn}–{timeOut} · {duration}
                        </p>
                        {visit.amount_spent != null && (
                          <p className="text-xs text-white/60 mt-1 font-mono">
                            R${' '}
                            {visit.amount_spent.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        )}
                        {visit.notes && (
                          <p className="text-xs text-white/35 mt-1 italic leading-snug">
                            {visit.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-2 px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {isInUse ? (
              <button
                onClick={onCheckout}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.92)', color: '#080816' }}
              >
                Fechar Cartão
              </button>
            ) : (
              <>
                <button
                  onClick={onBlock}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-white/75 hover:text-white transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isBlocked ? (
                    <><Unlock className="h-4 w-4" /> Desbloquear</>
                  ) : (
                    <><Lock className="h-4 w-4" /> Bloquear</>
                  )}
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 rounded-full py-2.5 px-5 text-sm font-medium text-rose-400 hover:text-rose-300 transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.18)',
                  }}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Trash2 className="h-4 w-4" /> Excluir</>
                  )}
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

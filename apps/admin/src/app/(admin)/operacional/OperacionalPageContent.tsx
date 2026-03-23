'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Search, UserCheck, UserX, CreditCard, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useCheckin, useCheckout, useOpenSessions, useCheckinRealtime } from '@/features/checkin/hooks/useCheckin'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { findLeadByCpf } from '@/features/checkin/services/checkin.service'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Session } from '@/features/checkin/types/checkin.types'

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

interface CheckoutForm {
  amount: string
  notes: string
}

export function OperacionalPageContent() {
  useCheckinRealtime()

  const { data: currentUser } = useCurrentUser()
  const { data: openSessions, isLoading: sessionsLoading } = useOpenSessions()
  const checkin = useCheckin()
  const checkout = useCheckout()

  const [cpfInput, setCpfInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundLead, setFoundLead] = useState<{ id: string; full_name: string; cpf: string | null; email: string } | null | 'not_found'>(null)
  const [checkingIn, setCheckingIn] = useState(false)

  const [checkoutSession, setCheckoutSession] = useState<Session | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckoutForm>()

  async function handleSearch() {
    const raw = cpfInput.replace(/\D/g, '')
    if (raw.length < 11) {
      toast.error('CPF incompleto.')
      return
    }
    setSearching(true)
    setFoundLead(null)
    try {
      const lead = await findLeadByCpf(cpfInput)
      setFoundLead(lead ?? 'not_found')
    } catch {
      toast.error('Erro ao buscar CPF.')
    } finally {
      setSearching(false)
    }
  }

  async function handleCheckin() {
    if (!foundLead || foundLead === 'not_found' || !currentUser) return
    setCheckingIn(true)
    try {
      await checkin.mutateAsync({ leadId: foundLead.id, operatorId: currentUser.id })
      setCpfInput('')
      setFoundLead(null)
    } finally {
      setCheckingIn(false)
    }
  }

  function handleCheckoutSubmit(values: CheckoutForm) {
    if (!checkoutSession) return
    const amount = parseFloat(values.amount.replace(',', '.'))
    if (isNaN(amount) || amount < 0) {
      toast.error('Valor inválido.')
      return
    }
    checkout.mutate(
      { sessionId: checkoutSession.id, cardId: checkoutSession.card_id, amountSpent: amount, notes: values.notes },
      {
        onSuccess: () => {
          setCheckoutSession(null)
          reset()
        },
      }
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Painel"
        description="Check-in e controle de cartões"
      />

      <div className="flex-1 overflow-auto p-6 space-y-8">

        {/* ── Busca por CPF ── */}
        <div className="max-w-md space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Check-in por CPF
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="000.000.000-00"
              value={cpfInput}
              onChange={(e) => {
                setCpfInput(formatCpf(e.target.value))
                setFoundLead(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={14}
              inputMode="numeric"
              className="font-mono"
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Resultado da busca */}
          {foundLead === 'not_found' && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <UserX className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium">CPF não encontrado</p>
                <p className="text-xs text-muted-foreground">
                  Cadastre o cliente primeiro na aba <strong>Clientes</strong>.
                </p>
              </div>
            </div>
          )}

          {foundLead && foundLead !== 'not_found' && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
              <UserCheck className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{foundLead.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{foundLead.email}</p>
              </div>
              <Button size="sm" onClick={handleCheckin} disabled={checkingIn}>
                {checkingIn
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : 'Check-in →'
                }
              </Button>
            </div>
          )}
        </div>

        {/* ── Sessões abertas ── */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Clientes presentes ({openSessions?.length ?? 0})
          </h2>

          {sessionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : openSessions?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cliente no momento.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {openSessions?.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                    {session.card?.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.lead?.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(session.checked_in_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1"
                    onClick={() => setCheckoutSession(session)}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Saída
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialog de check-out ── */}
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

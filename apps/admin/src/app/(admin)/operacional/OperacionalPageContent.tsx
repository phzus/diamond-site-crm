'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Search, UserCheck, UserX, CreditCard, LogOut, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useCheckin, useCheckout, useOpenSessions, useCheckinRealtime } from '@/features/checkin/hooks/useCheckin'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { searchLeads, type LeadSearchResult } from '@/features/checkin/services/checkin.service'
import { LeadSheet } from '@/features/leads/components/LeadSheet'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Session } from '@/features/checkin/types/checkin.types'

function ElapsedTimer({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState(() => getElapsed(since))

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(since)), 1000)
    return () => clearInterval(id)
  }, [since])

  return <span className="text-xs font-mono text-muted-foreground shrink-0">{elapsed}</span>
}

function getElapsed(since: string): string {
  const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LeadSearchResult[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // modal de check-in (escolher número da comanda)
  const [checkinTarget, setCheckinTarget] = useState<LeadSearchResult | null>(null)
  const [cardNumberStr, setCardNumberStr] = useState('')

  const [checkoutSession, setCheckoutSession] = useState<Session | null>(null)
  const [infoLeadId, setInfoLeadId] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckoutForm>()

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced live search
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const results = await searchLeads(trimmed)
        setSuggestions(results)
        setShowDropdown(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectLead(lead: LeadSearchResult) {
    setCheckinTarget(lead)
    setCardNumberStr('')
    setShowDropdown(false)
    setQuery('')
    setSuggestions([])
  }

  async function handleCheckin() {
    if (!checkinTarget || !currentUser) return
    const cardNumber = parseInt(cardNumberStr, 10)
    if (isNaN(cardNumber) || cardNumber < 1) { toast.error('Informe um número de comanda válido.'); return }
    try {
      await checkin.mutateAsync({ leadId: checkinTarget.id, operatorId: currentUser.id, cardNumber })
      setCheckinTarget(null)
      setCardNumberStr('')
    } catch { /* handled by hook */ }
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
        title="Painel"
        description="Check-in e controle de cartões"
      />

      <div className="flex-1 overflow-auto p-6 space-y-8">

        {/* ── Busca por nome ou CPF ── */}
        <div className="max-w-md space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Check-in
          </h2>

          <div className="relative" ref={dropdownRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  placeholder="Buscar por nome ou CPF..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setCheckinTarget(null)
                  }}
                  onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                  autoComplete="off"
                />
                {loadingSuggestions && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <Button variant="outline" size="icon" disabled>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Dropdown de sugestões */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                {suggestions.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => selectLead(lead)}
                    className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.cpf ? `CPF: ${lead.cpf}` : lead.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && suggestions.length === 0 && !loadingSuggestions && query.trim().length >= 2 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserX className="h-4 w-4 shrink-0 text-destructive" />
                  Nenhum cliente encontrado. Cadastre na aba <strong className="ml-1">Clientes</strong>.
                </div>
              </div>
            )}
          </div>

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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{session.lead?.full_name}</p>
                      <ElapsedTimer since={session.checked_in_at} />
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8 text-muted-foreground"
                    onClick={() => setInfoLeadId(session.lead_id)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
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

      {/* ── Modal de check-in (escolher comanda) ── */}
      <Dialog open={!!checkinTarget} onOpenChange={(o) => { if (!o) { setCheckinTarget(null); setCardNumberStr('') } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Realizar Check-in
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-1 text-sm">
            <p className="font-semibold">{checkinTarget?.full_name}</p>
            <p className="text-muted-foreground text-xs">
              {checkinTarget?.cpf ? `CPF: ${checkinTarget.cpf}` : checkinTarget?.email}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comanda-number">Número da comanda *</Label>
            <Input
              id="comanda-number"
              type="number"
              min={1}
              placeholder="Ex: 42"
              value={cardNumberStr}
              onChange={(e) => setCardNumberStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckin()}
              autoFocus
              className="font-mono text-lg"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCheckinTarget(null); setCardNumberStr('') }}>
              Cancelar
            </Button>
            <Button onClick={handleCheckin} disabled={checkin.isPending || !cardNumberStr}>
              {checkin.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Realizar Check-in'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sheet de informações do lead ── */}
      <LeadSheet
        leadId={infoLeadId}
        onClose={() => setInfoLeadId(null)}
        onEdit={() => setInfoLeadId(null)}
      />

      {/* ── Dialog de check-out ── */}
      <Dialog open={!!checkoutSession} onOpenChange={(o) => { if (!o) { setCheckoutSession(null); reset() } }}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fechar Comanda nº {checkoutSession?.card?.number}
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

'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  getCards,
  getOpenSessions,
  checkinLead,
  checkoutSession,
} from '../services/checkin.service'

export const checkinKeys = {
  cards: ['cards'] as const,
  sessions: ['sessions', 'open'] as const,
}

export function useCards() {
  return useQuery({
    queryKey: checkinKeys.cards,
    queryFn: getCards,
  })
}

export function useOpenSessions() {
  return useQuery({
    queryKey: checkinKeys.sessions,
    queryFn: getOpenSessions,
  })
}

// Realtime: atualiza cards e sessions automaticamente
export function useCheckinRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('checkin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, () => {
        queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        queryClient.invalidateQueries({ queryKey: checkinKeys.sessions })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])
}

export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, operatorId }: { leadId: string; operatorId: string }) =>
      checkinLead(leadId, operatorId),
    onSuccess: ({ card }) => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
      queryClient.invalidateQueries({ queryKey: checkinKeys.sessions })
      toast.success(`Check-in realizado — Cartão nº ${card.number}`)
    },
    onError: (error: Error) => toast.error(error.message || 'Erro ao realizar check-in.'),
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      cardId,
      amountSpent,
      notes,
    }: {
      sessionId: string
      cardId: string
      amountSpent: number
      notes?: string
    }) => checkoutSession(sessionId, cardId, amountSpent, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
      queryClient.invalidateQueries({ queryKey: checkinKeys.sessions })
      toast.success('Check-out registrado. Cartão liberado.')
    },
    onError: () => toast.error('Erro ao registrar check-out.'),
  })
}

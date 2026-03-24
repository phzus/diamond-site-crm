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
  addCard,
  deleteCard,
  updateCardStatus,
  getCardHistory,
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
    mutationFn: ({ leadId, operatorId, cardNumber }: { leadId: string; operatorId: string; cardNumber: number }) =>
      checkinLead(leadId, operatorId, cardNumber),
    onSuccess: ({ card }) => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
      queryClient.invalidateQueries({ queryKey: checkinKeys.sessions })
      toast.success(`Check-in realizado — Comanda nº ${card.number}`)
    },
    onError: (error: Error) => toast.error(error.message || 'Erro ao realizar check-in.'),
  })
}

export function useAddCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (number: number) => addCard(number),
    onSuccess: (_, number) => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
      toast.success(`Cartão nº ${number} adicionado.`)
    },
    onError: (error: Error) => toast.error(error.message || 'Erro ao adicionar cartão.'),
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
      toast.success('Cartão removido.')
    },
    onError: () => toast.error('Erro ao remover cartão.'),
  })
}

export function useUpdateCardStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'available' | 'blocked' }) =>
      updateCardStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkinKeys.cards })
    },
    onError: () => toast.error('Erro ao atualizar status do cartão.'),
  })
}

export function useCardHistory(cardId: string | null) {
  return useQuery({
    queryKey: ['card-history', cardId],
    queryFn: () => getCardHistory(cardId!),
    enabled: !!cardId,
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

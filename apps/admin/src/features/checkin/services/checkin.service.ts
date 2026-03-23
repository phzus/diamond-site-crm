import { createClient } from '@/lib/supabase/client'
import type { Card, Session } from '../types/checkin.types'

export async function getCards(): Promise<Card[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('number', { ascending: true })
  if (error) throw error
  return data as Card[]
}

export async function getOpenSessions(): Promise<Session[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      lead:leads!sessions_lead_id_fkey(full_name, cpf, email),
      card:cards!sessions_card_id_fkey(number),
      operator:profiles!sessions_operator_id_fkey(full_name)
    `)
    .is('checked_out_at', null)
    .order('checked_in_at', { ascending: true })
  if (error) throw error
  return data as Session[]
}

export async function findLeadByCpf(cpf: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, full_name, cpf, email, phone')
    .eq('cpf', cpf)
    .maybeSingle()
  if (error) throw error
  return data
}

export type LeadSearchResult = { id: string; full_name: string; cpf: string | null; email: string; phone: string | null }

export interface LeadVisit {
  id: string
  checked_in_at: string
  checked_out_at: string
  amount_spent: number | null
  notes: string | null
  card: { number: number } | null
}

export async function getLeadVisits(leadId: string): Promise<LeadVisit[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('id, checked_in_at, checked_out_at, amount_spent, notes, card:cards(number)')
    .eq('lead_id', leadId)
    .not('checked_out_at', 'is', null)
    .order('checked_in_at', { ascending: false })
  if (error) throw error
  return data as LeadVisit[]
}

export async function searchLeads(query: string): Promise<LeadSearchResult[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, full_name, cpf, email, phone')
    .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%`)
    .limit(8)
  if (error) throw error
  return data as LeadSearchResult[]
}

export async function checkinLead(
  leadId: string,
  operatorId: string
): Promise<{ session: Session; card: Card }> {
  const supabase = createClient()

  // Pega o próximo cartão disponível (menor número)
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('status', 'available')
    .order('number', { ascending: true })
    .limit(1)
    .single()

  if (cardError || !card) throw new Error('Nenhum cartão disponível no momento.')

  // Marca cartão como em uso
  const { error: updateError } = await supabase
    .from('cards')
    .update({ status: 'in_use' })
    .eq('id', card.id)

  if (updateError) throw updateError

  // Cria a sessão
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      lead_id: leadId,
      card_id: card.id,
      operator_id: operatorId,
    })
    .select()
    .single()

  if (sessionError) {
    // Reverte o cartão em caso de erro
    await supabase.from('cards').update({ status: 'available' }).eq('id', card.id)
    throw sessionError
  }

  return { session: session as Session, card: card as Card }
}

export async function addCard(number: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('cards').insert({ number })
  if (error) {
    if (error.code === '23505') throw new Error(`Cartão nº ${number} já existe.`)
    throw error
  }
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}

export async function updateCardStatus(id: string, status: 'available' | 'blocked'): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('cards').update({ status }).eq('id', id)
  if (error) throw error
}

export async function checkoutSession(
  sessionId: string,
  cardId: string,
  amountSpent: number,
  notes?: string
): Promise<void> {
  const supabase = createClient()

  const { error: sessionError } = await supabase
    .from('sessions')
    .update({
      checked_out_at: new Date().toISOString(),
      amount_spent: amountSpent,
      notes: notes || null,
    })
    .eq('id', sessionId)

  if (sessionError) throw sessionError

  const { error: cardError } = await supabase
    .from('cards')
    .update({ status: 'available' })
    .eq('id', cardId)

  if (cardError) throw cardError
}

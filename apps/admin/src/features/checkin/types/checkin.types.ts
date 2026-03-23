export type CardStatus = 'available' | 'in_use' | 'blocked'

export interface Card {
  id: string
  number: number
  status: CardStatus
  updated_at: string
}

export interface Session {
  id: string
  lead_id: string
  card_id: string
  operator_id: string
  checked_in_at: string
  checked_out_at: string | null
  amount_spent: number | null
  notes: string | null
  created_at: string
  // Joins
  lead?: { full_name: string; cpf: string | null; email: string }
  card?: { number: number }
  operator?: { full_name: string }
}

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'visited' | 'converted' | 'discarded'
export type LeadPriority = 'low' | 'medium' | 'high'
export type LeadSource = 'landing-page' | 'manual'

export interface Lead {
  id: string
  full_name: string
  email: string
  phone: string | null
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  assigned_to: string | null
  tags: string[]
  message: string | null
  last_contacted_at: string | null
  next_follow_up_at: string | null
  submission_count: number
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
  updated_at: string
  // Join
  assignee?: { full_name: string; avatar_url: string | null } | null
}

export interface LeadFilters {
  search?: string
  status?: LeadStatus[]
  priority?: LeadPriority
  assigned_to?: string
  source?: LeadSource
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface LeadsResponse {
  data: Lead[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

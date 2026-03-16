import Papa from 'papaparse'
import { format } from 'date-fns'
import type { Lead } from '../types/lead.types'

const COLUMN_LABELS: Record<string, string> = {
  id:               'ID',
  full_name:        'Nome',
  email:            'Email',
  phone:            'Telefone',
  status:           'Status',
  priority:         'Prioridade',
  assignee:         'Responsável',
  source:           'Fonte',
  utm_source:       'UTM Source',
  utm_medium:       'UTM Medium',
  utm_campaign:     'UTM Campaign',
  created_at:       'Criado em',
  last_contacted_at: 'Último Contato',
  next_follow_up_at: 'Próximo Follow-up',
}

const EXPORT_LIMIT = 5000

export function exportLeadsToCsv(leads: Lead[], filename = 'diamond-leads') {
  if (leads.length > EXPORT_LIMIT) {
    leads = leads.slice(0, EXPORT_LIMIT)
  }

  const rows = leads.map((lead) => ({
    [COLUMN_LABELS.id]:               lead.id,
    [COLUMN_LABELS.full_name]:        lead.full_name,
    [COLUMN_LABELS.email]:            lead.email,
    [COLUMN_LABELS.phone]:            lead.phone || '',
    [COLUMN_LABELS.status]:           lead.status,
    [COLUMN_LABELS.priority]:         lead.priority,
    [COLUMN_LABELS.assignee]:         lead.assignee?.full_name || '',
    [COLUMN_LABELS.source]:           lead.source,
    [COLUMN_LABELS.utm_source]:       lead.utm_source || '',
    [COLUMN_LABELS.utm_medium]:       lead.utm_medium || '',
    [COLUMN_LABELS.utm_campaign]:     lead.utm_campaign || '',
    [COLUMN_LABELS.created_at]:       format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm'),
    [COLUMN_LABELS.last_contacted_at]: lead.last_contacted_at
      ? format(new Date(lead.last_contacted_at), 'dd/MM/yyyy HH:mm') : '',
    [COLUMN_LABELS.next_follow_up_at]: lead.next_follow_up_at
      ? format(new Date(lead.next_follow_up_at), 'dd/MM/yyyy HH:mm') : '',
  }))

  const csv = Papa.unparse(rows, { delimiter: ';' })
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

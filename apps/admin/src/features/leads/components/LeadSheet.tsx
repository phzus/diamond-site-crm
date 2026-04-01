'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LeadNotesTab } from './LeadNotesTab'
import { LeadVisitsTab } from './LeadVisitsTab'
import { useLead, useUpdateLeadStatus, useUpdateLead, useDeleteLead } from '../hooks/useLeads'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Globe, Phone, Mail, ChevronDown, MapPin, UserCheck,
  MessageSquare, Building2, Cake, CreditCard, Trash2, X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LeadStatus } from '../types/lead.types'

const STATUS_OPTIONS: LeadStatus[] = [
  'new', 'contacted', 'scheduled', 'visited', 'converted', 'discarded'
]

const LABEL = 'text-[10px] font-light uppercase tracking-widest text-white/40 mb-1'
const VALUE_ROW = 'flex items-center gap-1.5 text-sm text-white/90'

interface LeadSheetProps {
  leadId: string | null
  onClose: () => void
  onEdit: (leadId: string) => void
}

export function LeadSheet({ leadId, onClose, onEdit }: LeadSheetProps) {
  const { data: lead, isLoading } = useLead(leadId || '')
  const { data: users } = useUsers()
  const { data: currentUser } = useCurrentUser()
  const isAdmin = currentUser?.role === 'admin'
  const updateStatus = useUpdateLeadStatus()
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()

  const [activeTab, setActiveTab] = useState<'dados' | 'notas' | 'historico'>('dados')
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  async function handleInlineUpdate(field: string, value: any) {
    if (!leadId || !currentUser) return
    const supabase = createClient()
    await updateLead.mutateAsync({ id: leadId, data: { [field]: value } })
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      action_type: 'field_updated',
      from_value: field,
      to_value: String(value),
      performed_by: currentUser.id,
    })
  }

  function handleStatusChange(status: LeadStatus) {
    if (!leadId) return
    setStatusPopoverOpen(false)
    updateStatus.mutate({ id: leadId, status, fromStatus: lead?.status, userId: currentUser?.id })
  }

  function handleDelete() {
    if (!leadId || !currentUser) return
    deleteLead.mutate({ id: leadId, userId: currentUser.id }, {
      onSuccess: () => { setDeleteConfirmOpen(false); onClose() },
    })
  }

  const glassOverlay = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
  const glassContent = 'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/8 outline-none max-h-[90vh] flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'

  return (
    <>
      <Dialog.Root open={!!leadId} onOpenChange={(o) => !o && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className={glassOverlay} />
          <Dialog.Content
            className={glassContent}
            style={{
              background: 'linear-gradient(135deg, rgba(8,8,22,0.95) 0%, rgba(4,4,16,0.92) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.95)',
            }}
          >
            {isLoading || !lead ? (
              <div className="p-8 space-y-3 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ) : (
              <>
                {/* ── Close button ── */}
                <Dialog.Close asChild>
                  <button
                    className="absolute right-4 top-4 rounded-full p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white outline-none z-10"
                    aria-label="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>

                {/* ── Fixed header ── */}
                <div className="px-6 pt-6 pb-4 border-b border-white/8 shrink-0">
                  <div className="flex items-center gap-2.5 flex-wrap pr-8">
                    <Dialog.Title className="text-lg font-semibold text-white leading-tight">
                      {lead.full_name}
                    </Dialog.Title>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Criado em {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    {' · '}
                    {lead.source === 'landing-page' ? 'Landing Page' : 'Manual'}
                  </p>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-white/8 shrink-0">
                  {(['dados', 'notas', 'historico'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={[
                        'flex-1 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors',
                        activeTab === tab
                          ? 'text-white border-b-2 border-white'
                          : 'text-white/40 hover:text-white/70',
                      ].join(' ')}
                    >
                      {tab === 'dados' ? 'Dados' : tab === 'notas' ? 'Notas' : 'Histórico'}
                    </button>
                  ))}
                </div>

                {/* ── Tab content (scrollable) ── */}
                <div className="flex-1 overflow-y-auto">

                  {/* Dados */}
                  {activeTab === 'dados' && (
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={LABEL}>CPF</p>
                          {lead.cpf ? (
                            <div className={VALUE_ROW}>
                              <CreditCard className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              <span className="font-mono">{lead.cpf}</span>
                            </div>
                          ) : <span className="text-sm text-white/30">—</span>}
                        </div>
                        <div>
                          <p className={LABEL}>Email</p>
                          <div className={VALUE_ROW}>
                            <Mail className="h-3.5 w-3.5 text-white/40 shrink-0" />
                            <a href={`mailto:${lead.email}`} className="hover:underline truncate">{lead.email}</a>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={LABEL}>Telefone</p>
                          {lead.phone ? (
                            <div className={VALUE_ROW}>
                              <Phone className="h-3.5 w-3.5 text-white/40" />
                              {lead.phone}
                            </div>
                          ) : <span className="text-sm text-white/30">—</span>}
                        </div>
                        <div>
                          <p className={LABEL}>Aniversário</p>
                          {lead.birth_date ? (
                            <div className={VALUE_ROW}>
                              <Cake className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              {format(new Date(lead.birth_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          ) : <span className="text-sm text-white/30">—</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={LABEL}>Estado</p>
                          {lead.state ? (
                            <div className={VALUE_ROW}>
                              <MapPin className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              {lead.state}
                            </div>
                          ) : <span className="text-sm text-white/30">—</span>}
                        </div>
                        <div>
                          <p className={LABEL}>Cidade</p>
                          {lead.city ? (
                            <div className={VALUE_ROW}>
                              <Building2 className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              {lead.city}
                            </div>
                          ) : <span className="text-sm text-white/30">—</span>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={LABEL}>Convidado por</p>
                          {lead.invited_by ? (
                            <div className={VALUE_ROW}>
                              <UserCheck className="h-3.5 w-3.5 text-white/40 shrink-0" />
                              {lead.invited_by}
                            </div>
                          ) : <span className="text-sm text-white/30">—</span>}
                        </div>
                        {lead.utm_source && (
                          <div>
                            <p className={LABEL}>Origem (UTM)</p>
                            <div className={VALUE_ROW}>
                              <Globe className="h-3.5 w-3.5 text-white/40" />
                              <span className="text-white/60 truncate">
                                {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {lead.message && (
                        <div>
                          <p className={LABEL}>Observação</p>
                          <div className={VALUE_ROW}>
                            <MessageSquare className="h-3.5 w-3.5 text-white/40 shrink-0 mt-0.5" />
                            <span className="text-white/60">{lead.message}</span>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-white/6 pt-4 space-y-3">
                        <div>
                          <p className={LABEL}>Responsável</p>
                          <Select
                            value={lead.assigned_to || 'unassigned'}
                            onValueChange={(v) => handleInlineUpdate('assigned_to', v === 'unassigned' ? null : v)}
                          >
                            <SelectTrigger className="h-8 text-sm bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Não atribuído" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Não atribuído</SelectItem>
                              {users?.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <p className={LABEL}>Prioridade</p>
                          <Select
                            value={lead.priority}
                            onValueChange={(v) => handleInlineUpdate('priority', v)}
                          >
                            <SelectTrigger className="h-8 text-sm bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="low">Baixa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <p className={LABEL}>Próximo Follow-up</p>
                          <input
                            type="datetime-local"
                            className="h-8 text-sm w-full rounded-md border border-white/10 bg-white/5 px-3 py-1 text-white"
                            defaultValue={lead.next_follow_up_at
                              ? format(new Date(lead.next_follow_up_at), "yyyy-MM-dd'T'HH:mm")
                              : ''}
                            onBlur={(e) => {
                              const val = e.target.value ? new Date(e.target.value).toISOString() : null
                              handleInlineUpdate('next_follow_up_at', val)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {activeTab === 'notas' && <LeadNotesTab leadId={lead.id} />}

                  {/* Histórico de visitas */}
                  {activeTab === 'historico' && <LeadVisitsTab leadId={lead.id} />}
                </div>

                {/* ── Fixed footer ── */}
                <div className="border-t border-white/8 px-6 py-4 flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => onEdit(lead.id)}
                  >
                    Editar Dados
                  </Button>

                  <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 gap-1"
                      >
                        Mudar Status
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                        >
                          <StatusBadge status={status} />
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-auto h-8 w-8 text-white/30 hover:bg-red-500/20 hover:text-red-400"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirm (outside main dialog to avoid nesting issues) */}
      {deleteConfirmOpen && (
        <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className={glassOverlay} />
            <Dialog.Content
              className="fixed left-1/2 top-1/2 z-60 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/8 p-6 outline-none"
              style={{
                background: 'linear-gradient(135deg, rgba(8,8,22,0.97) 0%, rgba(4,4,16,0.95) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.95)',
              }}
            >
              <Dialog.Title className="text-base font-semibold text-white mb-2">
                Excluir cliente?
              </Dialog.Title>
              <p className="text-sm text-white/50 mb-6">
                <strong className="text-white/80">{lead?.full_name}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => setDeleteConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleteLead.isPending}>
                  Excluir
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  )
}

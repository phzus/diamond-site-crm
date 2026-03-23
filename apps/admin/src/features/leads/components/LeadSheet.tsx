'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LeadNotesTab } from './LeadNotesTab'
import { LeadHistoryTab } from './LeadHistoryTab'
import { useLead, useUpdateLeadStatus, useUpdateLead, useDeleteLead } from '../hooks/useLeads'
import { useUsers } from '@/features/users/hooks/useUsers'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Globe, Phone, Mail, ChevronDown, MapPin, UserCheck, MessageSquare, Building2, Cake, CreditCard, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LeadStatus } from '../types/lead.types'

const STATUS_OPTIONS: LeadStatus[] = [
  'new', 'contacted', 'scheduled', 'visited', 'converted', 'discarded'
]

interface LeadSheetProps {
  leadId: string | null
  onClose: () => void
  onEdit: (leadId: string) => void
}

export function LeadSheet({ leadId, onClose, onEdit }: LeadSheetProps) {
  const { data: lead, isLoading } = useLead(leadId || '')
  const { data: users } = useUsers()
  const { data: currentUser } = useCurrentUser()
  const updateStatus = useUpdateLeadStatus()
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)

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
    updateStatus.mutate({
      id: leadId,
      status,
      fromStatus: lead?.status,
      userId: currentUser?.id,
    })
  }

  function handleDelete() {
    if (!leadId || !currentUser) return
    deleteLead.mutate({ id: leadId, userId: currentUser.id }, {
      onSuccess: () => { setDeleteConfirmOpen(false); onClose() },
    })
  }

  return (
    <>
      <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col">
          {isLoading || !lead ? (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ) : (
            <>
              <SheetHeader className="px-6 py-4 border-b space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-tight">{lead.full_name}</h2>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Criado em {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })} ·{' '}
                  {lead.source === 'landing-page' ? 'Landing Page' : 'Manual'}
                </p>
              </SheetHeader>

              <div className="px-6 py-4 border-b space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CPF</p>
                    {lead.cpf ? (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-mono">{lead.cpf}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a href={`mailto:${lead.email}`} className="text-sm hover:underline truncate">
                        {lead.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Telefone</p>
                    {lead.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{lead.phone}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estado</p>
                    {lead.state ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{lead.state}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cidade</p>
                    {lead.city ? (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{lead.city}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Aniversário</p>
                    {lead.birth_date ? (
                      <div className="flex items-center gap-1.5">
                        <Cake className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">
                          {format(new Date(lead.birth_date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Convidado por</p>
                    {lead.invited_by ? (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{lead.invited_by}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Responsável</p>
                  <Select
                    value={lead.assigned_to || 'unassigned'}
                    onValueChange={(v) => handleInlineUpdate('assigned_to', v === 'unassigned' ? null : v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prioridade</p>
                  <Select
                    value={lead.priority}
                    onValueChange={(v) => handleInlineUpdate('priority', v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Próximo Follow-up</p>
                  <input
                    type="datetime-local"
                    className="h-8 text-sm w-full rounded-md border border-input bg-background px-3 py-1"
                    defaultValue={lead.next_follow_up_at
                      ? format(new Date(lead.next_follow_up_at), "yyyy-MM-dd'T'HH:mm")
                      : ''}
                    onBlur={(e) => {
                      const val = e.target.value ? new Date(e.target.value).toISOString() : null
                      handleInlineUpdate('next_follow_up_at', val)
                    }}
                  />
                </div>

                {lead.message && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Observação</p>
                    <div className="flex items-start gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{lead.message}</span>
                    </div>
                  </div>
                )}

                {lead.utm_source && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Origem (UTM)</p>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Tabs defaultValue="notes" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-6 mt-3 w-auto">
                  <TabsTrigger value="notes">Notas</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="notes" className="m-0 h-full">
                    <LeadNotesTab leadId={lead.id} />
                  </TabsContent>
                  <TabsContent value="history" className="m-0 h-full">
                    <LeadHistoryTab leadId={lead.id} />
                  </TabsContent>
                </div>
              </Tabs>

              <div className="border-t px-6 py-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(lead.id)}>
                  Editar Dados
                </Button>

                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
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

                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-white"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Excluir cliente?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O cliente <strong>{lead?.full_name}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLead.isPending}>
              Excluir permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

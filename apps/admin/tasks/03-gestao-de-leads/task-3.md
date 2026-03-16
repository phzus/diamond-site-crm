# Task 3 — Sheet de Detalhes do Lead

## Objetivo
Criar o Sheet (drawer lateral) que abre ao clicar em um lead, exibindo todas as informações, campos editáveis inline, abas de notas e histórico.

## Pré-requisitos
- Tasks 1 e 2 deste módulo concluídas

## Layout do Sheet

```
┌─────────────────────────────────────────┐
│ [← X]  João da Silva     [● Novo]       │
│ Criado 14/03/2026 · landing-page        │
├─────────────────────────────────────────┤
│ EMAIL                TELEFONE           │
│ joao@email.com       (11) 99999-9999    │
│                                         │
│ RESPONSÁVEL          PRIORIDADE         │
│ [Avatar] João        [● Alta]  ▼        │
│                                         │
│ PRÓXIMO FOLLOW-UP                       │
│ [📅 15/03/2026]                         │
├─────────────────────────────────────────┤
│ [Notas]  [Histórico]                    │
│─────────────────────────────────────────│
│  (conteúdo da aba ativa)                │
├─────────────────────────────────────────┤
│ [Editar Dados]  [Status ▼]  [Descartar] │
└─────────────────────────────────────────┘
```

## Passos de Implementação

### 1. Criar hook de notas do lead
Criar `features/leads/hooks/useLeadNotes.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export function useLeadNotes(leadId: string) {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*, author:profiles!lead_notes_created_by_fkey(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}

export function useCreateNote(leadId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ content, userId }: { content: string; userId: string }) => {
      const { error } = await supabase.from('lead_notes').insert({
        lead_id: leadId,
        content,
        created_by: userId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] })
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      toast.success('Nota adicionada.')
    },
    onError: () => toast.error('Erro ao adicionar nota.'),
  })
}

export function useDeleteNote(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('lead_notes').delete().eq('id', noteId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] })
      toast.success('Nota removida.')
    },
  })
}
```

### 2. Criar hook de atividades do lead
Criar `features/leads/hooks/useLeadActivities.ts`:
```typescript
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*, performer:profiles!lead_activities_performed_by_fkey(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}
```

### 3. Criar a aba de Notas
Criar `features/leads/components/LeadNotesTab.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useLeadNotes, useCreateNote, useDeleteNote } from '../hooks/useLeadNotes'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'

export function LeadNotesTab({ leadId }: { leadId: string }) {
  const [content, setContent] = useState('')
  const { data: notes, isLoading } = useLeadNotes(leadId)
  const { data: currentUser } = useCurrentUser()
  const createNote = useCreateNote(leadId)
  const deleteNote = useDeleteNote(leadId)

  function handleAddNote() {
    if (!content.trim() || !currentUser) return
    createNote.mutate(
      { content: content.trim(), userId: currentUser.id },
      { onSuccess: () => setContent('') }
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Formulário de nova nota */}
      <div className="space-y-2">
        <Textarea
          placeholder="Adicionar anotação..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button
          size="sm"
          onClick={handleAddNote}
          disabled={!content.trim() || createNote.isPending}
        >
          Adicionar Nota
        </Button>
      </div>

      {/* Lista de notas */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2].map(i => <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : notes?.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhuma anotação ainda.</p>
      ) : (
        <div className="space-y-3">
          {notes?.map((note: any) => (
            <div key={note.id} className="rounded-md border p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">{note.content}</p>
                {(currentUser?.id === note.created_by || currentUser?.role === 'admin') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNote.mutate(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {note.author?.full_name} · {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 4. Criar a aba de Histórico (Timeline)
Criar `features/leads/components/LeadHistoryTab.tsx`:
```typescript
'use client'

import { useLeadActivities } from '../hooks/useLeadActivities'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { LeadStatus } from '../types/lead.types'

const actionLabels: Record<string, string> = {
  created:        'Lead criado',
  status_changed: 'Status alterado',
  note_added:     'Nota adicionada',
  assigned:       'Responsável atribuído',
  field_updated:  'Dados atualizados',
}

export function LeadHistoryTab({ leadId }: { leadId: string }) {
  const { data: activities, isLoading } = useLeadActivities(leadId)

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />)}
      </div>
    )
  }

  if (!activities?.length) {
    return <p className="text-center text-sm text-muted-foreground py-8">Histórico vazio.</p>
  }

  return (
    <div className="p-4">
      <div className="relative space-y-4">
        {activities.map((activity: any, index: number) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
              {index < activities.length - 1 && (
                <div className="flex-1 w-px bg-border mt-1" />
              )}
            </div>
            <div className="pb-4 min-w-0">
              <p className="text-sm font-medium">{actionLabels[activity.action_type]}</p>
              {activity.action_type === 'status_changed' && (
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={activity.from_value as LeadStatus} />
                  <span className="text-xs text-muted-foreground">→</span>
                  <StatusBadge status={activity.to_value as LeadStatus} />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {activity.performer?.full_name} · {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5. Criar o Sheet principal do Lead
Criar `features/leads/components/LeadSheet.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { StatusBadge, statusConfig } from '@/components/shared/StatusBadge'
import { LeadNotesTab } from './LeadNotesTab'
import { LeadHistoryTab } from './LeadHistoryTab'
import { useLead, useUpdateLeadStatus, useUpdateLead } from '../hooks/useLeads'
import { useUsers } from '@/features/users/hooks/useUsers'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Globe, Phone, Mail, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
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
  const supabase = createClient()

  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)

  // Inline saves: ao alterar responsável, prioridade ou follow-up, salva imediatamente
  async function handleInlineUpdate(field: string, value: any) {
    if (!leadId || !currentUser) return
    await updateLead.mutateAsync({ id: leadId, data: { [field]: value } })
    // Registrar atividade
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
    updateStatus.mutate({ id: leadId, status })
  }

  function handleDiscard() {
    setDiscardConfirmOpen(false)
    handleStatusChange('discarded')
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
              {/* Header */}
              <SheetHeader className="px-6 py-4 border-b space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-tight">{lead.full_name}</h2>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Criado em {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })} ·{' '}
                  {lead.source === 'landing-page' ? 'Landing Page' : 'Manual'}
                </p>
              </SheetHeader>

              {/* Informações */}
              <div className="px-6 py-4 border-b space-y-3">
                {/* Email e Telefone (read-only) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <a href={`mailto:${lead.email}`} className="text-sm hover:underline truncate">
                        {lead.email}
                      </a>
                    </div>
                  </div>
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

                {/* Responsável — editável inline */}
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

                {/* Prioridade — editável inline */}
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

                {/* Próximo Follow-up — editável inline */}
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

                {/* UTM (se houver) */}
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

              {/* Tabs: Notas e Histórico */}
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

              {/* Footer de ações */}
              <div className="border-t px-6 py-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(lead.id)}>
                  Editar Dados
                </Button>

                {/* Mudar Status via Popover (conforme spec) */}
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

                {/* Descartar com confirmação (conforme spec) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive hover:text-destructive"
                  onClick={() => setDiscardConfirmOpen(true)}
                >
                  Descartar
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmação de descarte */}
      <Dialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Descartar lead?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O lead será marcado como Descartado. Esta ação pode ser revertida alterando o status manualmente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDiscard}>Descartar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

## Critérios de Conclusão
- [ ] Sheet abre ao clicar em uma linha da tabela
- [ ] Todas as informações do lead são exibidas
- [ ] **Responsável editável inline** — Select salva ao alterar (sem botão salvar)
- [ ] **Prioridade editável inline** — Select salva ao alterar (sem botão salvar)
- [ ] **Próximo Follow-up editável inline** — date input salva ao perder foco
- [ ] Alterações inline registram atividade `field_updated` na timeline
- [ ] Aba "Notas" mostra notas existentes e permite adicionar/remover
- [ ] Aba "Histórico" mostra a timeline de atividades
- [ ] **"Mudar Status" abre Popover** com as opções de status
- [ ] **"Descartar" abre Dialog de confirmação** antes de executar
- [ ] Botão "Editar Dados" abre o Dialog de edição
- [ ] Sheet fecha com o X ou clicando fora
- [ ] Skeleton exibido enquanto carrega

## Arquivos Criados/Modificados
- `features/leads/hooks/useLeadNotes.ts`
- `features/leads/hooks/useLeadActivities.ts`
- `features/leads/components/LeadNotesTab.tsx`
- `features/leads/components/LeadHistoryTab.tsx`
- `features/leads/components/LeadSheet.tsx`

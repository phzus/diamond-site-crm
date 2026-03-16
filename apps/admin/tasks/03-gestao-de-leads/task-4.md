# Task 4 — Formulários de Criação e Edição de Lead

## Objetivo
Criar os Dialogs de criação manual e edição de lead com React Hook Form + Zod, incluindo registro de atividades após cada operação.

## Pré-requisitos
- Task 1 deste módulo concluída (hooks e services)

## Passos de Implementação

### 1. Criar o schema Zod do lead
Criar `features/leads/schemas/lead.schema.ts`:
```typescript
import { z } from 'zod'

export const leadFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
    .toLowerCase(),
  phone: z
    .string()
    .optional()
    .transform(v => v || null),
  message: z
    .string()
    .max(2000, 'Mensagem muito longa')
    .optional()
    .transform(v => v || null),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assigned_to: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .transform(v => v || null),
})

export type LeadFormValues = z.infer<typeof leadFormSchema>
```

### 2. Criar hook para buscar usuários (para select de responsável)
Criar `features/users/hooks/useUsers.ts`:
```typescript
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useUsers() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}
```

### 3. Criar o formulário reutilizável
Criar `features/leads/components/LeadForm.tsx`:
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadFormSchema, type LeadFormValues } from '../schemas/lead.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/features/users/hooks/useUsers'
import { Loader2 } from 'lucide-react'
import type { Lead } from '../types/lead.types'

interface LeadFormProps {
  defaultValues?: Partial<Lead>
  onSubmit: (values: LeadFormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

export function LeadForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: LeadFormProps) {
  const { data: users } = useUsers()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      full_name:   defaultValues?.full_name || '',
      email:       defaultValues?.email || '',
      phone:       defaultValues?.phone || '',
      message:     defaultValues?.message || '',
      priority:    defaultValues?.priority || 'medium',
      assigned_to: defaultValues?.assigned_to || null,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nome completo *</Label>
        <Input id="full_name" {...register('full_name')} placeholder="João da Silva" />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} placeholder="joao@email.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {/* Telefone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
      </div>

      {/* Prioridade e Responsável lado a lado */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select
            value={watch('priority')}
            onValueChange={(v) => setValue('priority', v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Select
            value={watch('assigned_to') || 'unassigned'}
            onValueChange={(v) => setValue('assigned_to', v === 'unassigned' ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Não atribuído" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Não atribuído</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mensagem/Observação */}
      <div className="space-y-1.5">
        <Label htmlFor="message">Observação inicial</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Informações adicionais sobre o lead..."
          rows={3}
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : submitLabel}
      </Button>
    </form>
  )
}
```

### 4. Criar o Dialog de criação de lead
Criar `features/leads/components/CreateLeadDialog.tsx`:
```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LeadForm } from './LeadForm'
import { useCreateLead } from '../hooks/useLeads'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { LeadFormValues } from '../schemas/lead.schema'

interface CreateLeadDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateLeadDialog({ open, onClose }: CreateLeadDialogProps) {
  const createLead = useCreateLead()
  const { data: currentUser } = useCurrentUser()
  const supabase = createClient()

  async function handleSubmit(values: LeadFormValues) {
    const lead = await createLead.mutateAsync({
      ...values,
      source: 'manual',
      status: 'new',
    })

    // Registrar atividade de criação
    if (lead && currentUser) {
      await supabase.from('lead_activities').insert({
        lead_id: lead.id,
        action_type: 'created',
        to_value: 'manual',
        performed_by: currentUser.id,
      })
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
        </DialogHeader>
        <LeadForm
          onSubmit={handleSubmit}
          isLoading={createLead.isPending}
          submitLabel="Criar Lead"
        />
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Criar o Dialog de edição de lead
Criar `features/leads/components/EditLeadDialog.tsx`:
```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LeadForm } from './LeadForm'
import { useLead, useUpdateLead } from '../hooks/useLeads'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { LeadFormValues } from '../schemas/lead.schema'

interface EditLeadDialogProps {
  leadId: string | null
  onClose: () => void
}

export function EditLeadDialog({ leadId, onClose }: EditLeadDialogProps) {
  const { data: lead } = useLead(leadId || '')
  const updateLead = useUpdateLead()
  const { data: currentUser } = useCurrentUser()
  const supabase = createClient()

  async function handleSubmit(values: LeadFormValues) {
    if (!leadId || !currentUser) return

    await updateLead.mutateAsync({ id: leadId, data: values })

    // Registrar atividade de edição
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      action_type: 'field_updated',
      performed_by: currentUser.id,
    })

    onClose()
  }

  return (
    <Dialog open={!!leadId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        {lead && (
          <LeadForm
            defaultValues={lead}
            onSubmit={handleSubmit}
            isLoading={updateLead.isPending}
            submitLabel="Salvar Alterações"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

## Critérios de Conclusão
- [ ] Schema Zod valida todos os campos corretamente
- [ ] Dialog de criação abre, preenche e salva lead
- [ ] Dialog de edição carrega dados existentes do lead
- [ ] Após criação, lead aparece na lista automaticamente
- [ ] Após edição, dados atualizados aparecem sem refresh
- [ ] Select de responsável lista usuários ativos
- [ ] Atividade de `created` ou `field_updated` registrada na tabela `lead_activities`
- [ ] Campos obrigatórios validados com mensagens claras

## Arquivos Criados/Modificados
- `features/leads/schemas/lead.schema.ts`
- `features/users/hooks/useUsers.ts`
- `features/leads/components/LeadForm.tsx`
- `features/leads/components/CreateLeadDialog.tsx`
- `features/leads/components/EditLeadDialog.tsx`

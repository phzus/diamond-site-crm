# Task 1 — Configurações: Gestão de Usuários (Admin Only)

## Objetivo
Criar a página `/settings/users` acessível apenas para admins, com listagem de usuários, convite por email, alteração de role e remoção.

## Pré-requisitos
- Módulo 02 concluído (middleware protegendo rota admin-only)
- Tabela `profiles` criada com RLS

## Passos de Implementação

### 1. Criar o service de usuários
Criar `features/users/services/users.service.ts`:

> **Nota sobre email:** A tabela `profiles` não armazena email — ele fica em `auth.users`. Para listá-lo, usar a Server Action com service role key para acessar `auth.admin.listUsers()`, ou adicionar email à tabela `profiles` via trigger.
>
> **Solução recomendada:** Adicionar `email` à tabela `profiles` no trigger `handle_new_user`:
> ```sql
> -- Atualizar migration para incluir email na tabela profiles
> ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
>
> -- Atualizar trigger para salvar email:
> CREATE OR REPLACE FUNCTION public.handle_new_user()
> RETURNS TRIGGER AS $$
> BEGIN
>   INSERT INTO public.profiles (id, full_name, role, email)
>   VALUES (
>     NEW.id,
>     COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
>     COALESCE(NEW.raw_user_meta_data->>'role', 'collaborator'),
>     NEW.email
>   );
>   RETURN NEW;
> END;
> $$ LANGUAGE plpgsql SECURITY DEFINER;
> ```
> Criar uma nova migration `supabase migration new add_email_to_profiles` com esse SQL.

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUserRole(userId: string, role: 'admin' | 'collaborator') {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error
}

export async function deactivateUser(userId: string, performedBy: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)

  if (error) throw error

  // Registrar em audit_logs (ação crítica conforme spec §3)
  await supabase.from('audit_logs').insert({
    user_id:       performedBy,
    action:        'user.removed',
    resource_type: 'user',
    resource_id:   userId,
  })
}

export async function updateUserRoleWithAudit(
  userId: string,
  role: 'admin' | 'collaborator',
  performedBy: string
) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) throw error

  // Registrar em audit_logs
  await supabase.from('audit_logs').insert({
    user_id:       performedBy,
    action:        'user.role_changed',
    resource_type: 'user',
    resource_id:   userId,
    metadata:      { new_role: role },
  })
}
```

### 2. Criar Server Action para convidar usuário
Criar `features/users/actions/invite.action.ts`:
```typescript
'use server'

import { createClient as createServerClient } from '@supabase/supabase-js'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  role: z.enum(['admin', 'collaborator']),
})

export async function inviteUserAction(formData: FormData) {
  const parsed = inviteSchema.safeParse({
    email:     formData.get('email'),
    full_name: formData.get('full_name'),
    role:      formData.get('role'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos.' }
  }

  // Usar service role para operações admin
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      full_name: parsed.data.full_name,
      role:      parsed.data.role,
    },
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      return { error: 'Este email já possui uma conta.' }
    }
    return { error: 'Erro ao enviar convite. Tente novamente.' }
  }

  // Registrar em audit_logs (ação crítica conforme spec §3)
  // Nota: o performedBy deve ser obtido da sessão do servidor
  // Usar createClient do @supabase/ssr para obter o usuário logado
  // e inserir em audit_logs com action: 'user.created'

  return { success: true }
}

// IMPORTANTE: Ao implementar, após o inviteUserByEmail bem-sucedido,
// inserir em audit_logs:
// await supabase.from('audit_logs').insert({
//   user_id:       <id do admin que está convidando>,
//   action:        'user.created',
//   resource_type: 'user',
//   metadata:      { invited_email: parsed.data.email, role: parsed.data.role }
// })
```

### 3. Criar hooks de usuários
Criar/atualizar `features/users/hooks/useUsers.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, updateUserRole, deactivateUser } from '../services/users.service'
import { toast } from 'sonner'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'collaborator' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Role atualizado.')
    },
    onError: () => toast.error('Erro ao atualizar role.'),
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário removido.')
    },
    onError: () => toast.error('Erro ao remover usuário.'),
  })
}
```

### 4. Criar o Dialog de convite
Criar `features/users/components/InviteUserDialog.tsx`:
```typescript
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { inviteUserAction } from '../actions/invite.action'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface InviteUserDialogProps {
  open: boolean
  onClose: () => void
}

export function InviteUserDialog({ open, onClose }: InviteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await inviteUserAction(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Convite enviado! O usuário receberá um email.')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Convidar Colaborador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" name="full_name" placeholder="João da Silva" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="joao@diamond.com" required />
          </div>
          <div className="space-y-1.5">
            <Label>Nível de acesso</Label>
            <Select name="role" defaultValue="collaborator">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
            ) : (
              <><Mail className="mr-2 h-4 w-4" />Enviar Convite</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 5. Criar a página de usuários
Criar `app/(admin)/settings/users/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { InviteUserDialog } from '@/features/users/components/InviteUserDialog'
import { useUsers, useUpdateUserRole, useDeactivateUser } from '@/features/users/hooks/useUsers'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { UserPlus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function UsersSettingsPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeUserId, setRemoveUserId] = useState<string | null>(null)

  const { data: users, isLoading } = useUsers()
  const { data: currentUser } = useCurrentUser()
  const updateRole = useUpdateUserRole()
  const deactivate = useDeactivateUser()

  const activeUsers = users?.filter(u => u.is_active)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Usuários"
        description="Gerencie os colaboradores com acesso ao CRM"
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-md border divide-y">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : activeUsers?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum colaborador ainda.
            </div>
          ) : (
            activeUsers?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {user.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">Você</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Desde {format(new Date(user.created_at), 'MMM yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.id !== currentUser?.id ? (
                    <>
                      <Select
                        value={user.role}
                        onValueChange={(role) =>
                          updateRole.mutate({ userId: user.id, role: role as any })
                        }
                      >
                        <SelectTrigger className="w-36 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="collaborator">Colaborador</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoveUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog convite */}
      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />

      {/* Dialog confirmação remoção */}
      <Dialog open={!!removeUserId} onOpenChange={(o) => !o && setRemoveUserId(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Remover usuário?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O usuário perderá o acesso ao CRM imediatamente. Esta ação pode ser revertida pelo banco de dados.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveUserId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (removeUserId) {
                  deactivate.mutate(removeUserId)
                  setRemoveUserId(null)
                }
              }}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## Critérios de Conclusão
- [ ] Página `/settings/users` inacessível para `collaborator` (redireciona para `/unauthorized`)
- [ ] Lista todos os usuários ativos com nome, role e data de entrada
- [ ] Usuário atual marcado com badge "Você" (sem opções de editar/remover a si mesmo)
- [ ] Select de role atualiza imediatamente
- [ ] Botão "Convidar" abre Dialog com formulário
- [ ] Convite envia email via Supabase `inviteUserByEmail`
- [ ] Dialog de confirmação antes de remover
- [ ] Usuário removido some da lista (soft delete — `is_active: false`)

## Arquivos Criados/Modificados
- `features/users/services/users.service.ts`
- `features/users/actions/invite.action.ts`
- `features/users/hooks/useUsers.ts` (atualizado)
- `features/users/components/InviteUserDialog.tsx`
- `app/(admin)/settings/users/page.tsx`

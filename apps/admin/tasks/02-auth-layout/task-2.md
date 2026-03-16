# Task 2 — Página de Login

## Objetivo
Criar a página de login em `/login` com email e senha, integrada ao Supabase Auth. Sem opção de cadastro público.

## Pré-requisitos
- Task 1 deste módulo concluída

## Passos de Implementação

### 1. Criar o schema de validação
Criar `features/auth/schemas/login.schema.ts`:
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
```

### 2. Criar a Server Action de login
Criar `features/auth/actions/login.action.ts`:
```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'Email ou senha incorretos.' }
  }

  redirect('/dashboard')
}
```

### 3. Criar o componente do formulário de login
Criar `features/auth/components/LoginForm.tsx`:
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import { loginAction } from '../actions/login.action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setLoading(true)
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)

    const result = await loginAction(formData)

    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}
```

### 4. Criar a página de login
Criar `app/(auth)/login/page.tsx`:
```typescript
import { LoginForm } from '@/features/auth/components/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  // Se já está logado, redirecionar para dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Diamond CRM</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso restrito — apenas colaboradores autorizados
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
```

### 5. Criar o layout para rotas de auth
Criar `app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

## Critérios de Conclusão
- [ ] Página `/login` renderiza corretamente
- [ ] Login com credenciais corretas redireciona para `/dashboard`
- [ ] Login com credenciais incorretas exibe toast de erro
- [ ] Campos com validação Zod (email inválido, senha curta)
- [ ] Usuário já logado é redirecionado automaticamente
- [ ] Sem link ou opção de "criar conta"

## Arquivos Criados/Modificados
- `features/auth/schemas/login.schema.ts`
- `features/auth/actions/login.action.ts`
- `features/auth/components/LoginForm.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/layout.tsx`

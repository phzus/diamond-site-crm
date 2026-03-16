# Task 5 — AuthProvider, Breadcrumbs e Error Boundaries

## Objetivo
Criar os componentes faltantes da arquitetura definida na spec: `AuthProvider`, `Breadcrumbs` e os `error.tsx` de error boundary em cada rota principal.

## Pré-requisitos
- Tasks 1, 2, 3 e 4 deste módulo concluídas

## Passos de Implementação

### 1. Criar o AuthProvider
Spec §8 define `providers/AuthProvider.tsx` explicitamente.

Criar `providers/AuthProvider.tsx`:
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoading(false)
    })

    // Listener para mudanças de sessão (logout, expiração)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

Adicionar `AuthProvider` ao root layout (`app/layout.tsx`), dentro do `QueryProvider`:
```typescript
import { AuthProvider } from '@/providers/AuthProvider'

// No JSX:
<ThemeProvider>
  <QueryProvider>
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </QueryProvider>
</ThemeProvider>
```

---

### 2. Criar o componente Breadcrumbs
Spec §8 define `components/layout/Breadcrumbs.tsx`.

Criar `components/layout/Breadcrumbs.tsx`:
```typescript
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeLabels: Record<string, string> = {
  dashboard:  'Dashboard',
  leads:      'Leads',
  settings:   'Configurações',
  users:      'Usuários',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null // Não mostra na raiz

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground px-6 py-2 border-b">
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = routeLabels[segment] || segment
        const isLast = index === segments.length - 1

        return (
          <div key={href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {isLast ? (
              <span className={cn('font-medium', 'text-foreground')}>{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

Adicionar o `Breadcrumbs` ao layout autenticado (`app/(admin)/layout.tsx`):
```typescript
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

### 3. Criar Error Boundaries (error.tsx) nas rotas principais
Spec §8: `"error boundaries em todas as rotas principais."`

No Next.js App Router, error boundaries são criados com arquivos `error.tsx` em cada pasta de rota.

Criar `app/(admin)/error.tsx` (captura erros em todo o layout admin):
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Admin Error]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4 max-w-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Algo deu errado</h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
          <Button onClick={reset}>Tentar novamente</Button>
        </div>
      </div>
    </div>
  )
}
```

Criar também `app/(admin)/leads/error.tsx` e `app/(admin)/settings/users/error.tsx` com o mesmo conteúdo (ou importar o componente reutilizável).

---

### 4. Criar componentes reutilizáveis: EmptyState e ConfirmDialog
Spec §8 lista `components/shared/EmptyState` e `components/shared/ConfirmDialog`.

Criar `components/shared/EmptyState.tsx`:
```typescript
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-3', className)}>
      <p className="text-sm text-muted-foreground text-center">{message}</p>
      {action}
    </div>
  )
}
```

Criar `components/shared/ConfirmDialog.tsx`:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  confirmVariant?: 'default' | 'destructive'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'default',
  onConfirm, onCancel
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

> Com o `ConfirmDialog` reutilizável, substituir os Dialogs inline de confirmação nas tasks onde foram criados inline (Sheet/Descartar, Users/Remover).

---

## Critérios de Conclusão
- [ ] `AuthProvider` criado e adicionado ao root layout
- [ ] `useAuth()` hook disponível e retorna o usuário atual
- [ ] `Breadcrumbs` renderiza trilha de navegação nas subpáginas
- [ ] Breadcrumbs **não aparece** na página raiz/dashboard de nível 1
- [ ] `app/(admin)/error.tsx` criado e captura erros no layout admin
- [ ] `EmptyState` componente criado em `components/shared/`
- [ ] `ConfirmDialog` componente criado em `components/shared/`

## Arquivos Criados/Modificados
- `providers/AuthProvider.tsx`
- `app/layout.tsx` (adicionar AuthProvider)
- `app/(admin)/layout.tsx` (adicionar Breadcrumbs)
- `components/layout/Breadcrumbs.tsx`
- `app/(admin)/error.tsx`
- `app/(admin)/leads/error.tsx`
- `app/(admin)/settings/users/error.tsx`
- `components/shared/EmptyState.tsx`
- `components/shared/ConfirmDialog.tsx`

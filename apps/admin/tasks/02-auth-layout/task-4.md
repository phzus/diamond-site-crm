# Task 4 — Layout Principal: Sidebar, Header e Providers

## Objetivo
Criar o layout autenticado com sidebar colapsável, header, breadcrumbs e configurar todos os providers globais (QueryClient, Theme, Sonner).

## Pré-requisitos
- Tasks 1, 2 e 3 deste módulo concluídas

## Passos de Implementação

### 1. Criar os Providers globais
Criar `providers/QueryProvider.tsx`:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60, // 1 minuto
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Criar `providers/ThemeProvider.tsx`:
```typescript
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

### 2. Atualizar o root layout
Editar `app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Diamond CRM',
  description: 'Painel administrativo Diamond',
  robots: 'noindex, nofollow', // CRM interno — não indexar
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 3. Criar a Sidebar
Criar `components/layout/AppSidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/features/auth/actions/logout.action'
import {
  LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
]

const adminNavItems = [
  { href: '/settings/users', label: 'Usuários', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { data: user } = useCurrentUser()
  const isAdmin = user?.role === 'admin'

  return (
    <aside className={cn(
      'relative flex flex-col border-r bg-card transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b">
        {!collapsed && (
          <span className="text-lg font-bold">Diamond CRM</span>
        )}
      </div>

      {/* Nav principal */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              pathname.startsWith(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {isAdmin && (
          <>
            <Separator className="my-2" />
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  pathname.startsWith(item.href)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Usuário + Logout */}
      <div className="border-t p-2 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {user.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <form action={logoutAction}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className={cn('w-full text-muted-foreground', collapsed ? 'px-0 justify-center' : 'justify-start gap-3')}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Sair'}
          </Button>
        </form>
      </div>

      {/* Botão colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm"
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft className="h-3 w-3" />
        }
      </button>
    </aside>
  )
}
```

### 4. Criar o layout autenticado
Criar `app/(admin)/layout.tsx`:
```typescript
import { AppSidebar } from '@/components/layout/AppSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

### 5. Criar componente de página padrão (header interno)
Criar `components/layout/PageHeader.tsx`:
```typescript
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

### 5. Framer Motion — Transições de página e microinterações
Spec §2 define Framer Motion para "transições de página e microinterações". Usar nos seguintes pontos:

```typescript
// Em app/(admin)/layout.tsx — envolver o <main> com AnimatePresence para transições entre rotas:
import { motion, AnimatePresence } from 'framer-motion'

// No layout:
<AnimatePresence mode="wait">
  <motion.main
    key={/* pathname */}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15 }}
    className="flex-1 overflow-y-auto"
  >
    {children}
  </motion.main>
</AnimatePresence>
```

Para microinterações, usar `motion.div` nos cards de métricas do Dashboard e nos cards do Kanban (já está no KanbanCard com CSS transitions — Framer Motion pode substituir se desejado).

### 6. Sidebar responsiva em mobile
Spec §2 (Mobile First) e checklist §11 exigem layout 100% responsivo.

Em mobile (tela < `md`), a sidebar deve virar um **drawer** controlado por estado:

```typescript
// Em AppSidebar.tsx — adicionar suporte mobile:
// A sidebar usa Sheet do Shadcn/UI em mobile
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery' // hook utilitário

// Hook simples:
// export function useMediaQuery(query: string) {
//   const [matches, setMatches] = useState(false)
//   useEffect(() => {
//     const mq = window.matchMedia(query)
//     setMatches(mq.matches)
//     const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
//     mq.addEventListener('change', handler)
//     return () => mq.removeEventListener('change', handler)
//   }, [query])
//   return matches
// }

// No layout (admin)/layout.tsx — exibir botão de menu em mobile:
// <button className="md:hidden p-2" onClick={() => setSidebarOpen(true)}>
//   <Menu className="h-5 w-5" />
// </button>
//
// Em mobile: <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
// Em desktop: sidebar estática normalmente
```

## Critérios de Conclusão
- [ ] Sidebar renderiza com itens de navegação
- [ ] Itens admin só aparecem para usuários com role `admin`
- [ ] Sidebar colapsável funciona em desktop (toggle com animação)
- [ ] **Em mobile (< md): sidebar vira drawer** (Sheet do Shadcn) acionado por botão
- [ ] Nome e role do usuário aparecem no rodapé da sidebar
- [ ] Logout funcional via botão na sidebar
- [ ] Tema dark/light toggle funcional
- [ ] Toaster (Sonner) configurado no root layout
- [ ] **Framer Motion aplicado nas transições de página** (AnimatePresence no layout admin)
- [ ] `useMediaQuery` hook criado em `lib/hooks/useMediaQuery.ts`

## Arquivos Criados/Modificados
- `providers/QueryProvider.tsx`
- `providers/ThemeProvider.tsx`
- `app/layout.tsx`
- `app/(admin)/layout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/PageHeader.tsx`

# Task 3 — Middleware de Proteção de Rotas

## Objetivo
Criar o middleware do Next.js que protege todas as rotas autenticadas, valida a sessão e aplica controle de acesso por role.

## Pré-requisitos
- Tasks 1 e 2 deste módulo concluídas

## Passos de Implementação

### 1. Criar o middleware
Criar `middleware.ts` na raiz de `apps/admin/`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login']
const ADMIN_ONLY_ROUTES = ['/settings/users', '/settings/audit']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Rotas públicas — qualquer um pode acessar
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Se já está logado e tentando acessar login, redirecionar
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Todas as outras rotas requerem autenticação
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar role para rotas admin-only
  if (ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2. Criar página de acesso negado
Criar `app/unauthorized/page.tsx`:
```typescript
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <ShieldX className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
        <Button asChild>
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
```

### 3. Criar hook para acessar o usuário atual no cliente
Criar `features/auth/hooks/useCurrentUser.ts`:
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export function useCurrentUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return profile
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
```

### 4. Criar action de logout
Criar `features/auth/actions/logout.action.ts`:
```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

## Critérios de Conclusão
- [ ] Acessar `/dashboard` sem login redireciona para `/login`
- [ ] Após login, redirecionamento para `/dashboard` funciona
- [ ] Rota `/settings/users` com usuário `collaborator` redireciona para `/unauthorized`
- [ ] Rota `/settings/users` com usuário `admin` funciona normalmente
- [ ] Logout limpa a sessão e redireciona para `/login`
- [ ] Imagens e assets estáticos não passam pelo middleware

## Arquivos Criados/Modificados
- `middleware.ts`
- `app/unauthorized/page.tsx`
- `features/auth/hooks/useCurrentUser.ts`
- `features/auth/actions/logout.action.ts`

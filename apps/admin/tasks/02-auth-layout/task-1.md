# Task 1 — Setup do Projeto Next.js e Supabase Client

## Objetivo
Inicializar o projeto Next.js 15 no monorepo, instalar todas as dependências definidas na spec e configurar os clientes Supabase para browser e server.

## Pré-requisitos
- Task banco-de-dados/task-1 concluída (.env.local criado)
- pnpm configurado no monorepo

> **Executar task-0 (Design System) em paralelo ou antes** — ela define o `globals.css` e os assets visuais que serão usados aqui.

## Passos de Implementação

### 1. Criar o app admin no monorepo (se não existir)
```bash
cd apps
pnpm create next-app@latest admin --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

> Se o projeto Next.js já existir, pular para o passo 2.

### 2. Instalar todas as dependências
```bash
cd apps/admin

pnpm add @supabase/ssr @supabase/supabase-js \
  @tanstack/react-query @tanstack/react-table \
  react-hook-form zod @hookform/resolvers \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  framer-motion lucide-react sonner nuqs recharts \
  papaparse next-themes tailwind-merge clsx date-fns use-debounce

pnpm add -D @types/papaparse
```

### 3. Instalar e configurar Shadcn/UI
```bash
cd apps/admin
pnpm dlx shadcn@latest init
```
Responder:
- Style: `Default`
- Base color: `Neutral` ← **não usar Zinc** (vide design-system.md)
- CSS variables: `Yes`

> Após o init, **substituir imediatamente** o `globals.css` gerado pelo conteúdo definido na task-0.
> O Shadcn gera uma paleta genérica que não reflete a identidade Diamond.

Adicionar os componentes que serão usados:
```bash
pnpm dlx shadcn@latest add button input label badge dialog sheet \
  popover dropdown-menu separator avatar toast card tabs \
  select checkbox table command tooltip breadcrumb sidebar
```

### 4. Configurar Tailwind CSS v4
Verificar se `tailwind.config.ts` está correto para v4. Em `app/globals.css`:
```css
@import "tailwindcss";
```

### 5. Criar cliente Supabase para Browser
Criar `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 6. Criar cliente Supabase para Server
Criar `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### 7. Criar tipos TypeScript do banco
```bash
supabase gen types typescript --project-id zcwgxmoibuxskhmbtzka > lib/supabase/types.ts
```

Isso gera os tipos com base no schema real do banco. Rodar novamente após qualquer migration.

### 8. Criar `lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Critérios de Conclusão
- [ ] `pnpm dev` roda sem erros
- [ ] Todas as dependências instaladas
- [ ] Shadcn/UI configurado com componentes base
- [ ] `lib/supabase/client.ts` criado
- [ ] `lib/supabase/server.ts` criado
- [ ] `lib/supabase/types.ts` gerado com os tipos do banco
- [ ] `lib/utils.ts` criado com função `cn`

## Arquivos Criados/Modificados
- `package.json` (dependências)
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/types.ts`
- `lib/utils.ts`
- `components/ui/*` (Shadcn)

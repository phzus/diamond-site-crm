# Task 0 — Design System: Fontes, Tokens e globals.css

## Objetivo
Configurar o design system do admin com base na identidade visual da landing page Diamond. Copiar fontes, logo e definir todos os CSS tokens antes de qualquer componente ser criado.

> **Referência completa**: `apps/admin/design-system.md`

## Pré-requisitos
- Projeto Next.js criado (task-1 pode ser feita em paralelo, mas este arquivo deve existir antes do primeiro `pnpm dev`)

---

## Passos de Implementação

### 1. Copiar Fontes da Landing Page

```bash
# Na raiz do monorepo
mkdir -p apps/admin/public/fonts/HelveticaNowDisplay

cp apps/landing-page/public/fonts/Helvetica\ Now\ Display/HelveticaNowDisplay-Light.woff2    apps/admin/public/fonts/HelveticaNowDisplay/
cp apps/landing-page/public/fonts/Helvetica\ Now\ Display/HelveticaNowDisplay-Regular.woff2  apps/admin/public/fonts/HelveticaNowDisplay/
cp apps/landing-page/public/fonts/Helvetica\ Now\ Display/HelveticaNowDisplay-Medium.woff2   apps/admin/public/fonts/HelveticaNowDisplay/
cp apps/landing-page/public/fonts/Helvetica\ Now\ Display/HelveticaNowDisplay-Bold.woff2     apps/admin/public/fonts/HelveticaNowDisplay/
```

> Somente Helvetica Now Display. **Não copiar** Distrampler — é fonte de marketing, não de UI.

### 2. Copiar Logo e Símbolo

```bash
cp apps/landing-page/public/logo.svg      apps/admin/public/logo.svg
cp apps/landing-page/public/símbolo.svg   apps/admin/public/simbolo.svg

# Favicon
cp apps/landing-page/src/app/favicon-dark-mode.svg   apps/admin/src/app/favicon.svg
```

### 3. Configurar `globals.css`

Substituir o conteúdo gerado pelo Shadcn/UI pelo seguinte:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ============================================================
   FONTES — Helvetica Now Display
   ============================================================ */
@font-face {
  font-family: 'Helvetica Now Display';
  src: url('/fonts/HelveticaNowDisplay/HelveticaNowDisplay-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Helvetica Now Display';
  src: url('/fonts/HelveticaNowDisplay/HelveticaNowDisplay-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Helvetica Now Display';
  src: url('/fonts/HelveticaNowDisplay/HelveticaNowDisplay-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Helvetica Now Display';
  src: url('/fonts/HelveticaNowDisplay/HelveticaNowDisplay-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* ============================================================
   TOKENS DE COR — Dark Mode (padrão)
   ============================================================ */
:root {
  /* Fundos */
  --background:   0 0% 0%;       /* #000000 */
  --card:         0 0% 3.9%;     /* #0a0a0a */
  --popover:      0 0% 3.9%;
  --secondary:    0 0% 10%;      /* #1a1a1a */
  --input:        0 0% 15%;      /* #262626 */
  --border:       0 0% 15%;

  /* Texto */
  --foreground:           0 0% 100%;  /* #ffffff */
  --card-foreground:      0 0% 100%;
  --popover-foreground:   0 0% 100%;
  --secondary-foreground: 0 0% 100%;
  --muted:                0 0% 10%;
  --muted-foreground:     0 0% 63%;   /* #a0a0a0 */

  /* Primário */
  --primary:              0 0% 100%;
  --primary-foreground:   0 0% 0%;
  --accent:               0 0% 100%;
  --accent-foreground:    0 0% 0%;

  /* Destrutivo */
  --destructive:          0 100% 60%;  /* #ff3333 */
  --destructive-foreground: 0 0% 100%;

  /* Ring (focus) */
  --ring: 0 0% 100%;

  /* Radius */
  --radius: 0.5rem;

  /* Sidebar */
  --sidebar:                    0 0% 3.9%;
  --sidebar-foreground:         0 0% 100%;
  --sidebar-primary:            0 0% 100%;
  --sidebar-primary-foreground: 0 0% 0%;
  --sidebar-accent:             0 0% 10%;
  --sidebar-accent-foreground:  0 0% 100%;
  --sidebar-border:             0 0% 15%;
  --sidebar-ring:               0 0% 100%;

  /* Status dos leads (extras — não existem na landing page) */
  --status-new:        221 83% 53%;  /* blue-600 */
  --status-contacted:  38 92% 50%;   /* amber-500 */
  --status-scheduled:  271 91% 65%;  /* purple-500 */
  --status-visited:    25 95% 53%;   /* orange-500 */
  --status-converted:  142 71% 45%;  /* green-500 */
  --status-discarded:  0 0% 42%;     /* gray-500 */

  /* Prioridade (borda dos cards Kanban) */
  --priority-high:   0 84% 60%;    /* red-500 */
  --priority-medium: 38 92% 50%;   /* amber-500 */
  --priority-low:    0 0% 42%;     /* gray-500 */
}

/* Light mode opcional */
.light {
  --background:           0 0% 100%;
  --card:                 0 0% 96%;  /* #f5f5f5 */
  --popover:              0 0% 96%;
  --secondary:            0 0% 90%;  /* #e5e5e5 */
  --input:                0 0% 83%;  /* #d4d4d4 */
  --border:               0 0% 83%;
  --foreground:           0 0% 0%;
  --card-foreground:      0 0% 0%;
  --popover-foreground:   0 0% 0%;
  --secondary-foreground: 0 0% 0%;
  --muted:                0 0% 90%;
  --muted-foreground:     0 0% 32%;  /* #525252 */
  --primary:              0 0% 0%;
  --primary-foreground:   0 0% 100%;
  --accent:               0 0% 0%;
  --accent-foreground:    0 0% 100%;
  --destructive:          0 72% 51%;  /* #dc2626 */
  --destructive-foreground: 0 0% 100%;
  --ring:                 0 0% 0%;
  --sidebar:              0 0% 96%;
  --sidebar-foreground:   0 0% 0%;
  --sidebar-primary:      0 0% 0%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent:       0 0% 90%;
  --sidebar-accent-foreground: 0 0% 0%;
  --sidebar-border:       0 0% 83%;
  --sidebar-ring:         0 0% 0%;
}

/* ============================================================
   THEME INLINE — Tailwind v4
   ============================================================ */
@theme inline {
  --color-background:           hsl(var(--background));
  --color-foreground:           hsl(var(--foreground));
  --color-card:                 hsl(var(--card));
  --color-card-foreground:      hsl(var(--card-foreground));
  --color-popover:              hsl(var(--popover));
  --color-popover-foreground:   hsl(var(--popover-foreground));
  --color-primary:              hsl(var(--primary));
  --color-primary-foreground:   hsl(var(--primary-foreground));
  --color-secondary:            hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted:                hsl(var(--muted));
  --color-muted-foreground:     hsl(var(--muted-foreground));
  --color-accent:               hsl(var(--accent));
  --color-accent-foreground:    hsl(var(--accent-foreground));
  --color-destructive:          hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border:               hsl(var(--border));
  --color-input:                hsl(var(--input));
  --color-ring:                 hsl(var(--ring));
  --color-sidebar:              hsl(var(--sidebar));
  --color-sidebar-foreground:   hsl(var(--sidebar-foreground));
  --color-sidebar-primary:      hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent:       hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border:       hsl(var(--sidebar-border));
  --color-sidebar-ring:         hsl(var(--sidebar-ring));

  --radius-sm:  calc(var(--radius) - 4px);
  --radius-md:  calc(var(--radius) - 2px);
  --radius-lg:  var(--radius);
  --radius-xl:  calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);

  --font-sans: 'Helvetica Now Display', system-ui, sans-serif;
}

/* ============================================================
   BASE STYLES
   ============================================================ */
* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: 'Helvetica Now Display', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ============================================================
   UTILITÁRIOS COMPARTILHADOS COM A LANDING PAGE
   ============================================================ */

/* Texto com gradiente Diamond */
.text-gradient {
  background-image: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass effect */
.glass {
  background-color: hsl(var(--background) / 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Scrollbar customizada (para colunas do Kanban) */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 2px;
}
```

### 4. Configurar `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // CSP Headers (Task Fase 7, mas estrutura já criada aqui)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### 5. Configurar `app/layout.tsx` com a fonte

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diamond CRM',
  description: 'Painel interno de gestão de leads — Diamond',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

> Os Providers (TanStack Query, Sonner, ThemeProvider) serão adicionados em task-4.

### 6. Criar componente `StatusBadge`

Criar `components/shared/StatusBadge.tsx`:

```tsx
import { cn } from '@/lib/utils'

const statusConfig = {
  new:       { label: 'Novo',            classes: 'bg-blue-700/20  text-blue-200  border-blue-700/30' },
  contacted: { label: 'Contactado',      classes: 'bg-yellow-800/20 text-yellow-200 border-yellow-700/30' },
  scheduled: { label: 'Visita Agendada', classes: 'bg-purple-900/20 text-purple-200 border-purple-700/30' },
  visited:   { label: 'Visitou',         classes: 'bg-orange-800/20 text-orange-200 border-orange-700/30' },
  converted: { label: 'Convertido',      classes: 'bg-green-900/20  text-green-200  border-green-700/30' },
  discarded: { label: 'Descartado',      classes: 'bg-white/5       text-gray-500   border-white/10' },
} as const

type Status = keyof typeof statusConfig

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes } = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        classes,
        className
      )}
    >
      {label}
    </span>
  )
}
```

### 7. Criar componente `PriorityIndicator`

Criar `components/shared/PriorityIndicator.tsx`:

```tsx
import { cn } from '@/lib/utils'

const priorityConfig = {
  high:   { label: 'Alta',   dotClass: 'bg-red-500' },
  medium: { label: 'Média',  dotClass: 'bg-amber-500' },
  low:    { label: 'Baixa',  dotClass: 'bg-gray-500' },
} as const

type Priority = keyof typeof priorityConfig

interface PriorityIndicatorProps {
  priority: Priority
  showLabel?: boolean
  className?: string
}

export function PriorityIndicator({
  priority,
  showLabel = true,
  className,
}: PriorityIndicatorProps) {
  const { label, dotClass } = priorityConfig[priority]

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('h-2 w-2 rounded-full', dotClass)} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </span>
  )
}
```

---

## Critérios de Conclusão

- [ ] Fontes Helvetica Now Display copiadas para `apps/admin/public/fonts/`
- [ ] `logo.svg` e `simbolo.svg` em `apps/admin/public/`
- [ ] `favicon.svg` em `apps/admin/src/app/`
- [ ] `globals.css` com tokens Diamond (escala de cinzas + cores de status)
- [ ] `app/layout.tsx` com favicon e `suppressHydrationWarning`
- [ ] `next.config.ts` com headers de segurança base
- [ ] `components/shared/StatusBadge.tsx` criado e funcional
- [ ] `components/shared/PriorityIndicator.tsx` criado e funcional
- [ ] Interface visualmente coerente com a landing page ao renderizar

## Arquivos Criados/Modificados

- `public/fonts/HelveticaNowDisplay/*.woff2`
- `public/logo.svg`
- `public/simbolo.svg`
- `src/app/favicon.svg`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `next.config.ts`
- `src/components/shared/StatusBadge.tsx`
- `src/components/shared/PriorityIndicator.tsx`

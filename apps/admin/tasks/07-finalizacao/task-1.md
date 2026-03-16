# Task 1 — CSP Headers, Dark Mode e Configurações de Produção

## Objetivo
Configurar Content Security Policy no Next.js, garantir dark mode funcional e preparar o projeto para deploy na Vercel.

## Pré-requisitos
- Todos os módulos anteriores concluídos

## Passos de Implementação

### 1. Configurar CSP e Headers de segurança
Editar `next.config.ts`:
```typescript
import type { NextConfig } from 'next'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://zcwgxmoibuxskhmbtzka.supabase.co;
  font-src 'self';
  connect-src 'self' https://zcwgxmoibuxskhmbtzka.supabase.co wss://zcwgxmoibuxskhmbtzka.supabase.co;
  frame-ancestors 'none';
`.replace(/\n/g, ' ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy',   value: cspHeader },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
```

### 2. Garantir dark mode funcional
Verificar que `ThemeProvider` em `providers/ThemeProvider.tsx` está com `defaultTheme="dark"` e `enableSystem`.

Adicionar toggle de tema na sidebar (botão simples):
```typescript
// Em AppSidebar.tsx, adicionar import:
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

// Dentro do componente, antes do logout:
const { theme, setTheme } = useTheme()

// Botão no footer da sidebar:
<Button
  variant="ghost"
  size="sm"
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className={cn('w-full text-muted-foreground', collapsed ? 'px-0 justify-center' : 'justify-start gap-3')}
>
  {theme === 'dark'
    ? <Sun className="h-4 w-4 shrink-0" />
    : <Moon className="h-4 w-4 shrink-0" />
  }
  {!collapsed && (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro')}
</Button>
```

### 3. Configurar variáveis de ambiente na Vercel
No dashboard da Vercel, em `admin.diamondjp.com.br`, adicionar as variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=https://zcwgxmoibuxskhmbtzka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a8qrJgLzrOsMd8Yk-X-bTw_HopmGsRG
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
```

### 4. Configurar o subdomínio na Vercel
- No painel da Vercel, adicionar domínio customizado: `admin.diamondjp.com.br`
- Configurar o DNS com o CNAME fornecido pela Vercel
- Aguardar propagação (até 48h)

### 5. Verificar robots.txt / noindex
O layout já adiciona `robots: 'noindex, nofollow'` no metadata. Verificar que está presente em `app/layout.tsx`.

### 6. Testar geração de tipos antes do deploy
```bash
# Regenerar tipos com o schema final
supabase gen types typescript --project-id zcwgxmoibuxskhmbtzka > lib/supabase/types.ts
```

## Critérios de Conclusão
- [ ] `next.config.ts` com CSP headers configurados
- [ ] `X-Frame-Options: DENY` ativo (bloqueia iframe)
- [ ] Toggle dark/light mode funciona na sidebar
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `pnpm build` sem erros de TypeScript
- [ ] Deploy bem-sucedido em `admin.diamondjp.com.br`
- [ ] CRM não aparece em buscas do Google (noindex)

## Arquivos Criados/Modificados
- `next.config.ts`
- `components/layout/AppSidebar.tsx` (toggle de tema)

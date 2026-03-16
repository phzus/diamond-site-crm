# Diamond CRM Admin — Especificações Técnicas (v2)

> Documento de referência para o agente implementador. Todas as decisões de arquitetura, UX e banco de dados estão definidas aqui. Em caso de ambiguidade, seguir a especificação à risca.

---

## 1. Contexto do Produto

O Diamond CRM Admin é um painel interno para gestão de leads de uma **casa de apostas local**. Os clientes chegam via landing page e o objetivo do CRM é **converter o interesse online em visitas físicas ao estabelecimento**. Não há negociação virtual — o funil termina quando o cliente visita ou é descartado.

**Usuários do sistema:** Colaboradores internos da Diamond (atendentes, gerentes). Não há acesso público.

---

## 2. Stack Tecnológica

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Estilização**: Tailwind CSS v4
- **Componentes**: Shadcn/UI (Radix UI)
- **Ícones**: Lucide React
- **Animações**: Framer Motion (transições de página e microinterações)

### Estado & Data Fetching
- **TanStack Query (React Query) v5**: Cache, refetch automático e estado assíncrono
- **TanStack Table v8**: DataTable com paginação, ordenação e filtros
- **Nuqs**: Sincronização de filtros e busca com URL params

### Drag & Drop (Kanban)
- **@dnd-kit/core + @dnd-kit/sortable**: Drag & Drop acessível e performático para o Kanban

### Formulários & Validação
- **React Hook Form**: Gestão de formulários
- **Zod**: Validação de schema em formulários e na API

### Feedback & Notificações
- **Sonner**: Toasts e notificações

### Tema
- **next-themes**: Dark/Light mode

### Backend & Infra
- **Database + Auth**: Supabase Cloud (PostgreSQL + Supabase Auth)
- **Hospedagem**: Vercel (`admin.diamondjp.com.br`)
- **Estrutura**: Monorepo via pnpm workspaces

### Gráficos
- **Recharts**: Cards de analytics no dashboard

---

## 3. Segurança

### Autenticação
- Login via **email e senha** (Supabase Auth). Sem registro público — contas são criadas exclusivamente pelo admin.
- **Sem MFA** — login simples e direto.
- **Rate limiting no login**: máximo de 5 tentativas por 15 minutos por IP (configurado via Supabase Auth settings).
- **Política de senha mínima**: 8 caracteres (configurado no Supabase Auth).
- **Auto-logout**: Sessão expira após 8 horas de inatividade (configurado via `session_timebox` no Supabase Auth).

### Autorização
- **RBAC**: Roles definidas na tabela `profiles` — `admin` e `collaborator`.
- **RLS (Row Level Security)**: Todas as tabelas possuem políticas RLS ativas. Nenhum dado é acessível sem autenticação válida.
- **Middleware Next.js**: Redireciona rotas protegidas para `/login` se não houver sessão ativa. Redireciona para `/unauthorized` se o role não tiver permissão.

### Proteções Gerais
- **CSP Headers**: Configurados via `next.config.ts` para bloquear XSS e injeção.
- **Sanitização**: Validação com Zod em todos os inputs antes de qualquer operação no banco.
- **Audit Log**: Todas as ações críticas (criar, editar status, deletar lead, aprovar usuário) são registradas na tabela `audit_logs`.

---

## 4. Roles & Permissões

| Funcionalidade | collaborator | admin |
|---|---|---|
| Ver e gerenciar leads | ✅ | ✅ |
| Adicionar notas a leads | ✅ | ✅ |
| Criar lead manualmente | ✅ | ✅ |
| Exportar leads (CSV) | ✅ | ✅ |
| Ver dashboard de analytics | ✅ | ✅ |
| Gerenciar usuários (criar/remover) | ❌ | ✅ |
| Ver audit logs | ❌ | ✅ |
| Acessar configurações do sistema | ❌ | ✅ |

---

## 5. Modelo de Dados (Supabase PostgreSQL)

### Tabela: `profiles`
Extensão da tabela `auth.users` do Supabase.

```sql
id          uuid (primary key, references auth.users)
full_name   text (not null)
role        text (not null, default: 'collaborator') -- 'admin' | 'collaborator'
avatar_url  text (nullable)
created_at  timestamptz (default: now())
updated_at  timestamptz
```

**RLS**: Usuário autenticado pode ler seu próprio perfil. Somente `admin` pode ler todos os perfis e alterar roles.

---

### Tabela: `leads`

```sql
id                uuid (primary key, default: gen_random_uuid())
full_name         text (not null)
email             text (not null)
phone             text (nullable)
source            text (default: 'landing-page') -- 'landing-page' | 'manual'
status            text (not null, default: 'new')
                  -- Enum: 'new' | 'contacted' | 'scheduled' | 'visited' | 'converted' | 'discarded'
priority          text (not null, default: 'medium')
                  -- Enum: 'low' | 'medium' | 'high'
assigned_to       uuid (nullable, references profiles.id)
tags              text[] (default: '{}')
message           text (nullable)
last_contacted_at timestamptz (nullable)
next_follow_up_at timestamptz (nullable)
-- UTM Tracking
utm_source        text (nullable)
utm_medium        text (nullable)
utm_campaign      text (nullable)
-- Timestamps
created_at        timestamptz (default: now())
updated_at        timestamptz
```

**Constraint de unicidade:** O campo `email` possui um índice unique. Ao receber um lead da landing page com email já existente, a Edge Function deve **atualizar** o `updated_at` e incrementar um campo `submission_count` (int, default: 1) ao invés de criar duplicata.

**RLS**: Qualquer usuário autenticado pode ler e editar leads. Somente `admin` pode deletar.

---

### Tabela: `lead_notes`

```sql
id          uuid (primary key, default: gen_random_uuid())
lead_id     uuid (not null, references leads.id on delete cascade)
content     text (not null)
created_by  uuid (not null, references profiles.id)
created_at  timestamptz (default: now())
```

**RLS**: Qualquer usuário autenticado pode criar e ler notas. Somente o autor ou `admin` pode deletar.

---

### Tabela: `lead_activities`
Timeline de eventos por lead (gerada automaticamente via triggers ou pela aplicação).

```sql
id            uuid (primary key, default: gen_random_uuid())
lead_id       uuid (not null, references leads.id on delete cascade)
action_type   text (not null)
              -- 'status_changed' | 'note_added' | 'assigned' | 'created' | 'field_updated'
from_value    text (nullable) -- valor anterior
to_value      text (nullable) -- valor novo
performed_by  uuid (not null, references profiles.id)
metadata      jsonb (nullable) -- dados extras quando necessário
created_at    timestamptz (default: now())
```

**RLS**: Qualquer usuário autenticado pode ler. Sistema insere automaticamente.

---

### Tabela: `audit_logs`
Registro de ações administrativas sensíveis.

```sql
id            uuid (primary key, default: gen_random_uuid())
user_id       uuid (not null, references profiles.id)
action        text (not null) -- ex: 'user.created', 'user.removed', 'lead.deleted'
resource_type text (not null) -- ex: 'lead', 'user'
resource_id   uuid (nullable)
metadata      jsonb (nullable)
ip_address    text (nullable)
created_at    timestamptz (default: now())
```

**RLS**: Somente `admin` pode ler. Sistema insere automaticamente.

---

## 6. Funil de Status (Kanban)

O funil é linear e representa a jornada do lead até a visita física.

```
[new] → [contacted] → [scheduled] → [visited] → [converted]
                                                ↘ [discarded] (qualquer etapa)
```

| Status | Label PT | Cor (badge) | Descrição |
|---|---|---|---|
| `new` | Novo | Blue | Lead acabou de chegar, não foi contactado |
| `contacted` | Contactado | Yellow | Já houve contato (ligação, WhatsApp) |
| `scheduled` | Visita Agendada | Purple | Cliente confirmou que vai visitar |
| `visited` | Visitou | Orange | Cliente esteve no estabelecimento |
| `converted` | Convertido | Green | Cliente virou apostador ativo |
| `discarded` | Descartado | Red/Muted | Sem interesse ou sem resposta |

---

## 7. Funcionalidades MVP

### 7.1 Autenticação
- Página `/login` com email e senha.
- Redirecionamento automático para `/dashboard` após login.
- Logout disponível no menu do usuário na sidebar.
- **Sem cadastro público.** Admin cria contas pelo painel em `/settings/users`.

### 7.2 Dashboard
Página inicial após login. Exibe:

**Cards de métricas (últimos 30 dias):**
1. **Total de Leads** — contagem total no período
2. **Leads Novos Hoje** — criados no dia atual
3. **Visitas Agendadas** — leads com status `scheduled`
4. **Taxa de Conversão** — `(converted / total) * 100` em %

**Gráfico de barras (Recharts):** Distribuição de leads por status no período.

**Tabela de leads recentes:** Últimos 10 leads criados com link para detalhes.

O dashboard **não tem realtime**. TanStack Query faz refetch automático a cada **60 segundos** em background (via `refetchInterval`).

### 7.3 Gestão de Leads — Visualização Lista

Rota: `/leads`

- **DataTable (TanStack Table)** com as colunas: Nome, Email, Telefone, Status (badge colorido), Prioridade, Responsável, Data de Criação, Ações.
- **Paginação server-side**: 25 leads por página.
- **Ordenação** por qualquer coluna.
- **Filtros persistidos na URL (Nuqs)**:
  - Por status (multi-select)
  - Por prioridade
  - Por responsável
  - Por período (created_at)
  - Por source (`landing-page` | `manual`)
- **Busca por texto**: nome ou email, debounce de 300ms, persistida na URL.
- **Bulk actions**: Seleção múltipla via checkbox → botão de ação em lote (mudar status, atribuir responsável, exportar selecionados).
- **Botão "Novo Lead"**: Abre Dialog para criação manual.

### 7.4 Gestão de Leads — Visualização Kanban

Rota: `/leads?view=kanban` (alternância via toggle na toolbar, persistida na URL)

- **6 colunas** correspondendo aos status do funil.
- Cada card exibe: nome, email, telefone, prioridade (cor da borda), responsável (avatar), data de criação.
- **Drag & Drop** via `@dnd-kit` — ao soltar o card em outra coluna, status é atualizado imediatamente com **optimistic update** (TanStack Query).
- Em caso de erro na atualização, o card retorna à posição original com toast de erro.
- Colunas com mais de 10 cards mostram scroll interno.

### 7.5 Detalhes do Lead — Sheet (Drawer)

Ao clicar em qualquer linha da tabela ou card do Kanban, abre um `Sheet` pela direita (largura: 480px desktop, 100% mobile).

**Layout do Sheet:**
```
┌─────────────────────────────────────┐
│ [← Fechar]  Nome do Lead   [Status Badge] │
│ Criado em: 14/03/2026 · Fonte: Landing Page │
├─────────────────────────────────────┤
│ EMAIL          TELEFONE             │
│ nome@email.com (11) 99999-9999      │
│                                     │
│ RESPONSÁVEL         PRIORIDADE      │
│ [Avatar] João       [●] Alta        │
│                                     │
│ PRÓXIMO FOLLOW-UP                   │
│ [📅 Selecionar data]                │
├─────────────────────────────────────┤
│ [Notas] [Histórico]  ← Tabs        │
│                                     │
│ ABA NOTAS:                          │
│ Textarea + botão "Adicionar Nota"   │
│ Lista de notas (autor + data)       │
│                                     │
│ ABA HISTÓRICO:                      │
│ Timeline vertical de lead_activities│
├─────────────────────────────────────┤
│ [Editar] [Mudar Status ▼] [Descartar]│
└─────────────────────────────────────┘
```

- **Campos editáveis inline**: responsável, prioridade, próximo follow-up — salvam automaticamente ao alterar (sem botão de salvar separado).
- **Editar** abre um `Dialog` com o formulário completo do lead.
- **Mudar Status** abre um `Popover` com os status disponíveis.
- **Descartar** abre `Dialog` de confirmação antes de executar.

### 7.6 Criação Manual de Lead

`Dialog` acessível pelo botão "Novo Lead" na toolbar.

**Campos:**
- Nome completo (obrigatório)
- Email (obrigatório, validação de formato)
- Telefone (opcional, máscara BR)
- Mensagem/Observação inicial (opcional)
- Prioridade (select, default: médio)
- Responsável (select com lista de usuários ativos)

Ao salvar, `source` é definido como `manual` e uma entrada é criada em `lead_activities` com `action_type: 'created'`.

### 7.7 Exportação CSV

Disponível na toolbar da lista (e para seleção múltipla).

**Colunas exportadas (nesta ordem):**
`ID, Nome, Email, Telefone, Status, Prioridade, Responsável, Fonte, UTM Source, UTM Medium, UTM Campaign, Criado em, Último Contato, Próximo Follow-up`

- A exportação respeita os **filtros ativos** na tabela.
- Limite de 5.000 linhas por exportação.
- Arquivo gerado no cliente (sem endpoint de API) via biblioteca `papaparse`.

> **Dependência adicional**: `papaparse` para geração de CSV.

### 7.8 Configurações — Gestão de Usuários (somente admin)

Rota: `/settings/users`

- Lista de usuários ativos com nome, email, role e data de criação.
- **Criar usuário**: Admin informa nome, email e role. O Supabase Auth envia email de convite com link para definir senha (fluxo `inviteUserByEmail` da Supabase Auth).
- **Remover usuário**: Dialog de confirmação → usuário é desativado (soft delete: coluna `is_active boolean default true` na tabela `profiles`). Não deleta da `auth.users`.
- **Alterar role**: Toggle simples admin ↔ collaborator.

### 7.9 Empty States

| Contexto | Mensagem | Ação |
|---|---|---|
| Sem leads ainda | "Nenhum lead ainda. Os primeiros chegarão pela landing page." | Botão "Criar Lead Manualmente" |
| Filtro sem resultado | "Nenhum lead encontrado com esses filtros." | Botão "Limpar Filtros" |
| Busca sem resultado | "Nenhum resultado para '[termo]'." | — |
| Sem notas no lead | "Nenhuma anotação ainda." | — |
| Sem atividades | "Histórico vazio." | — |
| Kanban coluna vazia | Ícone sutil + label do status | — |

---

## 8. Arquitetura Frontend

```
src/
├── app/                          # App Router (Next.js)
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (admin)/                  # Layout com Sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── leads/page.tsx
│   │   └── settings/
│   │       └── users/page.tsx
│   └── middleware.ts             # Proteção de rotas
├── features/
│   ├── leads/
│   │   ├── components/           # LeadTable, LeadKanban, LeadSheet, LeadForm
│   │   ├── hooks/                # useLeads, useLead, useUpdateLeadStatus
│   │   ├── services/             # Funções de acesso ao Supabase
│   │   └── schemas/              # Schemas Zod
│   ├── analytics/
│   │   ├── components/           # MetricCard, ConversionChart
│   │   └── hooks/                # useDashboardMetrics
│   └── users/
│       ├── components/           # UserTable, InviteUserDialog
│       └── hooks/                # useUsers
├── components/
│   ├── ui/                       # Componentes Shadcn/UI customizados
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumbs.tsx
│   └── shared/                   # EmptyState, ConfirmDialog, StatusBadge
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   └── server.ts             # createServerClient (Server Components)
│   └── utils.ts
└── providers/
    ├── QueryProvider.tsx
    ├── AuthProvider.tsx
    └── ThemeProvider.tsx
```

**Padrões obrigatórios:**
- Server Components para busca inicial de dados (SSR).
- Client Components apenas onde há interatividade.
- Custom hooks encapsulam toda lógica de TanStack Query.
- Zod valida **antes** de qualquer chamada ao Supabase.
- `error boundaries` em todas as rotas principais.

---

## 9. Setup do Supabase (Instruções para o Agente Implementador)

> O agente implementador deve executar os passos abaixo em ordem, via terminal, antes de qualquer desenvolvimento.

### 9.1 Pré-requisitos

```bash
# Instalar Supabase CLI (caso não instalado)
npm install -g supabase

# Verificar instalação
supabase --version
```

### 9.2 Conectar ao Projeto Supabase

```bash
# Login na conta Supabase
supabase login

# Linkar ao projeto existente (solicitar ao usuário o Project Ref)
# Project Ref está na URL do dashboard: supabase.com/dashboard/project/<PROJECT_REF>
supabase link --project-ref <PROJECT_REF>
```

**Solicitar ao usuário as seguintes credenciais** (encontradas em Project Settings → API):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (somente server-side, nunca expor no cliente)

Criar arquivo `apps/admin/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 9.3 Migrations

Criar as migrations em `supabase/migrations/` e aplicar:

```bash
# Criar nova migration
supabase migration new create_initial_schema

# Aplicar migrations no banco remoto
supabase db push
```

As migrations devem criar, nesta ordem:
1. Extensão `uuid-ossp` (se não existir)
2. Tabela `profiles` + trigger automático que cria profile ao cadastrar usuário em `auth.users`
3. Tabela `leads` com todos os campos e constraints
4. Tabela `lead_notes`
5. Tabela `lead_activities`
6. Tabela `audit_logs`
7. Todas as políticas RLS para cada tabela
8. Índices: `leads(email)` unique, `leads(status)`, `leads(created_at desc)`, `leads(assigned_to)`

### 9.4 Configurações do Supabase Auth (via Dashboard)

No painel do Supabase → Authentication → Settings:
- **Disable email confirmations**: `false` (manter confirmação ativa para convites)
- **Minimum password length**: `8`
- **Session timebox**: `28800` segundos (8 horas)
- **Rate limit**: Manter defaults (já protege contra brute force)
- **Disable signup**: `true` — bloquear cadastro público, apenas convites via `inviteUserByEmail`

### 9.5 Criar Primeiro Usuário Admin

```bash
# Via Supabase CLI — inserir admin inicial
supabase db execute --sql "
  INSERT INTO auth.users (email, ...) -- usar supabase admin API
"
```

> Alternativa recomendada: Usar o dashboard do Supabase → Authentication → Users → "Add User" para criar o primeiro admin manualmente. Após criar, atualizar o role na tabela `profiles` para `admin` diretamente via Supabase Table Editor ou SQL:
> ```sql
> UPDATE profiles SET role = 'admin' WHERE id = '<USER_ID>';
> ```

---

## 10. Integração com Landing Page

A landing page envia leads via **Supabase Edge Function** `receive-lead`.

**Contrato da Edge Function:**
```typescript
// POST /functions/v1/receive-lead
// Headers: Authorization: Bearer <SUPABASE_ANON_KEY>
// Body:
{
  full_name: string,   // obrigatório
  email: string,       // obrigatório, validado com Zod
  phone?: string,
  message?: string,
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string
}
```

**Lógica de deduplicação:**
- Se o `email` já existe na tabela `leads`: atualiza `updated_at`, incrementa `submission_count` e atualiza UTMs se fornecidos. **Não cria duplicata.**
- Se o email é novo: cria lead com `status: 'new'`, `source: 'landing-page'`.

**Resposta de sucesso:** `{ success: true, lead_id: uuid }`
**Resposta de erro:** `{ success: false, error: string }` com status HTTP apropriado.

---

## 11. Checklist de Implementação MVP

### Fase 1 — Infraestrutura
- [ ] Supabase CLI linkado e configurado
- [ ] Migrations executadas com sucesso
- [ ] RLS policies ativas e testadas
- [ ] Variáveis de ambiente configuradas
- [ ] Auth configurado (signup desabilitado, session timebox)
- [ ] Primeiro usuário admin criado

### Fase 2 — Auth & Layout
- [ ] Página de Login (`/login`)
- [ ] Middleware de proteção de rotas
- [ ] Layout principal com AppSidebar
- [ ] Lógica de roles no middleware

### Fase 3 — Gestão de Leads
- [ ] Lista de leads com DataTable
- [ ] Filtros e busca persistidos na URL
- [ ] Sheet de detalhes do lead
- [ ] Criação manual de lead (Dialog)
- [ ] Edição de lead (Dialog)
- [ ] Troca de status (inline no Sheet)
- [ ] Sistema de notas
- [ ] Timeline de atividades
- [ ] Descarte com confirmação
- [ ] Bulk actions

### Fase 4 — Kanban
- [ ] Visualização Kanban com @dnd-kit
- [ ] Drag & Drop com optimistic update
- [ ] Toggle lista ↔ kanban persistido na URL

### Fase 5 — Dashboard & Analytics
- [ ] 4 cards de métricas
- [ ] Gráfico de distribuição por status
- [ ] Tabela de leads recentes

### Fase 6 — Configurações (Admin)
- [ ] Listagem de usuários
- [ ] Convite de novo usuário (email)
- [ ] Remoção de usuário
- [ ] Alteração de role

### Fase 7 — Finalização
- [ ] Exportação CSV com papaparse
- [ ] Edge Function `receive-lead`
- [ ] CSP Headers no next.config.ts
- [ ] Empty states implementados
- [ ] Dark mode funcional
- [ ] Testes de RLS

---

## 12. Dependências Completas

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "latest",
    "sonner": "^1.0.0",
    "nuqs": "^2.0.0",
    "recharts": "^2.0.0",
    "papaparse": "^5.0.0",
    "next-themes": "^0.3.0",
    "tailwind-merge": "^2.0.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "use-debounce": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "@types/papaparse": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "supabase": "latest"
  }
}
```

---

*Versão 2.0 — Atualizado em 14/03/2026. Este documento deve ser atualizado conforme o desenvolvimento avança.*

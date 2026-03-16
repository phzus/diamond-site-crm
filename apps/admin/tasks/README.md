# Diamond CRM Admin — Índice de Tasks de Implementação

Cada pasta representa uma área de implementação. Execute na ordem das fases.

## Ordem de Execução

### Fase 1 — 01-banco-de-dados/
| Task | Descrição |
|---|---|
| task-1.md | Setup Supabase CLI e conexão com o projeto |
| task-2.md | Migrations: schema completo (tabelas, triggers, índices) |
| task-3.md | RLS: políticas de segurança em todas as tabelas |
| task-4.md | Configuração do Supabase Auth |
| task-5.md | Edge Function `receive-lead` (integração com landing page) |

### Fase 2 — 02-auth-layout/
| Task | Descrição |
|---|---|
| task-1.md | Setup do projeto Next.js, dependências e Supabase client |
| task-2.md | Página de login |
| task-3.md | Middleware de proteção de rotas |
| task-4.md | Layout principal: Sidebar, Header, Providers |
| task-5.md | AuthProvider, Breadcrumbs, Error Boundaries, EmptyState, ConfirmDialog |

### Fase 3 — 03-gestao-de-leads/
| Task | Descrição |
|---|---|
| task-1.md | Services e hooks base (TanStack Query) |
| task-2.md | DataTable com filtros e busca (Nuqs) |
| task-3.md | Sheet de detalhes: notas e timeline |
| task-4.md | Dialogs de criação e edição de lead |
| task-5.md | Página /leads completa: bulk actions e exportação CSV |

### Fase 4 — 04-kanban/
| Task | Descrição |
|---|---|
| task-1.md | Kanban Board com Drag & Drop (@dnd-kit) |

### Fase 5 — 05-dashboard-analytics/
| Task | Descrição |
|---|---|
| task-1.md | Dashboard: métricas, gráfico e leads recentes |

### Fase 6 — 06-configuracoes/
| Task | Descrição |
|---|---|
| task-1.md | Gestão de usuários: convite, role e remoção |

### Fase 7 — 07-finalizacao/
| Task | Descrição |
|---|---|
| task-1.md | CSP headers, dark mode e configuração de produção (Vercel) |
| task-2.md | Testes de RLS e checklist final de go-live |

---

## Credenciais do Projeto Supabase
- **Project Ref**: `zcwgxmoibuxskhmbtzka`
- **URL**: `https://zcwgxmoibuxskhmbtzka.supabase.co`
- **Anon Key**: `sb_publishable_a8qrJgLzrOsMd8Yk-X-bTw_HopmGsRG`
- **Service Role Key**: `<SUPABASE_SERVICE_ROLE_KEY>`

> As credenciais acima devem ser colocadas em `apps/admin/.env.local`. O Service Role Key NUNCA deve ser exposto no cliente.

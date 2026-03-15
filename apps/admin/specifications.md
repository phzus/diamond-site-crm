# Diamond CRM - Especificações Técnicas

Este documento descreve a arquitetura, stack tecnológica e requisitos do sistema administrativo (CRM) da Diamond.

## 1. Visão Geral
O objetivo é centralizar os leads provenientes da landing page em um painel administrativo seguro, permitindo o acompanhamento do status, anotações e gestão de conversão.

## 2. Pontos Importantes (Análise Macro)

### Stack Tecnológica
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Radix UI (Shadcn/UI).
- **Backend/Database**: Supabase Cloud (Hosted PostgreSQL) - *No local installation required*.
- **Autenticação**: Supabase Auth (Hosted).
- **Hospedagem**: Vercel (Subdomínio: `admin.diamond-site-crm.com`).

### Segurança (Prioridade Máxima)
- **RBAC (Role-Based Access Control)**: Apenas usuários com a role `admin` podem acessar os dados.
- **RLS (Row Level Security)**: Políticas direto no banco de dados para garantir que leads não sejam expostos sem autenticação.
- **Middleware**: Proteção de rotas no Next.js para redirecionar usuários não logados.
- **Sanitização de Dados**: Validação rigorosa com Zod em todas as entradas.

### Infraestrutura & Organização
- **Estrutura**: Monorepo via npm/pnpm workspaces.
- **Integração**: Os leads da Landing Page serão enviados diretamente para a API do Supabase ou via Edge Functions para garantir rastreabilidade.

### Experiência do Usuário (UX)
- **Dashboard Limpo**: Kanban ou Tabela dinâmica para visualização de leads.
- **Notificações**: Alertas em tempo real (via Supabase Realtime) quando um novo lead chega.
- **Filtros**: Por data, origem e status.

## 3. Requisitos Iniciais (MVP)
1. Listagem de leads.
2. Alteração de status (Novo, Em Contato, Convertido, Descartado).
3. Campo de anotações por lead.
4. Exportação básica (CSV).

---
*Este documento será atualizado conforme a evolução do desenvolvimento.*

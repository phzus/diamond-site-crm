# Task 2 — Testes de RLS e Verificação Final

## Objetivo
Validar que todas as políticas de segurança estão funcionando corretamente, executar o checklist final antes do go-live e documentar como criar o primeiro usuário admin em produção.

## Pré-requisitos
- Todos os módulos anteriores concluídos
- Deploy realizado na Vercel

## Passos de Implementação

### 1. Testar RLS no Supabase SQL Editor
Acessar: `https://supabase.com/dashboard/project/zcwgxmoibuxskhmbtzka/editor`

Executar os testes abaixo e verificar os resultados esperados:

**Teste 1: Sem autenticação não acessa leads**
```sql
-- Definir role como anon (não autenticado)
SET LOCAL role anon;
SELECT * FROM leads LIMIT 1;
-- Resultado esperado: 0 linhas (RLS bloqueando)
```

**Teste 2: Colaborador não acessa audit_logs**
```sql
-- Para testar com um usuário específico, verificar via aplicação:
-- 1. Logar com conta collaborator
-- 2. Tentar acessar /settings/users → deve redirecionar para /unauthorized
```

**Teste 3: Colaborador não deleta lead**
```sql
-- Verificar política "leads: admin delete"
-- Logar como collaborator e tentar deletar via UI → botão de deletar não deve aparecer
```

### 2. Checklist de segurança final

**Banco de dados:**
- [ ] RLS habilitado em todas as 5 tabelas
- [ ] Signup público desabilitado no Supabase Auth
- [ ] Função `get_user_role()` criada e com SECURITY DEFINER
- [ ] Índice único em `leads.email` ativo

**Frontend:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` NUNCA aparece em código client-side
- [ ] CSP headers bloqueando scripts externos não autorizados
- [ ] Middleware redirecionando rotas não autenticadas para `/login`
- [ ] Rota `/settings/users` bloqueada para collaborator

**Edge Function:**
- [ ] `receive-lead` validando email obrigatório
- [ ] Deduplicação funcionando (mesmo email não cria duplicata)
- [ ] CORS configurado para aceitar apenas `diamondjp.com.br`

### 3. Procedimento para criar o primeiro admin em produção

**Passo a passo:**
1. Acessar: `https://supabase.com/dashboard/project/zcwgxmoibuxskhmbtzka/auth/users`
2. Clicar em **"Add User"** → **"Create New User"**
3. Preencher email e senha do administrador principal
4. Copiar o UUID gerado (visível na lista de usuários)
5. Ir para **Table Editor → profiles**
6. Encontrar o registro com o UUID copiado
7. Editar o campo `role` de `collaborator` para `admin`
8. Salvar

**Verificação:**
- Acessar `https://admin.diamondjp.com.br/login`
- Logar com as credenciais criadas
- Confirmar que o item "Usuários" aparece na sidebar
- Confirmar acesso a `/settings/users`

### 4. Checklist funcional completo

**Autenticação:**
- [ ] Login com email/senha funciona
- [ ] Logout limpa sessão
- [ ] Sessão expira após 8h
- [ ] Usuário sem conta não consegue acessar (nem via URL direta)

**Leads:**
- [ ] Leads da landing page aparecem automaticamente
- [ ] Criação manual de lead funciona
- [ ] Edição de lead salva corretamente
- [ ] Troca de status via Sheet funciona
- [ ] Troca de status via Kanban (drag & drop) funciona
- [ ] Notas são adicionadas e aparecem na timeline
- [ ] Histórico de atividades registrado
- [ ] Filtros por status, prioridade funcionam
- [ ] Busca por nome/email funciona
- [ ] Bulk actions (mudar status em lote) funciona
- [ ] Exportação CSV gera arquivo correto

**Dashboard:**
- [ ] 4 métricas carregam com dados reais
- [ ] Gráfico de barras exibe distribuição correta
- [ ] Tabela de leads recentes atualiza

**Configurações (admin):**
- [ ] Convite de usuário envia email
- [ ] Alteração de role funciona
- [ ] Remoção de usuário (soft delete) funciona

**UX:**
- [ ] Dark mode funciona e persiste entre sessões
- [ ] Skeleton loading em todas as seções
- [ ] Toasts de sucesso/erro em todas as operações
- [ ] Empty states exibidos quando sem dados
- [ ] Layout responsivo em mobile (sidebar como drawer)

### 5. Configuração de alerta de novos leads (opcional, pós-MVP)
Para notificar o time quando chegar um lead novo via landing page, configurar um webhook no Supabase:

`Dashboard → Database → Webhooks → Create Webhook`
- Tabela: `leads`
- Events: `INSERT`
- URL: (configurar com serviço de notificação desejado — ex: n8n, Zapier, ou endpoint próprio)

> Esta configuração é opcional e pode ser feita após o MVP estar estável.

## Critérios de Conclusão
- [ ] Todos os itens do checklist funcional marcados
- [ ] Nenhum erro de console no browser em produção
- [ ] `pnpm build` passa sem warnings críticos
- [ ] Primeiro usuário admin criado e funcionando em produção
- [ ] Edge Function `receive-lead` testada em produção com a URL real da landing page

## Arquivos Criados/Modificados
- Nenhum arquivo de código — apenas verificações e configurações no dashboard

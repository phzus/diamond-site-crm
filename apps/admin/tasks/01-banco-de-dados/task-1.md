# Task 1 — Setup Supabase CLI e Conexão com o Projeto

## Objetivo
Configurar o ambiente local para comunicação com o projeto Supabase existente, instalar a CLI e criar o arquivo de variáveis de ambiente.

## Credenciais do Projeto
- **Project Ref**: `zcwgxmoibuxskhmbtzka`
- **Project URL**: `https://zcwgxmoibuxskhmbtzka.supabase.co`
- **Anon Key (Publishable)**: `sb_publishable_a8qrJgLzrOsMd8Yk-X-bTw_HopmGsRG`
- **Service Role Key (Secret)**: `<SUPABASE_SERVICE_ROLE_KEY>`

## Pré-requisitos
- Node.js instalado
- pnpm instalado
- Acesso à internet

## Passos de Implementação

### 1. Instalar Supabase CLI
```bash
pnpm add -g supabase
# Verificar instalação
supabase --version
```

### 2. Login na CLI
```bash
supabase login
# Abrirá o browser para autenticação
```

### 3. Inicializar Supabase no projeto (se ainda não existir pasta /supabase na raiz do monorepo)
```bash
# Na raiz do monorepo
supabase init
```

### 4. Linkar ao projeto remoto
```bash
supabase link --project-ref zcwgxmoibuxskhmbtzka
# Quando solicitado, informar a database password do projeto
```

### 5. Criar arquivo de variáveis de ambiente
Criar o arquivo `apps/admin/.env.local` com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zcwgxmoibuxskhmbtzka.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a8qrJgLzrOsMd8Yk-X-bTw_HopmGsRG
SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
```

> **ATENÇÃO**: O `SUPABASE_SERVICE_ROLE_KEY` NUNCA deve ser exposto no cliente (browser). Usar apenas em Server Components, API Routes e Edge Functions.

### 6. Adicionar .env.local ao .gitignore
Verificar se `apps/admin/.env.local` já está no `.gitignore` raiz. Se não, adicionar:
```
apps/admin/.env.local
```

### 7. Criar .env.example para documentação
Criar `apps/admin/.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Critérios de Conclusão
- [ ] `supabase --version` retorna uma versão válida
- [ ] `supabase status` mostra o projeto linkado corretamente
- [ ] Arquivo `.env.local` criado com as 3 variáveis
- [ ] `.env.local` está no `.gitignore`
- [ ] `.env.example` criado na pasta do admin

## Arquivos Criados/Modificados
- `supabase/config.toml` (gerado pelo `supabase init`)
- `apps/admin/.env.local`
- `apps/admin/.env.example`
- `.gitignore` (verificar/atualizar)

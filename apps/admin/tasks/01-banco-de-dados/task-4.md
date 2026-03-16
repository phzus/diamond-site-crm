# Task 4 — Configuração do Supabase Auth

## Objetivo
Configurar as opções de autenticação no Supabase: desabilitar cadastro público, definir política de senha, tempo de sessão e rate limiting.

## Pré-requisitos
- Task 1 concluída (projeto linkado)

## Passos de Implementação

> A maioria das configurações de Auth é feita via Dashboard do Supabase, pois o `config.toml` local não sobrescreve configurações de Auth no ambiente hosted.

### 1. Acessar configurações de Auth
Acessar: `https://supabase.com/dashboard/project/zcwgxmoibuxskhmbtzka/auth/configuration`

### 2. Configurações a aplicar (User Signups)
- **Enable email signup**: `DESABILITADO` — nenhum usuário pode se cadastrar publicamente. Apenas convites enviados pelo admin funcionarão.
- **Confirm email**: `HABILITADO` — usuários convidados precisam confirmar o email antes de fazer login.

### 3. Configurações de Segurança de Senha
- **Minimum password length**: `8` caracteres

### 4. Configurações de Sessão
- **JWT expiry**: `28800` segundos (8 horas) — sessão expira após 8h
- Em `supabase/config.toml`, garantir que o JWT secret está configurado

### 5. Atualizar config.toml para documentar as configurações
Editar `supabase/config.toml` e garantir que a seção `[auth]` reflita:

```toml
[auth]
enabled = true
site_url = "https://admin.diamondjp.com.br"
additional_redirect_urls = ["http://localhost:3000"]
jwt_expiry = 28800
enable_signup = false
minimum_password_length = 8

[auth.email]
enable_signup = false
enable_confirmations = true
secure_email_change_enabled = true
```

### 6. Criar seed do primeiro usuário Admin
Criar o arquivo `supabase/seed.sql` com instruções para o admin criar o primeiro usuário manualmente:

```sql
-- ATENÇÃO: Este seed NÃO deve ser executado via CLI automaticamente.
-- O primeiro usuário admin deve ser criado via Dashboard do Supabase:
--
-- 1. Acesse: https://supabase.com/dashboard/project/zcwgxmoibuxskhmbtzka/auth/users
-- 2. Clique em "Add User" → "Create New User"
-- 3. Informe email e senha
-- 4. Após criação, copie o UUID do usuário
-- 5. Execute o SQL abaixo substituindo <USER_UUID>:

-- UPDATE public.profiles
-- SET role = 'admin', full_name = 'Administrador Diamond'
-- WHERE id = '<USER_UUID>';
```

### 7. Configurar URL do site para redirecionamento de email
No Dashboard → Auth → URL Configuration:
- **Site URL**: `https://admin.diamondjp.com.br`
- **Redirect URLs**: adicionar `http://localhost:3000` para desenvolvimento

## Critérios de Conclusão
- [ ] Signup público desabilitado no Dashboard
- [ ] Confirmação de email habilitada
- [ ] Senha mínima de 8 caracteres configurada
- [ ] JWT expiry definido como 28800 segundos
- [ ] `config.toml` atualizado com as configurações
- [ ] Site URL configurado no Dashboard
- [ ] Seed do primeiro admin documentado em `supabase/seed.sql`
- [ ] Primeiro usuário admin criado e role atualizado para `admin`

## Arquivos Criados/Modificados
- `supabase/config.toml`
- `supabase/seed.sql`

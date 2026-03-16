# Task 5 — Edge Function: receive-lead

## Objetivo
Criar e publicar a Edge Function `receive-lead` que recebe os dados da landing page, valida, deduplica e insere leads no banco.

## Pré-requisitos
- Tasks 1, 2 e 3 concluídas

## Passos de Implementação

### 1. Criar a Edge Function
```bash
supabase functions new receive-lead
```
Isso cria `supabase/functions/receive-lead/index.ts`.

### 2. Implementar a função

```typescript
// supabase/functions/receive-lead/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://diamondjp.com.br',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LeadPayload {
  full_name: string
  email: string
  phone?: string
  message?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const payload: LeadPayload = await req.json()

    // Validação básica
    if (!payload.full_name || !payload.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'full_name e email são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isValidEmail(payload.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitização
    const email = payload.email.trim().toLowerCase()
    const full_name = payload.full_name.trim().slice(0, 255)
    const phone = payload.phone?.trim().slice(0, 20) || null
    const message = payload.message?.trim().slice(0, 2000) || null

    // Criar cliente com service role para bypassar RLS nesta operação
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verificar se email já existe (deduplicação)
    const { data: existing } = await supabase
      .from('leads')
      .select('id, submission_count')
      .eq('email', email)
      .single()

    if (existing) {
      // Atualizar lead existente
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          submission_count: existing.submission_count + 1,
          updated_at: new Date().toISOString(),
          ...(payload.utm_source && { utm_source: payload.utm_source }),
          ...(payload.utm_medium && { utm_medium: payload.utm_medium }),
          ...(payload.utm_campaign && { utm_campaign: payload.utm_campaign }),
        })
        .eq('id', existing.id)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, lead_id: existing.id, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar novo lead
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert({
        full_name,
        email,
        phone,
        message,
        source: 'landing-page',
        status: 'new',
        priority: 'medium',
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
      })
      .select('id')
      .single()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ success: true, lead_id: newLead.id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('receive-lead error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 3. Publicar a Edge Function
```bash
supabase functions deploy receive-lead --no-verify-jwt
```

> `--no-verify-jwt` porque a landing page chama esta função sem autenticação de usuário, usando apenas a anon key.

### 4. Configurar variáveis de ambiente na Edge Function
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<SUPABASE_SERVICE_ROLE_KEY>
```

> As variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` já são injetadas automaticamente pelo Supabase em Edge Functions.

### 5. Testar a função
```bash
# Teste de criação de novo lead
curl -X POST https://zcwgxmoibuxskhmbtzka.supabase.co/functions/v1/receive-lead \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_a8qrJgLzrOsMd8Yk-X-bTw_HopmGsRG" \
  -d '{
    "full_name": "João Teste",
    "email": "joao@teste.com",
    "phone": "(11) 99999-9999",
    "utm_source": "google"
  }'

# Resposta esperada: { "success": true, "lead_id": "uuid..." }
```

### 6. Atualizar a landing page para usar esta função
Na landing page (`apps/site`), o form de contato deve enviar POST para:
`https://zcwgxmoibuxskhmbtzka.supabase.co/functions/v1/receive-lead`

Com o header: `apikey: sb_publishable_a8qrJgLzrOsMd8Yk-X-bTw_HopmGsRG`

## Critérios de Conclusão
- [ ] Edge Function criada em `supabase/functions/receive-lead/index.ts`
- [ ] Função publicada com `supabase functions deploy`
- [ ] Teste de criação de lead retorna `{ success: true }`
- [ ] Teste de email duplicado retorna `{ success: true, duplicate: true }`
- [ ] Teste com email inválido retorna 400
- [ ] Lead aparece na tabela `leads` no Dashboard do Supabase

## Arquivos Criados/Modificados
- `supabase/functions/receive-lead/index.ts`

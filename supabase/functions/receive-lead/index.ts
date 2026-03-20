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
  state?: string
  invited_by?: string
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

    // Validação
    if (!payload.full_name?.trim() || !payload.email?.trim()) {
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
    const phone = payload.phone?.trim().slice(0, 20) ?? null
    const message = payload.message?.trim().slice(0, 2000) ?? null
    const state = payload.state?.trim().slice(0, 2) ?? null
    const invited_by = payload.invited_by?.trim().slice(0, 255) ?? null

    // Service role para bypassar RLS nesta operação (landing page não tem auth de usuário)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verificar se email já existe (deduplicação)
    const { data: existing } = await supabase
      .from('leads')
      .select('id, submission_count')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          submission_count: existing.submission_count + 1,
          updated_at: new Date().toISOString(),
          ...(payload.utm_source && { utm_source: payload.utm_source }),
          ...(payload.utm_medium && { utm_medium: payload.utm_medium }),
          ...(payload.utm_campaign && { utm_campaign: payload.utm_campaign }),
          ...(invited_by && { invited_by }),
          ...(state && { state }),
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
        state,
        invited_by,
        source: 'landing-page',
        status: 'new',
        priority: 'medium',
        utm_source: payload.utm_source ?? null,
        utm_medium: payload.utm_medium ?? null,
        utm_campaign: payload.utm_campaign ?? null,
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

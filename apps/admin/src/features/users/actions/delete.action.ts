'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function deleteUser(userId: string) {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Apenas administradores podem excluir colaboradores' }
  }

  if (userId === user.id) {
    return { error: 'Você não pode excluir sua própria conta' }
  }

  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  return { success: true }
}

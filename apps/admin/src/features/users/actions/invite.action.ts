'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function inviteUser(email: string, role: 'admin' | 'collaborator', fullName: string) {
  // Verify the current user is an admin
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Não autorizado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Apenas administradores podem convidar usuários' }
  }

  // Use service role client to invite user
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

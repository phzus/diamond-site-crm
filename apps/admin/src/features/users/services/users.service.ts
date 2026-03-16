import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  full_name: string
  email: string | null
  role: 'admin' | 'collaborator'
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export async function getUsers(): Promise<UserProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url, is_active, created_at')
    .order('full_name')

  if (error) throw error
  return data as UserProfile[]
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'collaborator'
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error
}

export async function deactivateUser(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error
}

export async function reactivateUser(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error
}

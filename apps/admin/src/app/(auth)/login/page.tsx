import { LoginForm } from '@/features/auth/components/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Diamond CRM</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso restrito — apenas colaboradores autorizados
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

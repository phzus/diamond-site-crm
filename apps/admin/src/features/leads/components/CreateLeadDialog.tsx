'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LeadForm } from './LeadForm'
import { useCreateLead } from '../hooks/useLeads'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { LeadFormValues } from '../schemas/lead.schema'

interface CreateLeadDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateLeadDialog({ open, onClose }: CreateLeadDialogProps) {
  const createLead = useCreateLead()
  const { data: currentUser } = useCurrentUser()

  async function handleSubmit(values: LeadFormValues) {
    const supabase = createClient()
    try {
      const lead = await createLead.mutateAsync({
        full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
        email: values.email,
        cpf: values.cpf ?? null,
        phone: values.phone ?? null,
        state: values.state ?? null,
        city: values.city ?? null,
        birth_date: values.birth_date ?? null,
        invited_by: values.invited_by ?? null,
        source: 'manual',
        status: 'new',
        priority: 'medium',
      })

      if (lead && currentUser) {
        await supabase.from('lead_activities').insert({
          lead_id: lead.id,
          action_type: 'created',
          to_value: 'manual',
          performed_by: currentUser.id,
        })
      }

      onClose()
    } catch {
      // error is already handled by useCreateLead onError toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <LeadForm
          onSubmit={handleSubmit}
          isLoading={createLead.isPending}
          submitLabel="Criar Cliente"
        />
      </DialogContent>
    </Dialog>
  )
}

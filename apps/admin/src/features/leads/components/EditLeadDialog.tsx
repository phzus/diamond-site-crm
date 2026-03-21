'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LeadForm } from './LeadForm'
import { useLead, useUpdateLead } from '../hooks/useLeads'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { LeadFormValues } from '../schemas/lead.schema'

interface EditLeadDialogProps {
  leadId: string | null
  onClose: () => void
}

export function EditLeadDialog({ leadId, onClose }: EditLeadDialogProps) {
  const { data: lead } = useLead(leadId || '')
  const updateLead = useUpdateLead()
  const { data: currentUser } = useCurrentUser()

  async function handleSubmit(values: LeadFormValues) {
    if (!leadId || !currentUser) return
    const supabase = createClient()

    await updateLead.mutateAsync({
      id: leadId,
      data: {
        full_name: `${values.first_name.trim()} ${values.last_name.trim()}`,
        email: values.email,
        phone: values.phone ?? null,
        state: values.state ?? null,
        invited_by: values.invited_by ?? null,
      },
    })

    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      action_type: 'field_updated',
      performed_by: currentUser.id,
    })

    onClose()
  }

  function getDefaultValues() {
    if (!lead) return undefined
    const nameParts = lead.full_name.trim().split(' ')
    return {
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      email: lead.email,
      phone: lead.phone,
      state: lead.state,
      invited_by: lead.invited_by,
    }
  }

  return (
    <Dialog open={!!leadId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        {lead && (
          <LeadForm
            defaultValues={getDefaultValues()}
            onSubmit={handleSubmit}
            isLoading={updateLead.isPending}
            submitLabel="Salvar Alterações"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

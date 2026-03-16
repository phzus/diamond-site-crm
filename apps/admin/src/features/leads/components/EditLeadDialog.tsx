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

    await updateLead.mutateAsync({ id: leadId, data: values })

    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      action_type: 'field_updated',
      performed_by: currentUser.id,
    })

    onClose()
  }

  return (
    <Dialog open={!!leadId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        {lead && (
          <LeadForm
            defaultValues={lead}
            onSubmit={handleSubmit}
            isLoading={updateLead.isPending}
            submitLabel="Salvar Alterações"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

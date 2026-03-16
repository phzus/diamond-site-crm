'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useLeadActivities(leadId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*, performer:profiles!lead_activities_performed_by_fkey(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}

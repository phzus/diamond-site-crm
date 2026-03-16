'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useLeadNotes(leadId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*, author:profiles!lead_notes_created_by_fkey(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!leadId,
  })
}

export function useCreateNote(leadId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ content, userId }: { content: string; userId: string }) => {
      const { error } = await supabase.from('lead_notes').insert({
        lead_id: leadId,
        content,
        created_by: userId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] })
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] })
      toast.success('Nota adicionada.')
    },
    onError: () => toast.error('Erro ao adicionar nota.'),
  })
}

export function useDeleteNote(leadId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('lead_notes').delete().eq('id', noteId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] })
      toast.success('Nota removida.')
    },
  })
}

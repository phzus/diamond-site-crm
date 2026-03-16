'use client'

import { useState } from 'react'
import { useLeadNotes, useCreateNote, useDeleteNote } from '../hooks/useLeadNotes'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'

export function LeadNotesTab({ leadId }: { leadId: string }) {
  const [content, setContent] = useState('')
  const { data: notes, isLoading } = useLeadNotes(leadId)
  const { data: currentUser } = useCurrentUser()
  const createNote = useCreateNote(leadId)
  const deleteNote = useDeleteNote(leadId)

  function handleAddNote() {
    if (!content.trim() || !currentUser) return
    createNote.mutate(
      { content: content.trim(), userId: currentUser.id },
      { onSuccess: () => setContent('') }
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Adicionar anotação..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <Button
          size="sm"
          onClick={handleAddNote}
          disabled={!content.trim() || createNote.isPending}
        >
          Adicionar Nota
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />)}
        </div>
      ) : notes?.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhuma anotação ainda.</p>
      ) : (
        <div className="space-y-3">
          {notes?.map((note: any) => (
            <div key={note.id} className="rounded-md border p-3 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">{note.content}</p>
                {(currentUser?.id === note.created_by || currentUser?.role === 'admin') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNote.mutate(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {note.author?.full_name} · {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

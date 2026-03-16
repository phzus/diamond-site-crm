'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Leads Error]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4 max-w-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Algo deu errado</h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
          <Button onClick={reset}>Tentar novamente</Button>
        </div>
      </div>
    </div>
  )
}

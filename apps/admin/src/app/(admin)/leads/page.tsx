import { Suspense } from 'react'
import { LeadsPageContent } from './LeadsPageContent'
import { Skeleton } from '@/components/ui/skeleton'

function LeadsPageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsPageSkeleton />}>
      <LeadsPageContent />
    </Suspense>
  )
}

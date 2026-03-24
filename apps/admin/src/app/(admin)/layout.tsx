export const dynamic = 'force-dynamic'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { PageTransition } from '@/components/layout/PageTransition'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}

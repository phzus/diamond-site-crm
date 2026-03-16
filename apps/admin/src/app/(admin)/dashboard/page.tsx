import { PageHeader } from '@/components/layout/PageHeader'
import { StatusChart } from '@/features/analytics/components/StatusChart'
import { RecentLeadsTable } from '@/features/analytics/components/RecentLeadsTable'
import { DashboardMetricsSection } from '@/features/analytics/components/DashboardMetricsSection'

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos últimos 30 dias"
      />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <DashboardMetricsSection />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart />
          <RecentLeadsTable />
        </div>
      </div>
    </div>
  )
}

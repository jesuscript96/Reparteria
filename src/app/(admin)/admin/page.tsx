import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatsCard } from '@/components/admin/stats-card'
import { RecentCompaniesTable } from '@/components/admin/recent-companies-table'
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  Truck,
  CheckCircle
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

async function getAdminStats() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/stats`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }

  return response.json()
}

async function getRecentCompanies() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('id, company_name, business_type, plan_type, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error
  return data || []
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}

async function DashboardStats() {
  const stats = await getAdminStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Empresas"
        value={stats.totals.companies}
        change={{ value: 12, trend: 'up' }}
        icon={Building2}
        iconColor="text-blue-600"
      />
      <StatsCard
        title="Repartidores Activos"
        value={stats.totals.drivers}
        icon={Truck}
        iconColor="text-green-600"
      />
      <StatsCard
        title="Entregas Totales"
        value={stats.totals.deliveries.toLocaleString()}
        icon={Package}
        iconColor="text-purple-600"
      />
      <StatsCard
        title="Entregas Hoy"
        value={stats.recent.deliveriesToday}
        icon={CheckCircle}
        iconColor="text-emerald-600"
      />
    </div>
  )
}

async function RecentCompaniesSection() {
  const companies = await getRecentCompanies()
  return <RecentCompaniesTable companies={companies} />
}

export default function AdminDashboardPage() {
  return (
    <div>
      <AdminHeader
        title="Dashboard Admin"
        subtitle="Vista general del sistema"
      />

      <div className="p-6 space-y-6">
        <Suspense fallback={<StatsLoadingSkeleton />}>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96" />}>
          <RecentCompaniesSection />
        </Suspense>
      </div>
    </div>
  )
}

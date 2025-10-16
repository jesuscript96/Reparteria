import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { CompanyDetailView } from '@/components/admin/company-detail-view'
import { Skeleton } from '@/components/ui/skeleton'

async function getCompanyDetails(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/companies/${id}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch company details')
  }

  return response.json()
}

async function CompanyDetailsSection({ id }: { id: string }) {
  const data = await getCompanyDetails(id)
  return <CompanyDetailView data={data} />
}

export default async function CompanyDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <AdminHeader
        title="Detalles de Empresa"
        subtitle="Información completa y gestión de la empresa"
      />

      <div className="p-6">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CompanyDetailsSection id={id} />
        </Suspense>
      </div>
    </div>
  )
}

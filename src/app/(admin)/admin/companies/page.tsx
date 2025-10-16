import { Suspense } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { CompaniesTable } from '@/components/admin/companies-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

async function getCompanies() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/companies?page=1&pageSize=10`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch companies')
  }

  return response.json()
}

async function CompaniesSection() {
  const { data: companies, pagination } = await getCompanies()

  return (
    <CompaniesTable
      initialCompanies={companies}
      initialTotal={pagination.total}
    />
  )
}

export default function CompaniesPage() {
  return (
    <div>
      <AdminHeader
        title="Gestión de Empresas"
        subtitle="Administra todas las empresas registradas en el sistema"
      />

      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Todas las Empresas
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Lista completa de empresas registradas
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Empresa Manualmente
          </Button>
        </div>

        <Suspense fallback={<Skeleton className="h-96" />}>
          <CompaniesSection />
        </Suspense>
      </div>
    </div>
  )
}

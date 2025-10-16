'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Building2,
  User,
  Users,
  Package,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Activity,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface CompanyDetailData {
  company: {
    id: string
    company_name: string
    business_type: string | null
    plan_type: string
    is_active: boolean
    created_at: string
    max_drivers: number
    current_month_deliveries: number
    address: string | null
    city: string | null
    phone: string | null
  }
  owner: {
    email: string
    full_name: string
    phone: string | null
    created_at: string
  } | null
  drivers: Array<{
    id: string
    driver_code: string
    vehicle_type: string
    is_active: boolean
    total_deliveries_completed: number
    profiles: {
      full_name: string
      email: string
      phone: string | null
    } | null
  }>
  stats: {
    deliveriesByStatus: Record<string, number>
    totalDeliveries: number
  }
  recentDeliveries: Array<{
    id: string
    order_id: string
    customer_name: string
    status: string
    delivery_date: string
    created_at: string
  }>
  activeRoutes: Array<{
    id: string
    route_name: string
    route_date: string
    status: string
    total_deliveries: number
    completed_deliveries: number
    driver_id: string
  }>
}

interface CompanyDetailViewProps {
  data: CompanyDetailData
}

export function CompanyDetailView({ data }: CompanyDetailViewProps) {
  const [isActive, setIsActive] = useState(data.company.is_active)
  const [isToggling, setIsToggling] = useState(false)
  const router = useRouter()

  const handleToggleStatus = async () => {
    setIsToggling(true)
    try {
      const response = await fetch(
        `/api/admin/companies/${data.company.id}/toggle-status`,
        { method: 'POST' }
      )

      if (response.ok) {
        const result = await response.json()
        setIsActive(result.is_active)
        router.refresh()
      } else {
        console.error('Failed to toggle status')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      enterprise: { variant: 'default', label: 'Enterprise' },
      pro: { variant: 'secondary', label: 'Pro' },
      basic: { variant: 'outline', label: 'Basic' },
      free: { variant: 'outline', label: 'Free' },
    }
    const config = variants[plan] || variants.free
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', label: string }> = {
      pending: { variant: 'outline', label: 'Pendiente' },
      assigned: { variant: 'secondary', label: 'Asignado' },
      in_transit: { variant: 'default', label: 'En tránsito' },
      delivered: { variant: 'default', label: 'Entregado' },
      failed: { variant: 'destructive', label: 'Fallido' },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.company.company_name}
          </h1>
          <div className="flex gap-2 mt-2">
            {getPlanBadge(data.company.plan_type)}
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isActive ? 'outline' : 'default'}
            onClick={handleToggleStatus}
            disabled={isToggling}
          >
            {isToggling ? 'Procesando...' : isActive ? 'Desactivar' : 'Activar'}
          </Button>
          <Button variant="outline">Cambiar Plan</Button>
          <Button variant="outline">Ver Facturación</Button>
        </div>
      </div>

      {/* Grid de información principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Repartidores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              Máximo: {data.company.max_drivers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {data.company.current_month_deliveries} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeRoutes.length}</div>
            <p className="text-xs text-muted-foreground">
              En progreso o planificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Completadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.deliveriesByStatus.delivered || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.stats.deliveriesByStatus.failed || 0} fallidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información de la empresa y dueño */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo de Negocio</p>
              <p className="text-sm text-gray-900 capitalize">
                {data.company.business_type || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Dirección</p>
              <p className="text-sm text-gray-900">
                {data.company.address || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ciudad</p>
              <p className="text-sm text-gray-900">
                {data.company.city || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Teléfono</p>
              <p className="text-sm text-gray-900">
                {data.company.phone || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
              <p className="text-sm text-gray-900">
                {formatDistanceToNow(new Date(data.company.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Dueño
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.owner ? (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{data.owner.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {data.owner.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {data.owner.phone || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Miembro desde</p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDistanceToNow(new Date(data.owner.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No se encontró información del dueño</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Repartidores */}
      <Card>
        <CardHeader>
          <CardTitle>Repartidores</CardTitle>
          <CardDescription>
            Lista de todos los repartidores registrados en esta empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.drivers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay repartidores registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Entregas</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.driver_code}</TableCell>
                    <TableCell>
                      {driver.profiles?.full_name || 'Sin nombre'}
                    </TableCell>
                    <TableCell className="capitalize">{driver.vehicle_type}</TableCell>
                    <TableCell>{driver.profiles?.email || '-'}</TableCell>
                    <TableCell>{driver.total_deliveries_completed}</TableCell>
                    <TableCell>
                      <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                        {driver.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Entregas Recientes y Rutas Activas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entregas Recientes</CardTitle>
            <CardDescription>Últimas 10 entregas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentDeliveries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay entregas registradas
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{delivery.customer_name}</p>
                      <p className="text-xs text-gray-500">Orden: {delivery.order_id}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(delivery.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(delivery.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rutas Activas</CardTitle>
            <CardDescription>Rutas planificadas o en progreso</CardDescription>
          </CardHeader>
          <CardContent>
            {data.activeRoutes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay rutas activas
              </p>
            ) : (
              <div className="space-y-3">
                {data.activeRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{route.route_name}</p>
                      <p className="text-xs text-gray-500">
                        {route.completed_deliveries}/{route.total_deliveries} completadas
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={route.status === 'in_progress' ? 'default' : 'outline'}>
                        {route.status === 'in_progress' ? 'En Progreso' : 'Planificada'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(route.route_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estadísticas de Entregas
          </CardTitle>
          <CardDescription>Distribución de entregas por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold">
                {data.stats.deliveriesByStatus.pending || 0}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Asignadas</p>
              <p className="text-2xl font-bold">
                {data.stats.deliveriesByStatus.assigned || 0}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-500">En Tránsito</p>
              <p className="text-2xl font-bold">
                {data.stats.deliveriesByStatus.in_transit || 0}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-500">Entregadas</p>
              <p className="text-2xl font-bold">
                {data.stats.deliveriesByStatus.delivered || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

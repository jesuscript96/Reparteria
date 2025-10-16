import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar que es admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Obtener estadísticas
    const [
      companiesResult,
      driversResult,
      deliveriesResult,
      routesResult,
      activeCompaniesResult,
    ] = await Promise.all([
      // Total de empresas
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true }),

      // Total de repartidores
      supabase
        .from('drivers')
        .select('id', { count: 'exact', head: true }),

      // Total de entregas
      supabase
        .from('deliveries')
        .select('id', { count: 'exact', head: true }),

      // Total de rutas
      supabase
        .from('routes')
        .select('id', { count: 'exact', head: true }),

      // Empresas activas
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ])

    // Entregas por estado
    const { data: deliveriesByStatus } = await supabase
      .from('deliveries')
      .select('status')

    const statusCounts = deliveriesByStatus?.reduce((acc: Record<string, number>, delivery) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Empresas registradas en los últimos 30 días
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: newCompanies } = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Entregas completadas hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: deliveriesToday } = await supabase
      .from('deliveries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'delivered')
      .gte('completed_at', today.toISOString())

    return NextResponse.json({
      totals: {
        companies: companiesResult.count || 0,
        activeCompanies: activeCompaniesResult.count || 0,
        drivers: driversResult.count || 0,
        deliveries: deliveriesResult.count || 0,
        routes: routesResult.count || 0,
      },
      recent: {
        newCompaniesLast30Days: newCompanies || 0,
        deliveriesToday: deliveriesToday || 0,
      },
      deliveriesByStatus: statusCounts,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

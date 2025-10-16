import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar admin
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

    // Obtener info de la empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Obtener perfil del dueño
    const { data: owner } = await supabase
      .from('profiles')
      .select('email, full_name, phone, created_at')
      .eq('id', id)
      .single()

    // Obtener repartidores
    const { data: drivers } = await supabase
      .from('drivers')
      .select(`
        id,
        driver_code,
        vehicle_type,
        is_active,
        total_deliveries_completed
      `)
      .eq('company_id', id)

    // Para cada driver, obtener su perfil
    const driversWithProfiles = await Promise.all(
      (drivers || []).map(async (driver) => {
        const { data: driverProfile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', driver.id)
          .single()

        return {
          ...driver,
          profiles: driverProfile
        }
      })
    )

    // Obtener estadísticas de entregas
    const { data: deliveryStats } = await supabase
      .from('deliveries')
      .select('status')
      .eq('company_id', id)

    const statusCount = deliveryStats?.reduce((acc: Record<string, number>, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {}) || {}

    // Entregas recientes
    const { data: recentDeliveries } = await supabase
      .from('deliveries')
      .select('id, order_id, customer_name, status, delivery_date, created_at')
      .eq('company_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Rutas activas
    const { data: activeRoutes } = await supabase
      .from('routes')
      .select('id, route_name, route_date, status, total_deliveries, completed_deliveries, driver_id')
      .eq('company_id', id)
      .in('status', ['planned', 'in_progress'])

    return NextResponse.json({
      company,
      owner,
      drivers: driversWithProfiles || [],
      stats: {
        deliveriesByStatus: statusCount,
        totalDeliveries: deliveryStats?.length || 0,
      },
      recentDeliveries: recentDeliveries || [],
      activeRoutes: activeRoutes || [],
    })
  } catch (error) {
    console.error('Error fetching company details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

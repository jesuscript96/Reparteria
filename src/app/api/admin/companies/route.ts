import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

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

    // Parámetros de búsqueda y filtrado
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // 'active', 'inactive', 'all'
    const plan = searchParams.get('plan') // 'free', 'basic', 'pro', 'enterprise', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    // Construir query
    let query = supabase
      .from('companies')
      .select(`
        id,
        company_name,
        business_type,
        plan_type,
        is_active,
        created_at,
        max_drivers,
        current_month_deliveries
      `, { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.ilike('company_name', `%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active')
    }

    if (plan && plan !== 'all') {
      query = query.eq('plan_type', plan as 'free' | 'basic' | 'pro' | 'enterprise')
    }

    // Paginación y orden
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const { data: companies, error, count } = await query

    if (error) throw error

    // Obtener contadores de drivers y deliveries para cada empresa
    const companiesWithStats = await Promise.all(
      (companies || []).map(async (company) => {
        const [driversCount, deliveriesCount] = await Promise.all([
          supabase
            .from('drivers')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id),
          supabase
            .from('deliveries')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id),
        ])

        return {
          ...company,
          total_drivers: driversCount.count || 0,
          total_deliveries: deliveriesCount.count || 0,
        }
      })
    )

    return NextResponse.json({
      data: companiesWithStats,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

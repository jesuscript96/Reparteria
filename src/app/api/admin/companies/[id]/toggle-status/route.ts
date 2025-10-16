import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
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

    // Obtener estado actual de la empresa
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Alternar el estado
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({ is_active: !company.is_active })
      .eq('id', id)
      .select('is_active')
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      is_active: updatedCompany.is_active,
      message: updatedCompany.is_active ? 'Empresa activada' : 'Empresa desactivada'
    })
  } catch (error) {
    console.error('Error toggling company status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

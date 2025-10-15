import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    const supabase = createClient()

    // Buscar empresa con este código de invitación
    // Por ahora, usamos un formato simple: COMPANY_ID-INVITE_CODE
    // En producción, deberías tener una tabla de invitation_codes

    const parts = code.split('-')
    if (parts.length !== 2) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }

    const [companyId] = parts
    // TODO: Validar inviteCode en producción

    // Verificar que la empresa existe y está activa
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, company_name, is_active')
      .eq('id', companyId)
      .eq('is_active', true)
      .single()

    if (error || !company) {
      return NextResponse.json(
        { error: 'Código inválido o empresa no encontrada' },
        { status: 404 }
      )
    }

    // TODO: En producción, validar el inviteCode contra una tabla de códigos

    return NextResponse.json({
      valid: true,
      company: {
        id: company.id,
        name: company.company_name,
      },
    })
  } catch (error) {
    console.error('Error validando código:', error)
    return NextResponse.json(
      { error: 'Error al validar el código' },
      { status: 500 }
    )
  }
}

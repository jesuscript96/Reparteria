import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente con service_role para bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, companyName, businessType, fullName, email, phone } = await request.json()

    console.log('[API] Setup empresa:', { userId, companyName, businessType })

    if (!userId || !companyName || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // 1. Verificar que el usuario existe en auth.users
    console.log('[API] Verificando usuario en auth.users...')
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authUserError || !authUser.user) {
      console.error('[API] Usuario no encontrado en auth.users:', authUserError)
      return NextResponse.json(
        { error: 'Usuario no encontrado. Por favor, espera unos segundos e intenta de nuevo.' },
        { status: 404 }
      )
    }
    console.log('[API] Usuario verificado en auth.users')

    // 2. Crear o actualizar el perfil
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      console.log('[API] Perfil NO existe, creando...')
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName || '',
          phone: phone || '',
          role: 'company',
          company_id: null,
        })

      if (profileError) {
        console.error('[API] Error creando perfil:', profileError)
        return NextResponse.json(
          { error: 'Error al crear el perfil' },
          { status: 500 }
        )
      }
      console.log('[API] Perfil creado exitosamente')
    } else {
      console.log('[API] Perfil existe')
    }

    // 2. Verificar si la empresa existe
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingCompany) {
      console.log('[API] Empresa existe, actualizando...')
      // La empresa existe, actualizarla
      const { error: updateError } = await supabaseAdmin
        .from('companies')
        .update({
          company_name: companyName,
          business_type: businessType || 'otro',
          plan_type: 'free',
          max_drivers: 1,
          is_active: true,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('[API] Error actualizando:', updateError)
        return NextResponse.json(
          { error: 'Error al actualizar la empresa' },
          { status: 500 }
        )
      }
    } else {
      console.log('[API] Empresa NO existe, creando...')
      // La empresa no existe, crearla
      const { error: insertError } = await supabaseAdmin
        .from('companies')
        .insert({
          id: userId,
          company_name: companyName,
          business_type: businessType || 'otro',
          plan_type: 'free',
          max_drivers: 1,
          is_active: true,
        })

      if (insertError) {
        console.error('[API] Error creando:', insertError)
        return NextResponse.json(
          { error: 'Error al crear la empresa' },
          { status: 500 }
        )
      }
    }

    console.log('[API] Empresa configurada exitosamente')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API] Error en setup de empresa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

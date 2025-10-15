import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing Supabase environment variables for admin client.' },
      { status: 500 }
    )
  }

  // Create an Edge-compatible admin client
  const supabaseAdmin = createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  })

  try {
    const { userId, companyName, businessType, fullName, email, phone } = await request.json()

    if (!userId || !companyName || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authUserError || !authUser.user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado. Por favor, espera unos segundos e intenta de nuevo.' },
        { status: 404 }
      )
    }

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
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
    }

    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingCompany) {
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
        return NextResponse.json(
          { error: 'Error al actualizar la empresa' },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabaseAdmin.from('companies').insert({
        id: userId,
        company_name: companyName,
        business_type: businessType || 'otro',
        plan_type: 'free',
        max_drivers: 1,
        is_active: true,
      })

      if (insertError) {
        return NextResponse.json(
          { error: 'Error al crear la empresa' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
/**
 * Next.js Middleware
 *
 * Este middleware:
 * - Actualiza la sesión de autenticación en cada request
 * - Protege rutas según el rol del usuario (admin, company, driver)
 * - Redirige usuarios autenticados desde rutas públicas
 * - Redirige usuarios no autenticados a login
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] 🔵 Request:', request.nextUrl.pathname)

  // Crear cliente de Supabase y actualizar sesión
  const { supabase, response } = await createClient(request)

  // Verificar que las variables de entorno existen
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[MIDDLEWARE] 📋 Config check:')
  console.log('  - Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ FALTA')
  console.log('  - Service Role Key:', serviceRoleKey ? `✅ Configurado (${serviceRoleKey.substring(0, 20)}...)` : '❌ FALTA')

  // Cliente admin para verificaciones internas (bypassa RLS)
  const supabaseAdmin = createServiceClient(
    supabaseUrl!,
    serviceRoleKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  )

  // Obtener usuario y perfil
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  console.log('[MIDDLEWARE] 👤 Usuario:', user ? `${user.email} (${user.id})` : 'No autenticado')
  if (userError) {
    console.error('[MIDDLEWARE] ❌ Error obteniendo usuario:', userError)
  }

  // Si es ruta pública
  if (isPublicRoute) {
    console.log('[MIDDLEWARE] 🌐 Ruta pública detectada')

    // Si ya está autenticado, redirigir a su dashboard correspondiente
    if (user) {
      console.log('[MIDDLEWARE] 🔍 Verificando perfil del usuario autenticado...')

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('[MIDDLEWARE] 📋 Perfil:', profile)
      if (profileError) {
        console.error('[MIDDLEWARE] ❌ Error obteniendo perfil:', profileError)
      }

      if (profile) {
        const dashboardUrl = getDashboardUrl(profile.role)
        console.log('[MIDDLEWARE] ↪️  Redirigiendo a:', dashboardUrl)
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    }

    console.log('[MIDDLEWARE] ✅ Permitiendo acceso a ruta pública')
    return response
  }

  // Para rutas protegidas, verificar autenticación
  console.log('[MIDDLEWARE] 🔒 Ruta protegida - verificando autenticación')

  if (!user) {
    console.log('[MIDDLEWARE] ❌ Usuario no autenticado - redirigiendo a login')
    const loginUrl = new URL('/login', request.url)
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Obtener rol del usuario usando admin client (bypassa RLS)
  console.log('[MIDDLEWARE] 🔍 Obteniendo perfil para verificar rol...')

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('[MIDDLEWARE] 📋 Perfil obtenido:', profile)
  if (profileError) {
    console.error('[MIDDLEWARE] ❌ Error obteniendo perfil:', profileError)
  }

  if (!profile) {
    console.log('[MIDDLEWARE] ❌ Perfil no encontrado - redirigiendo a login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Validar acceso según rol
  const pathname = request.nextUrl.pathname
  console.log('[MIDDLEWARE] 🔐 Validando acceso - Role:', profile.role, 'Path:', pathname)

  // Rutas de admin solo para admins
  if (pathname.startsWith('/admin') && profile.role !== 'admin') {
    console.log('[MIDDLEWARE] ❌ Acceso denegado - requiere rol admin')
    const redirectUrl = getDashboardUrl(profile.role)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Rutas de dashboard solo para companies
  if (pathname.startsWith('/dashboard') && profile.role !== 'company') {
    console.log('[MIDDLEWARE] ❌ Acceso denegado - requiere rol company')
    const redirectUrl = getDashboardUrl(profile.role)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Rutas de driver solo para drivers
  if (pathname.startsWith('/driver') && profile.role !== 'driver') {
    console.log('[MIDDLEWARE] ❌ Acceso denegado - requiere rol driver')
    const redirectUrl = getDashboardUrl(profile.role)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Si pasa todas las validaciones, permitir acceso
  console.log('[MIDDLEWARE] ✅ Acceso permitido')
  return response
}

/**
 * Obtiene la URL del dashboard según el rol del usuario
 *
 * @param role - Rol del usuario ('admin', 'company', 'driver')
 * @returns URL del dashboard correspondiente
 */
function getDashboardUrl(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'company':
      return '/dashboard'
    case 'driver':
      return '/driver'
    default:
      return '/login'
  }
}

/**
 * Configuración del matcher
 *
 * Especifica qué rutas deben pasar por el middleware.
 * Excluye:
 * - Archivos estáticos (_next/static)
 * - Optimización de imágenes (_next/image)
 * - Favicon
 * - Archivos de imágenes (svg, png, jpg, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database.types'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route) || request.nextUrl.pathname === '/'
  )

  if (isPublicRoute) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        const dashboardUrl = getDashboardUrl(profile.role)
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
      }
    }
    return response
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const pathname = request.nextUrl.pathname
  if (pathname.startsWith('/admin') && profile.role !== 'admin') {
    const redirectUrl = getDashboardUrl(profile.role)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  if (pathname.startsWith('/dashboard') && profile.role !== 'company') {
    const redirectUrl = getDashboardUrl(profile.role)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  if (pathname.startsWith('/driver') && profile.role !== 'driver') {
    const redirectUrl = getDashboardUrl(profile.role)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return response
}

function getDashboardUrl(role: string | null): string {
    if (!role) return '/login'
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
/**
 * Supabase Server Client
 *
 * This client is for use in Server Components, Server Actions, and API Routes.
 * It properly handles cookies for authentication in the Next.js App Router.
 *
 * Usage:
 * - Import in Server Components (default Next.js 14 components)
 * - Use in Server Actions
 * - Use in API Route Handlers
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Creates and returns a Supabase client for server-side usage
 *
 * This client:
 * - Reads and writes cookies for auth state
 * - Can be used in Server Components
 * - Can be used in Server Actions
 * - Can be used in API Routes
 * - Properly handles cookie management with Next.js
 *
 * @returns Supabase client instance
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client for API Routes (Route Handlers)
 *
 * This version is optimized for API routes where you have full control
 * over the response object and can set cookies directly.
 *
 * @param cookieStore - The cookie store from next/headers
 * @returns Supabase client instance
 */
export async function createClientForRouteHandler() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

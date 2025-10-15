/**
 * Supabase Middleware Client
 *
 * This client is specifically for use in Next.js middleware.
 * It handles authentication state and token refresh at the edge.
 *
 * Usage:
 * - Import in middleware.ts file
 * - Automatically refreshes auth tokens
 * - Protects routes based on authentication state
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for use in Next.js middleware
 *
 * This client:
 * - Runs at the edge (before page render)
 * - Automatically refreshes expired auth tokens
 * - Updates cookies in the response
 * - Allows you to check auth state before rendering pages
 *
 * @param request - The incoming Next.js request
 * @returns Object containing the Supabase client and updated response
 */
export async function createClient(request: NextRequest) {
  // Create a response object to mutate
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
          // Update the request cookies for the current request
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response cookies to persist the change
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Update the request cookies for the current request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Update the response cookies to persist the change
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}

/**
 * Helper function to update session in middleware
 *
 * This function should be called in your middleware to:
 * 1. Refresh the user's session if needed
 * 2. Update the auth cookies
 *
 * @param request - The incoming Next.js request
 * @returns The updated response with refreshed session cookies
 */
export async function updateSession(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  // Refresh session if expired - this will handle token refresh automatically
  await supabase.auth.getUser()

  return response
}

/**
 * Supabase Browser Client
 *
 * This client is for use in Client Components and browser-side code.
 * It uses cookies for authentication state management.
 *
 * Usage:
 * - Import in Client Components (components with 'use client' directive)
 * - Handles authentication state automatically
 * - Supports real-time subscriptions
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Creates and returns a Supabase client for browser/client-side usage
 *
 * This client:
 * - Manages auth state via cookies
 * - Can be used in Client Components
 * - Supports real-time subscriptions
 * - Automatically refreshes tokens
 *
 * @returns Supabase client instance
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

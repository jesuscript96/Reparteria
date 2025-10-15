/**
 * Supabase Admin Client
 *
 * This client uses the service_role key and bypasses Row Level Security (RLS).
 * ⚠️ ONLY USE ON THE SERVER SIDE - NEVER expose this client to the browser.
 *
 * Use cases:
 * - Administrative operations
 * - Batch operations across multiple companies
 * - System-level tasks
 * - Operations that need to bypass RLS
 * - User management via Supabase Auth Admin API
 *
 * ⚠️ WARNING: This client has full access to all data.
 * Use with extreme caution and only when absolutely necessary.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Creates and returns a Supabase admin client with service_role key
 *
 * This client:
 * - Bypasses ALL Row Level Security policies
 * - Has full access to all data in the database
 * - Can perform administrative operations
 * - Can manage users via Auth Admin API
 * - Should ONLY be used in secure server-side contexts
 *
 * ⚠️ SECURITY WARNING:
 * - Never use in Client Components
 * - Never expose to the browser
 * - Only use when RLS bypass is absolutely required
 * - Always validate user permissions before using
 *
 * @returns Supabase admin client instance
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Singleton instance of the admin client
 * Use this for better performance when you need the admin client multiple times
 */
let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null

/**
 * Gets or creates a singleton instance of the admin client
 *
 * @returns Supabase admin client instance
 */
export function getAdminClient() {
  if (!adminClientInstance) {
    adminClientInstance = createAdminClient()
  }
  return adminClientInstance
}

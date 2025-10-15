/**
 * Authentication and Role Management Helpers
 *
 * This module provides helper functions for:
 * - Getting the current authenticated user
 * - Checking user roles
 * - Enforcing authentication and authorization
 * - Role-based access control
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole, Profile } from '@/types'

/**
 * Gets the current authenticated user's session
 *
 * @returns User object or null if not authenticated
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Gets the current user's full profile from the database
 *
 * @returns Profile object or null if not found
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Gets the current user's role
 *
 * @returns UserRole or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentUserProfile()
  return profile?.role || null
}

/**
 * Checks if the current user is authenticated
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser()
  return !!user
}

/**
 * Requires authentication - redirects to login if not authenticated
 *
 * @param redirectTo - URL to redirect to after login (optional)
 * @returns User object
 */
export async function requireAuth(redirectTo?: string) {
  const user = await getUser()

  if (!user) {
    const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''
    redirect(`/auth/login${params}`)
  }

  return user
}

/**
 * Requires a specific role - redirects to unauthorized page if user doesn't have the role
 *
 * @param allowedRoles - Single role or array of allowed roles
 * @param redirectTo - URL to redirect to if unauthorized (default: /unauthorized)
 * @returns Profile object
 */
export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  redirectTo: string = '/unauthorized'
): Promise<Profile> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(profile.role)) {
    redirect(redirectTo)
  }

  return profile
}

/**
 * Checks if the current user has admin role
 *
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

/**
 * Checks if the current user has company role
 *
 * @returns true if user is company, false otherwise
 */
export async function isCompany(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'company'
}

/**
 * Checks if the current user has driver role
 *
 * @returns true if user is driver, false otherwise
 */
export async function isDriver(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'driver'
}

/**
 * Requires admin role - redirects if not admin
 *
 * @returns Profile object
 */
export async function requireAdmin(): Promise<Profile> {
  return requireRole('admin')
}

/**
 * Requires company role - redirects if not company
 *
 * @returns Profile object
 */
export async function requireCompany(): Promise<Profile> {
  return requireRole('company')
}

/**
 * Requires driver role - redirects if not driver
 *
 * @returns Profile object
 */
export async function requireDriver(): Promise<Profile> {
  return requireRole('driver')
}

/**
 * Checks if the current user has access to a specific company's data
 *
 * @param companyId - The company ID to check access for
 * @returns true if user has access, false otherwise
 */
export async function hasCompanyAccess(companyId: string): Promise<boolean> {
  const profile = await getCurrentUserProfile()

  if (!profile) return false

  // Admin has access to all companies
  if (profile.role === 'admin') return true

  // Company user has access to their own company
  if (profile.role === 'company' && profile.company_id === companyId) return true

  // Driver has access to their company
  if (profile.role === 'driver' && profile.company_id === companyId) return true

  return false
}

/**
 * Requires access to a specific company - redirects if no access
 *
 * @param companyId - The company ID to check access for
 * @returns Profile object
 */
export async function requireCompanyAccess(companyId: string): Promise<Profile> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  const hasAccess = await hasCompanyAccess(companyId)

  if (!hasAccess) {
    redirect('/unauthorized')
  }

  return profile
}

/**
 * Gets the company ID for the current user
 *
 * @returns Company ID or null if not associated with a company
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  const profile = await getCurrentUserProfile()

  if (!profile) return null

  // For company role, company_id is the user's own ID (from trigger)
  if (profile.role === 'company') {
    return profile.id
  }

  // For driver role, return the associated company_id
  if (profile.role === 'driver') {
    return profile.company_id
  }

  // Admin has no specific company
  return null
}

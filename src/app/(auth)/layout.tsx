/**
 * Auth Layout
 *
 * Layout wrapper for authentication pages (login, register)
 * This is a simple pass-through layout that allows auth pages
 * to have their own styling without the main app layout
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

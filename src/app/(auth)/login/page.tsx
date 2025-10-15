'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthLayout } from '@/components/shared/layouts/auth-layout'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get redirect URL from query params if available
  const redirectTo = searchParams.get('redirectTo')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // El middleware se encargará de redirigir al dashboard correcto según el rol
      // Si hay redirectTo, ir ahí; si no, ir a la raíz y dejar que el middleware redirija
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        // Redirigir a dashboard por defecto, el middleware ajustará según el rol
        router.push('/dashboard')
      }

      router.refresh()
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      description="Inicia sesión para acceder a tu panel de control y gestionar tus entregas de manera eficiente."
    >
      <Card
        className="border-0"
        style={{
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: 'var(--bg-elevated)',
        }}
      >
        <CardHeader style={{ paddingBottom: 'var(--space-lg)' }}>
          <CardTitle
            className="text-center"
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-neutral-900)',
            }}
          >
            Iniciar Sesión
          </CardTitle>
          <CardDescription
            className="text-center"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-neutral-700)',
              marginTop: 'var(--space-xs)',
            }}
          >
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {error && (
              <Alert variant="destructive" style={{ borderRadius: 'var(--radius-md)' }}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <Label
                htmlFor="email"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-neutral-900)',
                }}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  fontSize: 'var(--font-size-base)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <Label
                htmlFor="password"
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-neutral-900)',
                }}
              >
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{
                  fontSize: 'var(--font-size-base)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{
                marginTop: 'var(--space-sm)',
                padding: '12px 24px',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: 'var(--radius-md)',
                transition: `all var(--duration-fast) var(--ease-out)`,
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" variant="white" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div
            className="text-center"
            style={{
              marginTop: 'var(--space-lg)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <span style={{ color: 'var(--color-neutral-700)' }}>¿No tienes cuenta? </span>
            <Link
              href="/auth/register"
              style={{
                color: 'var(--color-primary-600)',
                fontWeight: 'var(--font-weight-medium)',
                transition: `color var(--duration-fast) var(--ease-out)`,
              }}
              className="hover:opacity-80"
            >
              Regístrate
            </Link>
          </div>

          {/* Test credentials hint (remove in production) */}
          <div
            style={{
              marginTop: 'var(--space-md)',
              padding: 'var(--space-md)',
              backgroundColor: 'var(--color-info-light)',
              border: `1px solid var(--color-primary-200)`,
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-neutral-800)',
            }}
          >
            <p
              style={{
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--space-sm)',
                color: 'var(--color-primary-900)',
              }}
            >
              Credenciales de prueba:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <p>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Admin:</span>{' '}
                admin@rutasdelivery.com / Admin123!
              </p>
              <p>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Empresa:</span>{' '}
                empresa1@distribuidoranorte.com / Company1!
              </p>
              <p>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Driver:</span>{' '}
                driver1@distribuidoranorte.com / Driver1!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

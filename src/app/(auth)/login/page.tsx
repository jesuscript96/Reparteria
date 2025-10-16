import { Suspense } from 'react'
import { AuthLayout } from '@/components/shared/layouts/auth-layout'
import { LoginForm } from '@/components/auth/login-form'
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      description="Inicia sesión para acceder a tu panel de control y gestionar tus entregas de manera eficiente."
    >
      <Suspense fallback={<div className="flex justify-center items-center h-40"><LoadingSpinner /></div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
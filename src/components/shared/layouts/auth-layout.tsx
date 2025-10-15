import { cn } from '@/lib/utils'
import { Logo } from '@/components/shared/ui/logo'
import { Truck, MapPin, BarChart3, Users } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

/**
 * Auth Layout Component
 *
 * Two-column layout for authentication pages
 * - Left: Branding and features
 * - Right: Auth form
 *
 * Responsive: Stacks on mobile, side-by-side on desktop
 */
export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br text-white"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%)',
        }}
      >
        <div>
          <Logo variant="full" size="lg" className="mb-12 animate-fade-in" />
          <div className="max-w-md animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h1 className="text-heading-1 font-bold mb-4" style={{ fontSize: 'var(--font-size-4xl)' }}>
              {title || 'Optimiza tus rutas de entrega'}
            </h1>
            <p className="text-lg opacity-90" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
              {description ||
                'Sistema completo de gestión y optimización de rutas para empresas de logística y delivery.'}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-6 max-w-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Feature
            icon={<Truck className="h-6 w-6" />}
            title="Gestión de Entregas"
            description="Control total de tus envíos"
          />
          <Feature
            icon={<MapPin className="h-6 w-6" />}
            title="Optimización de Rutas"
            description="Ahorra tiempo y combustible"
          />
          <Feature
            icon={<BarChart3 className="h-6 w-6" />}
            title="Analíticas en Tiempo Real"
            description="Toma decisiones informadas"
          />
          <Feature
            icon={<Users className="h-6 w-6" />}
            title="Gestión de Repartidores"
            description="Coordina tu equipo"
          />
        </div>

        {/* Footer */}
        <div className="text-sm opacity-75">
          © 2025 RutasDelivery. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div
        className="flex items-center justify-center p-4 sm:p-8"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo variant="full" size="md" />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex flex-col" style={{ gap: 'var(--space-sm)' }}>
      <div className="flex items-center" style={{ gap: 'var(--space-sm)' }}>
        <div
          className="p-2 bg-white/10 backdrop-blur-sm"
          style={{
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm)',
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
          {title}
        </h3>
        <p className="text-xs opacity-75" style={{ fontSize: 'var(--font-size-xs)' }}>
          {description}
        </p>
      </div>
    </div>
  )
}

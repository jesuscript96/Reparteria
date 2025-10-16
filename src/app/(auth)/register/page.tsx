import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Truck } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600">
            Elige el tipo de cuenta que deseas crear
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Opción Empresa */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Soy una Empresa</CardTitle>
              <CardDescription>
                Optimiza las rutas de tus repartidores y gestiona entregas de forma eficiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Gestión de múltiples repartidores</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Optimización automática de rutas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Tracking en tiempo real</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Reportes y analíticas</span>
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/register/company">
                  Registrar Empresa
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Opción Repartidor */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Soy Repartidor</CardTitle>
              <CardDescription>
                Únete a una empresa existente con un código de invitación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Rutas optimizadas diarias</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Navegación integrada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Gestión simple de entregas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Historial de desempeño</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register/driver">
                  Unirme como Repartidor
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-600">¿Ya tienes cuenta? </span>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

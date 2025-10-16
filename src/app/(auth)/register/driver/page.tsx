'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner'
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import { Database } from '@/types/database.types'

type VehicleType = Database['public']['Enums']['vehicle_type']

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'bike', label: '🚲 Bicicleta' },
  { value: 'motorcycle', label: '🏍️ Motocicleta' },
  { value: 'car', label: '🚗 Automóvil' },
  { value: 'van', label: '🚐 Camioneta' },
  { value: 'truck', label: '🚚 Camión' },
]

interface CompanyInfo {
  id: string
  name: string
}

export default function RegisterDriverPage() {
  const [step, setStep] = useState<'code' | 'form'>('code')
  const [inviteCode, setInviteCode] = useState('')
  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    vehicleType: '' as VehicleType | '',
    licensePlate: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateCode = async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/drivers/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar el código')
      }

      setCompany(data.company)
      setStep('form')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al validar el código'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!formData.vehicleType) {
      setError('Debes seleccionar un tipo de vehículo')
      return
    }

    if (!company) {
      setError('Debes validar un código de invitación primero')
      return
    }

    setLoading(true)

    try {
      // 1. Crear usuario (el trigger creará el perfil automáticamente)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'driver',
            company_id: company.id,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      // 2. Esperar un momento para que el trigger cree el perfil
      await new Promise(resolve => setTimeout(resolve, 500))

      // 3. Crear driver
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          id: authData.user.id,
          company_id: company.id,
          driver_code: inviteCode,
          vehicle_type: formData.vehicleType,
          license_plate: formData.licensePlate,
          is_active: true,
          is_available: true,
        })

      if (driverError) throw driverError

      router.push('/driver')
      router.refresh()
    } catch (error) {
      console.error('Error en registro:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la cuenta'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link
            href="/register"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </Link>
          <CardTitle className="text-2xl font-bold">Unirse como Repartidor</CardTitle>
          <CardDescription>
            {step === 'code'
              ? 'Ingresa el código de invitación de tu empresa'
              : `Registrándote en: ${company?.name}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'code' ? (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de Invitación</Label>
                <Input
                  id="code"
                  placeholder="ABC123-INVITE"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Solicita este código a tu empleador
                </p>
              </div>

              <Button
                onClick={validateCode}
                className="w-full"
                disabled={loading || !inviteCode}
              >
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Validando...
                  </>
                ) : (
                  'Validar Código'
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Te estás registrando en: <strong>{company?.name}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Tipo de Vehículo *</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => handleChange('vehicleType', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Placa (Opcional)</Label>
                <Input
                  id="licensePlate"
                  placeholder="ABC-123"
                  value={formData.licensePlate}
                  onChange={(e) => handleChange('licensePlate', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('code')
                    setCompany(null)
                  }}
                  disabled={loading}
                >
                  Cambiar Código
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

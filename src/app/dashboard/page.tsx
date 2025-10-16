import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener el perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirigir según el rol
  switch (profile?.role) {
    case 'admin':
      redirect('/admin')
    case 'company':
      redirect('/company')
    case 'driver':
      redirect('/driver')
    default:
      // Si no tiene rol, redirigir a login
      redirect('/login')
  }
}

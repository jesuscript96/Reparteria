import { redirect } from 'next/navigation'

/**
 * Home Page
 *
 * Redirige automáticamente al login
 * El middleware se encargará de redirigir usuarios autenticados al dashboard correcto
 */
export default function Home() {
  redirect('/login')
}

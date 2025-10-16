/**
 * Script para verificar y arreglar perfiles de usuarios
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsersData = [
  {
    email: 'admin@rutasdelivery.com',
    full_name: 'Admin System',
    phone: '+52-555-0000',
    role: 'admin',
    company_id: null
  },
  {
    email: 'empresa1@distribuidoranorte.com',
    full_name: 'Juan Pérez',
    phone: '+52-555-1001',
    role: 'company',
    company_id: null
  },
  {
    email: 'driver1@distribuidoranorte.com',
    full_name: 'Carlos Ramírez',
    phone: '+52-555-1101',
    role: 'driver',
    company_id: null // Se llenará después
  },
  {
    email: 'driver2@distribuidoranorte.com',
    full_name: 'María González',
    phone: '+52-555-1102',
    role: 'driver',
    company_id: null
  },
  {
    email: 'driver3@distribuidoranorte.com',
    full_name: 'Roberto López',
    phone: '+52-555-1103',
    role: 'driver',
    company_id: null
  },
  {
    email: 'driver4@distribuidoranorte.com',
    full_name: 'Ana Martínez',
    phone: '+52-555-1104',
    role: 'driver',
    company_id: null
  },
  {
    email: 'empresa2@logisticaexpress.com',
    full_name: 'Laura Sánchez',
    phone: '+52-555-2001',
    role: 'company',
    company_id: null
  },
  {
    email: 'driver1@logisticaexpress.com',
    full_name: 'Pedro Hernández',
    phone: '+52-555-2101',
    role: 'driver',
    company_id: null
  },
  {
    email: 'driver2@logisticaexpress.com',
    full_name: 'Sofía Torres',
    phone: '+52-555-2102',
    role: 'driver',
    company_id: null
  },
  {
    email: 'driver3@logisticaexpress.com',
    full_name: 'Diego Morales',
    phone: '+52-555-2103',
    role: 'driver',
    company_id: null
  }
]

async function fixProfiles() {
  console.log('🔍 Verificando y arreglando perfiles...\n')

  // Primero, obtener el ID de la empresa1 para asignar a los drivers
  const { data: company1User } = await supabase.auth.admin.listUsers()
  const empresa1 = company1User?.users.find(u => u.email === 'empresa1@distribuidoranorte.com')
  const empresa2 = company1User?.users.find(u => u.email === 'empresa2@logisticaexpress.com')

  let successCount = 0
  let errorCount = 0

  for (const userData of testUsersData) {
    try {
      // Buscar el usuario en auth.users por email
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

      if (listError) {
        throw listError
      }

      const user = users.find(u => u.email === userData.email)

      if (!user) {
        console.log(`⚠️  Usuario no encontrado: ${userData.email}`)
        errorCount++
        continue
      }

      // Determinar company_id para drivers
      let companyId: string | null = userData.company_id
      if (userData.role === 'driver') {
        if (userData.email.includes('distribuidoranorte')) {
          companyId = empresa1?.id ?? null
        } else if (userData.email.includes('logisticaexpress')) {
          companyId = empresa2?.id ?? null
        }
      }

      // Actualizar o crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          company_id: companyId
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error(`❌ Error actualizando perfil para ${userData.email}:`, profileError)
        errorCount++
        continue
      }

      console.log(`✅ Perfil actualizado: ${userData.email} (ID: ${user.id})`)
      successCount++

    } catch (error) {
      console.error(`❌ Error procesando ${userData.email}:`, error)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Resumen:')
  console.log(`✅ Perfiles actualizados: ${successCount}`)
  console.log(`❌ Errores: ${errorCount}`)
  console.log('='.repeat(50))

  if (successCount > 0) {
    console.log('\n🎉 Perfiles arreglados exitosamente!')
    console.log('\nPuedes hacer login con:')
    console.log('\n📧 Admin:')
    console.log('   Email: admin@rutasdelivery.com')
    console.log('   Password: Admin123!')
  }
}

fixProfiles()
  .then(() => {
    console.log('\n✨ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script falló:', error)
    process.exit(1)
  })

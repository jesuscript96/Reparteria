/**
 * Script para crear usuarios de prueba en Supabase Auth
 *
 * Ejecutar con: npx tsx scripts/create-test-users.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestUser {
  id: string
  email: string
  password: string
  full_name: string
  phone: string
  role: 'admin' | 'company' | 'driver'
  company_id?: string
}

const testUsers: TestUser[] = [
  // Admin
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@rutasdelivery.com',
    password: 'Admin123!',
    full_name: 'Admin System',
    phone: '+52-555-0000',
    role: 'admin'
  },
  // Company 1
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'empresa1@distribuidoranorte.com',
    password: 'Company1!',
    full_name: 'Juan Pérez',
    phone: '+52-555-1001',
    role: 'company'
  },
  // Company 1 Drivers
  {
    id: '11000000-0000-0000-0000-000000000001',
    email: 'driver1@distribuidoranorte.com',
    password: 'Driver1!',
    full_name: 'Carlos Ramírez',
    phone: '+52-555-1101',
    role: 'driver',
    company_id: '10000000-0000-0000-0000-000000000001'
  },
  {
    id: '11000000-0000-0000-0000-000000000002',
    email: 'driver2@distribuidoranorte.com',
    password: 'Driver2!',
    full_name: 'María González',
    phone: '+52-555-1102',
    role: 'driver',
    company_id: '10000000-0000-0000-0000-000000000001'
  },
  {
    id: '11000000-0000-0000-0000-000000000003',
    email: 'driver3@distribuidoranorte.com',
    password: 'Driver3!',
    full_name: 'Roberto López',
    phone: '+52-555-1103',
    role: 'driver',
    company_id: '10000000-0000-0000-0000-000000000001'
  },
  {
    id: '11000000-0000-0000-0000-000000000004',
    email: 'driver4@distribuidoranorte.com',
    password: 'Driver4!',
    full_name: 'Ana Martínez',
    phone: '+52-555-1104',
    role: 'driver',
    company_id: '10000000-0000-0000-0000-000000000001'
  },
  // Company 2
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'empresa2@logisticaexpress.com',
    password: 'Company2!',
    full_name: 'Laura Sánchez',
    phone: '+52-555-2001',
    role: 'company'
  },
  // Company 2 Drivers
  {
    id: '21000000-0000-0000-0000-000000000001',
    email: 'driver1@logisticaexpress.com',
    password: 'Driver1!',
    full_name: 'Pedro Hernández',
    phone: '+52-555-2101',
    role: 'driver',
    company_id: '20000000-0000-0000-0000-000000000001'
  },
  {
    id: '21000000-0000-0000-0000-000000000002',
    email: 'driver2@logisticaexpress.com',
    password: 'Driver2!',
    full_name: 'Sofía Torres',
    phone: '+52-555-2102',
    role: 'driver',
    company_id: '20000000-0000-0000-0000-000000000001'
  },
  {
    id: '21000000-0000-0000-0000-000000000003',
    email: 'driver3@logisticaexpress.com',
    password: 'Driver3!',
    full_name: 'Diego Morales',
    phone: '+52-555-2103',
    role: 'driver',
    company_id: '20000000-0000-0000-0000-000000000001'
  }
]

async function createTestUsers() {
  console.log('🚀 Creating test users in Supabase Auth...\n')

  let successCount = 0
  let errorCount = 0

  for (const user of testUsers) {
    try {
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name
        }
      })

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User already exists: ${user.email}`)
          continue
        }
        throw authError
      }

      const userId = authData.user?.id

      if (!userId) {
        throw new Error('No user ID returned')
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          company_id: user.company_id || null
        })

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError)
        errorCount++
        continue
      }

      console.log(`✅ Created user: ${user.email} (${user.role})`)
      successCount++

    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`✅ Successfully created: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('='.repeat(50))

  if (successCount > 0) {
    console.log('\n🎉 Test users created successfully!')
    console.log('\nYou can now login with these credentials:')
    console.log('\n📧 Admin:')
    console.log('   Email: admin@rutasdelivery.com')
    console.log('   Password: Admin123!')
    console.log('\n📧 Company:')
    console.log('   Email: empresa1@distribuidoranorte.com')
    console.log('   Password: Company1!')
    console.log('\n📧 Driver:')
    console.log('   Email: driver1@distribuidoranorte.com')
    console.log('   Password: Driver1!')
  }
}

createTestUsers()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })

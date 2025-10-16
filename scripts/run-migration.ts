/**
 * Script para ejecutar una migración SQL en Supabase
 */

import { config } from 'dotenv'
import { readFileSync } from 'fs'
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

async function runMigration() {
  console.log('🚀 Ejecutando migración para arreglar RLS...\n')

  try {
    // Leer el archivo de migración
    const migrationSQL = readFileSync(
      'supabase/migrations/20251016_fix_rls_500_error.sql',
      'utf-8'
    )

    console.log('📄 Contenido de la migración cargado')

    // Ejecutar la migración
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })

    if (error) {
      // Si la función exec_sql no existe, intentar ejecutar directamente
      console.log('⚠️  La función exec_sql no existe, intentando método alternativo...')

      // Dividir el SQL en statements individuales
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📝 Ejecutando ${statements.length} statements...`)

      for (const statement of statements) {
        if (statement.includes('DO $$')) {
          // Saltar bloques DO por ahora
          continue
        }

        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            query: statement + ';'
          })

          if (stmtError) {
            console.error(`❌ Error en statement:`, stmtError)
          }
        } catch (e) {
          // Ignorar errores individuales
        }
      }

      console.log('\n⚠️  No se pudo ejecutar la migración automáticamente.')
      console.log('📋 Por favor ejecuta manualmente el SQL desde Supabase Studio:')
      console.log('   1. Ve a https://supabase.com/dashboard')
      console.log('   2. Selecciona tu proyecto')
      console.log('   3. Ve a SQL Editor')
      console.log('   4. Copia y pega el contenido de:')
      console.log('      supabase/migrations/20251016_fix_rls_500_error.sql')
      console.log('   5. Haz clic en Run\n')

      return
    }

    console.log('✅ Migración ejecutada exitosamente!')
    console.log('\n🎉 Las políticas RLS han sido arregladas')
    console.log('\nAhora puedes hacer login con:')
    console.log('   Email: admin@rutasdelivery.com')
    console.log('   Password: Admin123!')

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error)
    console.log('\n📋 Por favor ejecuta manualmente desde Supabase Studio')
  }
}

runMigration()
  .then(() => {
    console.log('\n✨ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script falló:', error)
    process.exit(1)
  })

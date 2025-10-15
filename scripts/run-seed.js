#!/usr/bin/env node

/**
 * Script para ejecutar el seed de datos en Supabase
 * Uso: node scripts/run-seed.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSeed() {
  console.log('🌱 Iniciando seed de datos...\n')

  try {
    // Leer el archivo de seed
    const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql')
    const seedSQL = fs.readFileSync(seedPath, 'utf8')

    console.log('📄 Archivo seed.sql leído correctamente')
    console.log('🔗 Conectando a Supabase...')

    // Ejecutar el SQL usando la función RPC (necesitamos crear una función que ejecute SQL arbitrario)
    // Como alternativa, vamos a usar el API REST directamente

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: seedSQL })

    if (error) {
      console.error('❌ Error al ejecutar seed:', error)
      console.log('\n💡 Nota: Ejecuta el seed manualmente en Supabase Dashboard > SQL Editor')
      console.log('   Archivo: supabase/seed.sql\n')
      process.exit(1)
    }

    console.log('✅ Seed ejecutado correctamente!')
    console.log(data)

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    console.log('\n💡 SOLUCIÓN ALTERNATIVA:')
    console.log('   1. Ve a: https://wzinfhfkapyqciadhkvv.supabase.co/project/wzinfhfkapyqciadhkvv/sql')
    console.log('   2. Abre el archivo: supabase/seed.sql')
    console.log('   3. Copia y pega el contenido en el SQL Editor')
    console.log('   4. Ejecuta el SQL (botón "Run" o Cmd/Ctrl + Enter)\n')
    process.exit(1)
  }
}

runSeed()

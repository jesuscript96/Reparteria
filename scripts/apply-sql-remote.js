#!/usr/bin/env node

/**
 * Aplicar SQL directamente a la base de datos remota usando REST API
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

// Leer el SQL
const sqlPath = path.join(__dirname, '../supabase/migrations/20251014193136_ensure_profile_trigger.sql')
const fullSql = fs.readFileSync(sqlPath, 'utf8')

async function executeSQL(sql) {
  console.log('📝 Ejecutando SQL...')
  console.log('─'.repeat(60))
  console.log(sql.substring(0, 200) + '...')
  console.log('─'.repeat(60))

  try {
    // Usar la API de Supabase Management para ejecutar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })

    const text = await response.text()

    if (!response.ok) {
      console.log(`❌ Error ${response.status}:`, text)
      return false
    } else {
      console.log('✅ SQL ejecutado exitosamente')
      if (text) console.log('Respuesta:', text)
      return true
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function applyMigration() {
  console.log('🚀 Aplicando migration a base de datos remota...\n')

  // Separar el SQL en statements individuales
  const statements = fullSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 10)

  console.log(`📋 Encontrados ${statements.length} statements SQL\n`)

  // Ejecutar cada statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    console.log(`\n[${i + 1}/${statements.length}]`)
    await executeSQL(stmt)
    // Esperar un poco entre statements
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '═'.repeat(60))
  console.log('✅ Proceso completado')
  console.log('═'.repeat(60))
}

applyMigration()

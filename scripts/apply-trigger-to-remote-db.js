#!/usr/bin/env node

/**
 * Script para aplicar el trigger directamente a PostgreSQL remoto
 * Este script se conecta directamente a la base de datos de Supabase
 */

const postgres = require('postgres')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Construir la URL de conexión desde las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

// Extraer el project ref de la URL de Supabase
// Formato: https://[PROJECT_REF].supabase.co
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Error: No se pudo extraer el project ref de NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

// Construir la connection string para PostgreSQL
// Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
// Nota: Necesitarás la contraseña de la base de datos

console.log('═'.repeat(70))
console.log('  APLICAR TRIGGER A BASE DE DATOS REMOTA - OPCIÓN DIRECTA')
console.log('═'.repeat(70))
console.log('')
console.log('⚠️  IMPORTANTE: Para conectar directamente a PostgreSQL necesitas:')
console.log('')
console.log('1. La contraseña de tu base de datos Supabase')
console.log('2. Puedes encontrarla en:')
console.log('   Dashboard > Project Settings > Database > Database password')
console.log('')
console.log('3. Agrégala a tu .env.local como:')
console.log('   SUPABASE_DB_PASSWORD=tu_contraseña_aqui')
console.log('')

const dbPassword = process.env.SUPABASE_DB_PASSWORD

if (!dbPassword) {
  console.log('❌ Falta SUPABASE_DB_PASSWORD en .env.local')
  console.log('')
  console.log('ALTERNATIVA: Ve manualmente al SQL Editor de Supabase y ejecuta:')
  console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
  console.log('')
  console.log('Copia este SQL:')
  console.log('─'.repeat(70))

  const sqlPath = path.join(__dirname, '../supabase/migrations/20251014193136_ensure_profile_trigger.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  console.log(sql)
  console.log('─'.repeat(70))

  process.exit(1)
}

// Conectar a la base de datos
const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`

async function applyTrigger() {
  console.log('🔌 Conectando a la base de datos...')

  const sql = postgres(connectionString, {
    ssl: 'require'
  })

  try {
    console.log('✅ Conectado exitosamente\n')

    // Leer el SQL de la migración
    const sqlPath = path.join(__dirname, '../supabase/migrations/20251014193136_ensure_profile_trigger.sql')
    const migrationSql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Ejecutando migración...\n')

    // Ejecutar el SQL
    await sql.unsafe(migrationSql)

    console.log('✅ Trigger aplicado exitosamente!\n')

    // Verificar que el trigger existe
    console.log('🔍 Verificando trigger...')
    const result = await sql`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'on_auth_user_created'
    `

    if (result.length > 0) {
      console.log('✅ Trigger encontrado:', result[0])
    } else {
      console.log('⚠️  Trigger no encontrado')
    }

    console.log('\n' + '═'.repeat(70))
    console.log('  ✅ COMPLETADO - Ahora puedes probar el registro')
    console.log('═'.repeat(70))

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await sql.end()
  }
}

applyTrigger()

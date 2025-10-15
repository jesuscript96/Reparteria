#!/usr/bin/env node

/**
 * Script para aplicar el trigger directamente a la base de datos REMOTA de Supabase
 *
 * IMPORTANTE: Este script requiere las credenciales de conexión directa a PostgreSQL
 * Puedes obtenerlas desde:
 * Supabase Dashboard > Project Settings > Database > Connection String
 */

const fs = require('fs')
const path = require('path')

console.log('═'.repeat(70))
console.log('  APLICAR TRIGGER A BASE DE DATOS REMOTA')
console.log('═'.repeat(70))
console.log('')
console.log('⚠️  ATENCIÓN: Este trigger NO se ha aplicado a la base de datos remota.')
console.log('')
console.log('🔧 Para aplicar el trigger, sigue estos pasos:')
console.log('')
console.log('1. Ve al Dashboard de Supabase:')
console.log('   https://supabase.com/dashboard/project/wzinfhfkapyqciadhkvv')
console.log('')
console.log('2. Navega a: SQL Editor (en el menú lateral)')
console.log('')
console.log('3. Copia y pega el siguiente SQL:')
console.log('')
console.log('─'.repeat(70))

// Leer el SQL del archivo de migración
const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20251014193136_ensure_profile_trigger.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

console.log(sql)
console.log('─'.repeat(70))
console.log('')
console.log('4. Haz clic en "Run" para ejecutar el SQL')
console.log('')
console.log('5. Verifica que aparece el mensaje: "Success. No rows returned"')
console.log('')
console.log('6. Vuelve a intentar el registro de usuario')
console.log('')
console.log('═'.repeat(70))
console.log('')
console.log('📋 NOTA: Si prefieres, puedes copiar el SQL directamente desde:')
console.log('   supabase/migrations/20251014193136_ensure_profile_trigger.sql')
console.log('')

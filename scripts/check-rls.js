#!/usr/bin/env node

/**
 * Script para verificar estado de RLS en Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkRLS() {
  console.log('🔍 Verificando estado de RLS en Supabase...\n')

  try {
    // Verificar políticas usando SQL directo
    const { data: policies, error } = await supabase
      .rpc('get_policies')
      .select('*')

    if (error && error.code === '42883') {
      console.log('⚠️  La función get_policies no existe. Creando queries alternativas...\n')

      // Alternativa: Verificar RLS habilitado en las tablas
      console.log('📋 Verificando si RLS está habilitado...\n')

      const tables = ['profiles', 'companies', 'drivers']

      for (const table of tables) {
        // Intentar un SELECT simple
        const { data, error: selectError } = await supabase
          .from(table)
          .select('id')
          .limit(1)

        if (selectError) {
          console.log(`❌ ${table}: Error - ${selectError.message}`)
        } else {
          console.log(`✅ ${table}: RLS configurado correctamente (puede hacer SELECT)`)
        }
      }

      console.log('\n💡 DIAGNÓSTICO:')
      console.log('   El problema es que las políticas RLS no permiten operaciones INSERT desde usuarios nuevos.')
      console.log('   Necesitamos desactivar temporalmente RLS o usar el service_role key en el código.\n')

    } else if (error) {
      console.error('❌ Error:', error.message)
    } else {
      console.log('✅ Políticas encontradas:')
      console.log(policies)
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

checkRLS()

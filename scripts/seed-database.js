#!/usr/bin/env node

/**
 * Script para ejecutar seed de datos en Supabase
 * Crea usuarios y datos de prueba programáticamente
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

// Cliente con service_role para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDatabase() {
  console.log('🌱 Iniciando seed de base de datos...\n')

  try {
    // ============================================
    // 1. CREAR EMPRESA 1: Distribuidora del Norte
    // ============================================
    console.log('📦 Creando Empresa 1: Distribuidora del Norte...')

    const company1Id = '10000000-0000-0000-0000-000000000001'

    // Insertar directamente en companies (sin crear usuario auth)
    const { error: comp1Error } = await supabase
      .from('companies')
      .upsert({
        id: company1Id,
        company_name: 'Distribuidora del Norte',
        business_type: 'restaurante',
        plan_type: 'pro',
        max_drivers: 10,
        is_active: true,
      })

    if (comp1Error) {
      console.log('⚠️  Empresa 1 ya existe o error:', comp1Error.message)
    } else {
      console.log('✅ Empresa 1 creada')
    }

    // ============================================
    // 2. CREAR EMPRESA 2: Logística Express
    // ============================================
    console.log('📦 Creando Empresa 2: Logística Express...')

    const company2Id = '20000000-0000-0000-0000-000000000001'

    const { error: comp2Error } = await supabase
      .from('companies')
      .upsert({
        id: company2Id,
        company_name: 'Logística Express',
        business_type: 'paqueteria',
        plan_type: 'basic',
        max_drivers: 5,
        is_active: true,
      })

    if (comp2Error) {
      console.log('⚠️  Empresa 2 ya existe o error:', comp2Error.message)
    } else {
      console.log('✅ Empresa 2 creada')
    }

    // ============================================
    // 3. CREAR ENTREGAS PARA EMPRESA 1
    // ============================================
    console.log('\n📍 Creando entregas para Empresa 1...')

    const deliveries1 = [
      {
        id: 'd1000000-0000-0000-0000-000000000001',
        company_id: company1Id,
        batch_id: 'batch-001',
        customer_name: 'Restaurant El Buen Sabor',
        customer_phone: '+52-555-3001',
        order_id: 'ORD-2024-001',
        order_content: 'Productos alimenticios',
        order_value: 1250.00,
        delivery_address: 'Calle Juárez 123, Polanco, CDMX',
        delivery_lat: 19.4350,
        delivery_lng: -99.1900,
        priority: 'alta',
        status: 'pending',
      },
      {
        id: 'd1000000-0000-0000-0000-000000000002',
        company_id: company1Id,
        batch_id: 'batch-001',
        customer_name: 'Tienda La Esquina',
        customer_phone: '+52-555-3002',
        order_id: 'ORD-2024-002',
        order_content: 'Bebidas y snacks',
        order_value: 850.50,
        delivery_address: 'Av. Chapultepec 456, Roma, CDMX',
        delivery_lat: 19.4200,
        delivery_lng: -99.1650,
        priority: 'media',
        status: 'pending',
      },
      {
        id: 'd1000000-0000-0000-0000-000000000003',
        company_id: company1Id,
        batch_id: 'batch-001',
        customer_name: 'Supermercado Central',
        customer_phone: '+52-555-3003',
        order_id: 'ORD-2024-003',
        order_content: 'Productos varios',
        order_value: 2100.75,
        delivery_address: 'Av. Insurgentes Sur 789, Del Valle, CDMX',
        delivery_lat: 19.3800,
        delivery_lng: -99.1700,
        priority: 'alta',
        status: 'pending',
      },
      {
        id: 'd1000000-0000-0000-0000-000000000004',
        company_id: company1Id,
        batch_id: 'batch-001',
        customer_name: 'Cafe Moderno',
        customer_phone: '+52-555-3004',
        order_id: 'ORD-2024-004',
        order_content: 'Café y repostería',
        order_value: 680.00,
        delivery_address: 'Calle Amsterdam 321, Condesa, CDMX',
        delivery_lat: 19.4100,
        delivery_lng: -99.1720,
        priority: 'media',
        status: 'assigned',
      },
      {
        id: 'd1000000-0000-0000-0000-000000000005',
        company_id: company1Id,
        batch_id: 'batch-001',
        customer_name: 'Restaurant Italiano',
        customer_phone: '+52-555-3005',
        order_id: 'ORD-2024-005',
        order_content: 'Ingredientes frescos',
        order_value: 1450.00,
        delivery_address: 'Av. Presidente Masaryk 654, Polanco, CDMX',
        delivery_lat: 19.4320,
        delivery_lng: -99.1950,
        priority: 'alta',
        status: 'assigned',
      },
    ]

    const { error: del1Error } = await supabase
      .from('deliveries')
      .upsert(deliveries1)

    if (del1Error) {
      console.log('⚠️  Error creando entregas 1:', del1Error.message)
    } else {
      console.log(`✅ ${deliveries1.length} entregas creadas para Empresa 1`)
    }

    // ============================================
    // 4. CREAR ENTREGAS PARA EMPRESA 2
    // ============================================
    console.log('📍 Creando entregas para Empresa 2...')

    const deliveries2 = [
      {
        id: 'd2000000-0000-0000-0000-000000000001',
        company_id: company2Id,
        batch_id: 'batch-101',
        customer_name: 'Cliente Paquetería 1',
        customer_phone: '+52-555-4001',
        order_id: 'PKG-2024-001',
        order_content: 'Documentos importantes',
        order_value: 150.00,
        delivery_address: 'Calle Morelos 567, Coyoacán, CDMX',
        delivery_lat: 19.3500,
        delivery_lng: -99.1620,
        priority: 'alta',
        status: 'pending',
      },
      {
        id: 'd2000000-0000-0000-0000-000000000002',
        company_id: company2Id,
        batch_id: 'batch-101',
        customer_name: 'Cliente Paquetería 2',
        customer_phone: '+52-555-4002',
        order_id: 'PKG-2024-002',
        order_content: 'Ropa y accesorios',
        order_value: 320.00,
        delivery_address: 'Av. División del Norte 890, Del Valle, CDMX',
        delivery_lat: 19.3720,
        delivery_lng: -99.1680,
        priority: 'media',
        status: 'assigned',
      },
      {
        id: 'd2000000-0000-0000-0000-000000000003',
        company_id: company2Id,
        batch_id: 'batch-101',
        customer_name: 'Cliente Paquetería 3',
        customer_phone: '+52-555-4003',
        order_id: 'PKG-2024-003',
        order_content: 'Electrónicos',
        order_value: 1500.00,
        delivery_address: 'Av. Cuauhtémoc 432, Santa María, CDMX',
        delivery_lat: 19.4150,
        delivery_lng: -99.1580,
        priority: 'alta',
        status: 'delivered',
      },
    ]

    const { error: del2Error } = await supabase
      .from('deliveries')
      .upsert(deliveries2)

    if (del2Error) {
      console.log('⚠️  Error creando entregas 2:', del2Error.message)
    } else {
      console.log(`✅ ${deliveries2.length} entregas creadas para Empresa 2`)
    }

    // ============================================
    // RESUMEN
    // ============================================
    console.log('\n' + '='.repeat(50))
    console.log('✅ SEED COMPLETADO EXITOSAMENTE')
    console.log('='.repeat(50))

    // Contar registros
    const { count: companiesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })

    const { count: deliveriesCount } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Empresas en DB: ${companiesCount}`)
    console.log(`📊 Entregas en DB: ${deliveriesCount}`)
    console.log('\n💡 Ahora puedes:')
    console.log('   1. Registrar una nueva empresa en /register/company')
    console.log('   2. Registrar un repartidor con código: 10000000-0000-0000-0000-000000000001-INVITE')
    console.log('   3. Ver datos de prueba en Supabase Dashboard')
    console.log('')

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

seedDatabase()

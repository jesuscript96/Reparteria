const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function completeSeed() {
  console.log('\n📦 Ejecutando seed completo de datos...\n');

  try {
    // 1. Obtener usuarios de auth
    console.log('🔍 Obteniendo usuarios de Supabase Auth...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) throw usersError;

    const userMap = {};
    users.forEach(user => {
      userMap[user.email] = user.id;
    });

    console.log(`✅ ${users.length} usuarios encontrados\n`);

    // 2. Crear profiles y companies
    const admin_id = userMap['admin@rutasdelivery.com'];
    const company1_id = userMap['empresa1@distribuidoranorte.com'];
    const company2_id = userMap['empresa2@logisticaexpress.com'];

    // Admin profile
    console.log('👤 Creando perfil de admin...');
    await supabase.from('profiles').upsert({
      id: admin_id,
      email: 'admin@rutasdelivery.com',
      full_name: 'Admin System',
      phone: '+52-555-0000',
      role: 'admin',
      company_id: null
    });
    console.log('✅ Admin profile creado');

    // Company 1 profile and company
    console.log('\n🏢 Creando Empresa 1: Distribuidora del Norte...');
    await supabase.from('profiles').upsert({
      id: company1_id,
      email: 'empresa1@distribuidoranorte.com',
      full_name: 'Juan Pérez',
      phone: '+52-555-1001',
      role: 'company',
      company_id: null
    });

    // Wait a bit for trigger to create company
    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabase.from('companies').update({
      company_name: 'Distribuidora del Norte',
      business_type: 'Alimentos y Bebidas',
      rfc: 'DNO890123ABC',
      website: 'https://distribuidoranorte.com',
      address: 'Av. Insurgentes Norte 1234, Ciudad de México',
      lat: 19.4326,
      lng: -99.1332,
      plan_type: 'pro',
      max_drivers: 10,
      max_deliveries_per_month: 1000,
      enable_whatsapp: true,
      enable_email: true,
      whatsapp_number: '+52-555-1001',
      is_active: true,
      onboarding_completed: true
    }).eq('id', company1_id);

    console.log('✅ Empresa 1 creada');

    // Drivers for Company 1
    console.log('\n🚗 Creando repartidores para Empresa 1...');
    const drivers1 = [
      { email: 'driver1@distribuidoranorte.com', name: 'Carlos Ramírez', phone: '+52-555-1101', code: 'DRV001', vehicle: 'van', plate: 'ABC-123-XY' },
      { email: 'driver2@distribuidoranorte.com', name: 'María González', phone: '+52-555-1102', code: 'DRV002', vehicle: 'motorcycle', plate: 'DEF-456-ZW' },
      { email: 'driver3@distribuidoranorte.com', name: 'Roberto López', phone: '+52-555-1103', code: 'DRV003', vehicle: 'car', plate: 'GHI-789-UV' },
      { email: 'driver4@distribuidoranorte.com', name: 'Ana Martínez', phone: '+52-555-1104', code: 'DRV004', vehicle: 'truck', plate: 'JKL-012-ST' }
    ];

    for (const driver of drivers1) {
      const driverId = userMap[driver.email];
      await supabase.from('profiles').upsert({
        id: driverId,
        email: driver.email,
        full_name: driver.name,
        phone: driver.phone,
        role: 'driver',
        company_id: company1_id
      });

      await supabase.from('drivers').upsert({
        id: driverId,
        company_id: company1_id,
        driver_code: driver.code,
        vehicle_type: driver.vehicle,
        license_plate: driver.plate,
        is_active: true,
        is_available: true
      });
    }
    console.log('✅ 4 repartidores creados para Empresa 1');

    // Company 2 profile and company
    console.log('\n🏢 Creando Empresa 2: Logística Express...');
    await supabase.from('profiles').upsert({
      id: company2_id,
      email: 'empresa2@logisticaexpress.com',
      full_name: 'Laura Sánchez',
      phone: '+52-555-2001',
      role: 'company',
      company_id: null
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabase.from('companies').update({
      company_name: 'Logística Express',
      business_type: 'Paquetería',
      rfc: 'LEX567890XYZ',
      website: 'https://logisticaexpress.com',
      address: 'Av. Reforma 500, Ciudad de México',
      lat: 19.4285,
      lng: -99.1277,
      plan_type: 'basic',
      max_drivers: 5,
      max_deliveries_per_month: 500,
      enable_whatsapp: true,
      enable_email: true,
      whatsapp_number: '+52-555-2001',
      is_active: true,
      onboarding_completed: true
    }).eq('id', company2_id);

    console.log('✅ Empresa 2 creada');

    // Drivers for Company 2
    console.log('\n🚗 Creando repartidores para Empresa 2...');
    const drivers2 = [
      { email: 'driver1@logisticaexpress.com', name: 'Pedro Hernández', phone: '+52-555-2101', code: 'EXP001', vehicle: 'motorcycle', plate: 'MNO-345-RS' },
      { email: 'driver2@logisticaexpress.com', name: 'Sofía Torres', phone: '+52-555-2102', code: 'EXP002', vehicle: 'car', plate: 'PQR-678-QP' },
      { email: 'driver3@logisticaexpress.com', name: 'Diego Morales', phone: '+52-555-2103', code: 'EXP003', vehicle: 'van', plate: 'STU-901-NO' }
    ];

    for (const driver of drivers2) {
      const driverId = userMap[driver.email];
      await supabase.from('profiles').upsert({
        id: driverId,
        email: driver.email,
        full_name: driver.name,
        phone: driver.phone,
        role: 'driver',
        company_id: company2_id
      });

      await supabase.from('drivers').upsert({
        id: driverId,
        company_id: company2_id,
        driver_code: driver.code,
        vehicle_type: driver.vehicle,
        license_plate: driver.plate,
        is_active: true,
        is_available: true
      });
    }
    console.log('✅ 3 repartidores creados para Empresa 2');

    // Verificar datos creados
    console.log('\n📊 Verificando datos creados...');
    const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: companiesCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
    const { count: driversCount } = await supabase.from('drivers').select('*', { count: 'exact', head: true });

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ SEED COMPLETADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════');
    console.log(`   • Perfiles: ${profilesCount}`);
    console.log(`   • Empresas: ${companiesCount}`);
    console.log(`   • Repartidores: ${driversCount}`);
    console.log('═══════════════════════════════════════════════\n');

    console.log('📝 Credenciales de prueba:');
    console.log('   Admin:    admin@rutasdelivery.com / Admin123!');
    console.log('   Empresa1: empresa1@distribuidoranorte.com / Company1!');
    console.log('   Empresa2: empresa2@logisticaexpress.com / Company2!');
    console.log('   Driver1:  driver1@distribuidoranorte.com / Driver1!');
    console.log('   (etc...)');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error ejecutando seed:', error.message);
    console.error('Detalles:', error);
  }
}

completeSeed();

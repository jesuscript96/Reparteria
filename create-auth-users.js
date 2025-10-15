const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente con service role para crear usuarios
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAuthUsers() {
  console.log('\n🔐 Creando usuarios de autenticación en Supabase Auth...\n');

  const users = [
    // Admin
    { id: '00000000-0000-0000-0000-000000000001', email: 'admin@rutasdelivery.com', password: 'Admin123!', name: 'Admin System' },
    // Company 1
    { id: '10000000-0000-0000-0000-000000000001', email: 'empresa1@distribuidoranorte.com', password: 'Company1!', name: 'Juan Pérez' },
    // Company 1 Drivers
    { id: '11000000-0000-0000-0000-000000000001', email: 'driver1@distribuidoranorte.com', password: 'Driver1!', name: 'Carlos Ramírez' },
    { id: '11000000-0000-0000-0000-000000000002', email: 'driver2@distribuidoranorte.com', password: 'Driver2!', name: 'María González' },
    { id: '11000000-0000-0000-0000-000000000003', email: 'driver3@distribuidoranorte.com', password: 'Driver3!', name: 'Roberto López' },
    { id: '11000000-0000-0000-0000-000000000004', email: 'driver4@distribuidoranorte.com', password: 'Driver4!', name: 'Ana Martínez' },
    // Company 2
    { id: '20000000-0000-0000-0000-000000000001', email: 'empresa2@logisticaexpress.com', password: 'Company2!', name: 'Laura Sánchez' },
    // Company 2 Drivers
    { id: '21000000-0000-0000-0000-000000000001', email: 'driver1@logisticaexpress.com', password: 'Driver5!', name: 'Pedro Hernández' },
    { id: '21000000-0000-0000-0000-000000000002', email: 'driver2@logisticaexpress.com', password: 'Driver6!', name: 'Sofía Torres' },
    { id: '21000000-0000-0000-0000-000000000003', email: 'driver3@logisticaexpress.com', password: 'Driver7!', name: 'Diego Morales' }
  ];

  let created = 0;
  let existing = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.name
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  ${user.email} - Ya existe`);
          existing++;
        } else {
          console.log(`❌ ${user.email} - Error: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`✅ ${user.email} - Creado`);
        created++;
      }
    } catch (err) {
      console.log(`❌ ${user.email} - Error: ${err.message}`);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 Resumen de creación de usuarios:');
  console.log(`   ✅ Creados: ${created}`);
  console.log(`   ⚠️  Ya existían: ${existing}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📝 Total: ${users.length}`);
  console.log('═══════════════════════════════════════════════\n');

  if (created > 0 || existing > 0) {
    console.log('🎉 Ahora puedes ejecutar el seed de datos:');
    console.log('   node execute-seed.js\n');
  }
}

createAuthUsers().catch(console.error);

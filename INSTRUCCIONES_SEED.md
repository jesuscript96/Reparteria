# Instrucciones para Ejecutar el Seed de Datos

## Estado Actual

✅ **Migración de RLS aplicada correctamente**
El trigger automático para crear perfiles está funcionando.

## Cómo Ejecutar el Seed (Datos de Prueba)

El archivo `supabase/seed.sql` contiene datos de prueba incluyendo:
- 1 Admin
- 2 Empresas de ejemplo
- 7 Repartidores
- ~15 Entregas de prueba
- Rutas y logs de actividad

### Opción 1: SQL Editor de Supabase (Recomendado)

1. **Ve al SQL Editor**:
   - URL: https://wzinfhfkapyqciadhkvv.supabase.co/project/wzinfhfkapyqciadhkvv/sql/new
   - O desde tu Dashboard > SQL Editor

2. **Abre el archivo de seed**:
   - `supabase/seed.sql`

3. **Copia y pega el contenido completo**

4. **Ejecuta el SQL**:
   - Clic en "Run" o presiona `Cmd + Enter` (Mac) / `Ctrl + Enter` (Windows)

5. **Verifica el resultado**:
   - Deberías ver un resumen al final con los conteos de registros creados

### Opción 2: Usar psql (Si lo tienes instalado)

```bash
# Necesitas las credenciales de conexión de tu proyecto Supabase
# Ve a: Project Settings > Database > Connection string

psql "postgresql://postgres.[TU-REF]:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/seed.sql
```

### Opción 3: API de Supabase (Programático)

Si necesitas ejecutar el seed desde código, puedes usar el script:

```bash
node scripts/run-seed.js
```

⚠️ **Nota**: Este método requiere crear primero una función `exec_sql` en Supabase.

## ¿Por qué no se ejecuta automáticamente?

El seed incluye datos en la tabla `profiles` que tiene una relación con `auth.users`.
Para insertar perfiles, primero necesitas usuarios en `auth.users`, pero estos se crean de forma especial a través de Supabase Auth, no con SQL directo.

**Solución**: El seed usa UUIDs fijos. Simplemente ejecútalo manualmente en el SQL Editor y Supabase manejará los conflictos automáticamente con `ON CONFLICT DO NOTHING`.

## Datos de Prueba Incluidos

### Empresa 1: Distribuidora del Norte
- **Email**: empresa1@distribuidoranorte.com
- **Plan**: Pro (10 repartidores, 1000 entregas/mes)
- **Repartidores**: 4 (DRV001-DRV004)
- **Entregas**: 10 entregas con diferentes estados

### Empresa 2: Logística Express
- **Email**: empresa2@logisticaexpress.com
- **Plan**: Basic (5 repartidores, 500 entregas/mes)
- **Repartidores**: 3 (EXP001-EXP003)
- **Entregas**: 5 entregas con diferentes estados

### Admin
- **Email**: admin@rutasdelivery.com
- Para gestión del sistema

## Siguiente Paso

Una vez ejecutado el seed, puedes:

1. **Probar el registro**:
   - `/register/company` - Crear una nueva empresa
   - `/register/driver` - Unirse como repartidor con código

2. **Explorar los datos**:
   - Ve a tu Dashboard de Supabase > Table Editor
   - Revisa las tablas: `companies`, `drivers`, `deliveries`, `routes`

3. **Generar código de invitación**:
   Para que un repartidor se una a "Distribuidora del Norte":
   ```
   Código: 10000000-0000-0000-0000-000000000001-INVITE
   ```

## Solución de Problemas

### Error: "violates foreign key constraint profiles_id_fkey"

Esto significa que estás intentando crear perfiles para usuarios que no existen en `auth.users`.

**Solución**:
- Ejecuta el seed en el SQL Editor de Supabase (Opción 1)
- Los registros que fallen se omitirán gracias a `ON CONFLICT DO NOTHING`
- Los que sí puedan crearse (empresas, entregas, rutas) se crearán correctamente

### Quiero datos limpios

Si necesitas empezar desde cero:

```sql
-- ADVERTENCIA: Esto eliminará TODOS los datos
TRUNCATE profiles, companies, drivers, deliveries, routes, activity_logs CASCADE;
```

Luego ejecuta el seed nuevamente.

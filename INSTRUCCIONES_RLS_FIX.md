# Solución al Error de RLS en Tabla Profiles

## Problema

Error: `new row violates row-level security policy for table "profiles"`

Este error ocurría porque Supabase tiene Row-Level Security (RLS) activado en la tabla `profiles`, pero no había políticas que permitieran a los usuarios recién registrados crear su propio perfil.

## Solución Implementada

### 1. Trigger Automático de Base de Datos

Se creó un trigger que automáticamente crea el perfil del usuario cuando se registra en `auth.users`. Esto es más seguro que hacerlo desde el cliente.

**Ventajas:**
- ✅ Más seguro (ejecuta con SECURITY DEFINER, bypassing RLS)
- ✅ Garantiza que todos los usuarios tengan perfil
- ✅ Reduce código en el cliente
- ✅ Previene errores de RLS

### 2. Políticas RLS Actualizadas

Se agregaron políticas para:
- Permitir que usuarios lean su propio perfil
- Permitir que usuarios actualicen su propio perfil
- Permitir que empresas vean perfiles de sus repartidores

## Pasos para Aplicar la Solución

### Opción A: Ejecutar el SQL directamente en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/migrations/fix_profile_rls.sql`
4. Ejecuta el script (Run)

### Opción B: Usar Supabase CLI (Recomendado)

```bash
# Asegúrate de estar en la raíz del proyecto
cd /Users/jvch/Desktop/AutomatoWebs/reparteria/saas-rutas-delivery

# Aplicar la migración
supabase db push
```

## Cambios Realizados en el Código

### 1. Registro de Empresa (`register/company/page.tsx`)

**Antes:**
```typescript
// Intentaba crear el perfil manualmente con upsert
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({ ... }) // ❌ Esto fallaba por RLS
```

**Después:**
```typescript
// Pasa todos los datos en metadata del usuario
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
      phone: formData.phone,  // ✅ Ahora incluye phone
      role: 'company',
    },
  },
})
// ✅ El trigger crea automáticamente el perfil
```

### 2. Registro de Repartidor (`register/driver/page.tsx`)

**Antes:**
```typescript
// Intentaba crear el perfil manualmente
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    company_id: company.id,
    ...
  }) // ❌ Esto fallaba por RLS
```

**Después:**
```typescript
// Pasa company_id en metadata del usuario
options: {
  data: {
    full_name: formData.fullName,
    phone: formData.phone,
    role: 'driver',
    company_id: company.id,  // ✅ El trigger lo lee y crea el perfil
  },
}
```

## Verificación

Después de aplicar los cambios:

1. Intenta registrar una nueva empresa en `/register/company`
2. Intenta registrar un nuevo repartidor en `/register/driver`
3. Verifica en Supabase Dashboard que:
   - El usuario se creó en `auth.users`
   - El perfil se creó automáticamente en `profiles`
   - La empresa/driver se creó en su tabla correspondiente

## Notas Técnicas

### Cómo Funciona el Trigger

1. Cuando se crea un usuario en `auth.users`, el trigger se dispara
2. Lee los metadatos del usuario (`raw_user_meta_data`)
3. Extrae: `full_name`, `phone`, `role`, `company_id`
4. Crea automáticamente el registro en `profiles`
5. Usa `SECURITY DEFINER` para bypassear RLS de forma segura

### Delay de 500ms

Se agregó un pequeño delay después de crear el usuario:

```typescript
await new Promise(resolve => setTimeout(resolve, 500))
```

Esto es para garantizar que el trigger haya completado la creación del perfil antes de continuar. En producción, podrías:
- Eliminar el delay y confiar en que el trigger es síncrono
- Verificar activamente que el perfil exista antes de continuar
- Usar una transacción más sofisticada

## Próximos Pasos Recomendados

1. **Sistema de Códigos de Invitación Robusto**: Crear tabla dedicada
2. **Testing**: Probar el flujo completo de registro
3. **Verificación de Email**: Agregar confirmación por email
4. **Logs**: Agregar logging del trigger para debugging

## Solución de Problemas

### Si aún ves el error de RLS:

1. Verifica que el trigger se creó correctamente:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Verifica que la función existe:
```sql
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

3. Verifica las políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

4. Revisa los logs de Supabase para ver errores del trigger

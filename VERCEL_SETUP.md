# Configuración de Vercel - Checklist

## ✅ Variables de Entorno Requeridas

Debes configurar estas variables de entorno en Vercel:

### 1. Supabase (Obligatorias)

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Dónde encontrarlas:**
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a `Settings` > `API`
3. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Cómo Añadir Variables en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a `Settings` > `Environment Variables`
4. Añade cada variable una por una
5. Selecciona todos los entornos: `Production`, `Preview`, `Development`
6. Haz clic en `Save`

## 🔧 Pasos de Troubleshooting

### Si ves error 404:

1. **Verifica el Build Log** en Vercel:
   - Ve a tu deployment
   - Revisa los logs de build
   - Busca errores de compilación

2. **Verifica las Variables de Entorno**:
   - Asegúrate de que todas las variables estén configuradas
   - Verifica que no haya espacios adicionales
   - Confirma que los valores sean correctos

3. **Re-deploy**:
   ```bash
   git add .
   git commit -m "Fix: Update homepage and middleware"
   git push
   ```

### Si ves errores de Supabase:

1. **Verifica la configuración de RLS**:
   - Las políticas RLS deben estar aplicadas
   - El service role key debe tener acceso

2. **Verifica CORS en Supabase**:
   - Ve a `Authentication` > `URL Configuration`
   - Añade tu URL de Vercel en `Site URL`
   - Añade `https://*.vercel.app/*` en `Redirect URLs`

3. **Verifica la Base de Datos**:
   - Confirma que las migraciones se hayan aplicado
   - Verifica que haya datos seed (al menos un usuario admin)

## 🚀 Comandos Útiles

### Build local para verificar errores:

```bash
npm run build
```

### Ver logs en Vercel:

```bash
vercel logs
```

### Re-deploy forzado:

```bash
vercel --force
```

## 📝 URLs Importantes

- **Tu proyecto en Vercel**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Next.js Deployment Docs**: https://nextjs.org/docs/deployment

## ⚡ Quick Fix

Si después de configurar las variables de entorno sigue sin funcionar:

1. Ve a tu proyecto en Vercel
2. Click en `Deployments`
3. Click en los `...` del último deployment
4. Click en `Redeploy`
5. Marca la opción `Use existing Build Cache` (desmarcada)
6. Click en `Redeploy`

Esto forzará un nuevo build con las variables de entorno actualizadas.

## 🎯 URLs Esperadas

Después de configurar correctamente:

- `/` → Redirige a `/login`
- `/login` → Página de login con el nuevo diseño
- `/register` → Página de selección de registro
- `/register/company` → Registro de empresa
- `/register/driver` → Registro de driver

## 🔍 Debugging

Si necesitas ver más información:

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña `Console`
3. Ve a la pestaña `Network`
4. Recarga la página
5. Busca peticiones en rojo (errores)
6. Comparte los errores para ayuda adicional

## ✨ Después de que Funcione

Una vez que el sitio cargue correctamente:

1. Prueba el login con las credenciales de prueba
2. Verifica que el middleware redirija correctamente según el rol
3. Prueba el registro de una nueva empresa
4. Confirma que los estilos del nuevo diseño se vean correctamente

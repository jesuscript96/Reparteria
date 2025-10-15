-- =====================================================
-- FIX: Row-Level Security para tabla profiles
-- =====================================================
-- Este script resuelve el error de RLS durante el registro
-- creando un trigger que automáticamente crea el perfil
-- cuando se registra un nuevo usuario.
-- =====================================================

-- 1. Crear función que maneja la creación automática del perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, company_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'driver'),
    (new.raw_user_meta_data->>'company_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger que ejecuta la función después de cada signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Eliminar políticas existentes (si las hay) y crear nuevas
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 4. Permitir que usuarios lean su propio perfil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 5. Permitir que usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Permitir que empresas lean perfiles de sus repartidores
CREATE POLICY "Companies can read their drivers profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM companies WHERE id = auth.uid()
    )
    AND company_id = auth.uid()
  );

-- NOTA: No creamos política INSERT porque el trigger lo maneja automáticamente
-- con SECURITY DEFINER (bypass RLS)

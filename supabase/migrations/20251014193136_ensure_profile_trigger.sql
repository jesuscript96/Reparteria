-- =====================================================
-- ASEGURAR que el trigger de creación de perfil existe
-- =====================================================

-- 1. Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Eliminar función anterior si existe
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Crear función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insertar perfil con los datos del usuario
  INSERT INTO public.profiles (id, email, full_name, phone, role, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'driver'),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar que se creó
DO $$
BEGIN
  RAISE NOTICE 'Trigger creado exitosamente';
END $$;

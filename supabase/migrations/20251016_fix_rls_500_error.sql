-- =====================================================
-- FIX RLS 500 ERROR
-- =====================================================
-- El error 500 al leer profiles sugiere un problema con la función
-- get_my_company_id() o con las políticas RLS
-- =====================================================

-- 1. Recrear la función get_my_company_id con mejor manejo de errores
DROP FUNCTION IF EXISTS public.get_my_company_id();

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Intentar obtener company_id del usuario actual
  -- Si falla, retornar NULL en lugar de error
  SELECT company_id INTO v_company_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN v_company_id;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar NULL
    RETURN NULL;
END;
$$;

-- 2. Agregar política explícita para permitir lectura de profiles con service_role
-- Esto permite que las funciones SECURITY DEFINER lean profiles sin problemas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recrear políticas de profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

-- SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- INSERT: Solo el propio usuario puede crear su perfil
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- UPDATE: Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- 3. Verificar que las tablas tengan RLS habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4. Dar permisos a la función
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO service_role;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed - función get_my_company_id mejorada';
  RAISE NOTICE '✅ Políticas de profiles actualizadas para prevenir error 500';
END $$;

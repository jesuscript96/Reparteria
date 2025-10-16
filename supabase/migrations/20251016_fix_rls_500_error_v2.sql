-- =====================================================
-- FIX RLS 500 ERROR - VERSION 2
-- =====================================================
-- Usar CASCADE para eliminar función y todas las políticas dependientes
-- Luego recrear todo correctamente
-- =====================================================

-- 1. Eliminar función con CASCADE (elimina todas las políticas que la usan)
DROP FUNCTION IF EXISTS public.get_my_company_id() CASCADE;

-- 2. Recrear la función con mejor manejo de errores
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
  SELECT company_id INTO v_company_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;

  RETURN v_company_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Dar permisos a la función
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_company_id() TO service_role;

-- 3. Recrear políticas de PROFILES
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 4. Recrear políticas de DRIVERS
CREATE POLICY "drivers_select" ON public.drivers
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR id = auth.uid()
  );

CREATE POLICY "drivers_insert" ON public.drivers
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "drivers_update" ON public.drivers
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id()
    OR id = auth.uid()
  );

CREATE POLICY "drivers_delete" ON public.drivers
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- 5. Recrear políticas de DELIVERIES
CREATE POLICY "deliveries_select" ON public.deliveries
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR driver_id = auth.uid()
  );

CREATE POLICY "deliveries_insert" ON public.deliveries
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "deliveries_update" ON public.deliveries
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id()
    OR driver_id = auth.uid()
  );

CREATE POLICY "deliveries_delete" ON public.deliveries
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- 6. Recrear políticas de ROUTES
CREATE POLICY "routes_select" ON public.routes
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR driver_id = auth.uid()
  );

CREATE POLICY "routes_insert" ON public.routes
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "routes_update" ON public.routes
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id()
    OR driver_id = auth.uid()
  );

CREATE POLICY "routes_delete" ON public.routes
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- 7. Recrear políticas de NOTIFICATIONS
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR driver_id = auth.uid()
  );

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id()
    OR driver_id = auth.uid()
  );

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- 8. Recrear políticas de UPLOADED_FILES
CREATE POLICY "uploaded_files_select" ON public.uploaded_files
  FOR SELECT
  USING (company_id = public.get_my_company_id());

CREATE POLICY "uploaded_files_insert" ON public.uploaded_files
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "uploaded_files_update" ON public.uploaded_files
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "uploaded_files_delete" ON public.uploaded_files
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- 9. Recrear políticas de ACTIVITY_LOGS
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR user_id = auth.uid()
  );

CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 10. Recrear política de COMPANIES
DROP POLICY IF EXISTS "companies_select" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
DROP POLICY IF EXISTS "companies_update" ON public.companies;

CREATE POLICY "companies_select" ON public.companies
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "companies_insert" ON public.companies
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "companies_update" ON public.companies
  FOR UPDATE
  USING (id = auth.uid());

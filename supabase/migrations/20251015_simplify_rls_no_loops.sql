-- =====================================================
-- SIMPLIFICAR RLS - SIN DEPENDENCIAS CIRCULARES
-- =====================================================
-- Estrategia: Las políticas NO harán subconsultas a profiles
-- Los admins usarán service_role_key en lugar de RLS
-- =====================================================

-- 1. PROFILES - Solo ver su propio registro
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- SELECT: Solo su propio perfil
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Cualquier usuario autenticado puede crear su perfil
-- (En realidad se crea via API con service_role, pero por si acaso)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Solo su propio perfil
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- DELETE: Nadie puede eliminar (solo admins via service_role)
-- No crear política de DELETE

-- 2. COMPANIES - Solo ver su propia empresa
DROP POLICY IF EXISTS "companies_select" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
DROP POLICY IF EXISTS "companies_update" ON public.companies;
DROP POLICY IF EXISTS "companies_delete" ON public.companies;

-- SELECT: Solo su propia empresa (company.id = user.id)
CREATE POLICY "companies_select" ON public.companies
  FOR SELECT
  USING (id = auth.uid());

-- INSERT: Solo si el ID coincide con el usuario
CREATE POLICY "companies_insert" ON public.companies
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- UPDATE: Solo su propia empresa
CREATE POLICY "companies_update" ON public.companies
  FOR UPDATE
  USING (id = auth.uid());

-- DELETE: Nadie (solo admins via service_role)

-- 3. DRIVERS - Basado en company_id del perfil del usuario
DROP POLICY IF EXISTS "drivers_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete" ON public.drivers;

-- Crear función SECURITY DEFINER para obtener company_id del usuario
-- SECURITY DEFINER permite que la función lea profiles sin activar RLS recursivo
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

-- SELECT: Drivers de su empresa, o su propio registro de driver
CREATE POLICY "drivers_select" ON public.drivers
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR id = auth.uid()
  );

-- INSERT: Solo en su empresa
CREATE POLICY "drivers_insert" ON public.drivers
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

-- UPDATE: Drivers de su empresa, o su propio registro
CREATE POLICY "drivers_update" ON public.drivers
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id()
    OR id = auth.uid()
  );

-- DELETE: Solo drivers de su empresa
CREATE POLICY "drivers_delete" ON public.drivers
  FOR DELETE
  USING (company_id = public.get_my_company_id());

-- 4. DELIVERIES
DROP POLICY IF EXISTS "deliveries_select" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries_insert" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries_update" ON public.deliveries;
DROP POLICY IF EXISTS "deliveries_delete" ON public.deliveries;

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

-- 5. ROUTES
DROP POLICY IF EXISTS "routes_select" ON public.routes;
DROP POLICY IF EXISTS "routes_insert" ON public.routes;
DROP POLICY IF EXISTS "routes_update" ON public.routes;
DROP POLICY IF EXISTS "routes_delete" ON public.routes;

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

-- 6. NOTIFICATIONS
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;

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

-- 7. UPLOADED_FILES
DROP POLICY IF EXISTS "uploaded_files_select" ON public.uploaded_files;
DROP POLICY IF EXISTS "uploaded_files_insert" ON public.uploaded_files;
DROP POLICY IF EXISTS "uploaded_files_update" ON public.uploaded_files;
DROP POLICY IF EXISTS "uploaded_files_delete" ON public.uploaded_files;

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

-- 8. ACTIVITY_LOGS
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_update" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_delete" ON public.activity_logs;

CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR user_id = auth.uid()
  );

CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE/DELETE: Solo admins via service_role

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS simplificadas sin dependencias circulares';
  RAISE NOTICE 'Nota: Los admins deben usar service_role_key para acceso completo';
END $$;

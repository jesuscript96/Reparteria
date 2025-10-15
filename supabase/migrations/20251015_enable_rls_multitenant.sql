-- =====================================================
-- POLÍTICAS RLS MULTI-TENANT PARA SAAS DE RUTAS
-- =====================================================
-- Modelo de negocio:
-- - Admin del SaaS: acceso total
-- - Company (empresa cliente): solo sus datos
-- - Driver (repartidor): solo sus asignaciones
-- =====================================================

-- Función auxiliar para obtener el role del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Función auxiliar para obtener el company_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Función auxiliar para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- TABLA: profiles
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Ver su propio perfil, o todos si es admin, o perfiles de su empresa si es company
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id  -- Su propio perfil
    OR
    public.is_admin()  -- Admin ve todo
    OR
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())  -- Company ve sus drivers
  );

-- Política INSERT: Solo admins pueden crear perfiles manualmente
-- (Los perfiles se crean via API con service_role)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Política UPDATE: Solo su propio perfil, o todos si es admin
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR
    public.is_admin()
  );

-- Política DELETE: Solo admins
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- TABLA: companies
-- =====================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Ver su propia empresa, o todas si es admin
CREATE POLICY "companies_select" ON public.companies
  FOR SELECT
  USING (
    id = auth.uid()  -- La company se identifica por el user_id
    OR
    public.is_admin()
  );

-- Política INSERT: Solo a través de API (service_role)
CREATE POLICY "companies_insert" ON public.companies
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Política UPDATE: Solo su propia empresa, o todas si es admin
CREATE POLICY "companies_update" ON public.companies
  FOR UPDATE
  USING (
    id = auth.uid()
    OR
    public.is_admin()
  );

-- Política DELETE: Solo admins
CREATE POLICY "companies_delete" ON public.companies
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- TABLA: drivers
-- =====================================================

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Ver drivers de su empresa, o su propio perfil de driver, o todos si es admin
CREATE POLICY "drivers_select" ON public.drivers
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR
    id = auth.uid()  -- Driver ve su propio registro
    OR
    public.is_admin()
  );

-- Política INSERT: Solo companies pueden crear drivers de su empresa, o admins
CREATE POLICY "drivers_insert" ON public.drivers
  FOR INSERT
  WITH CHECK (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- Política UPDATE: Company puede actualizar sus drivers, driver puede actualizar su propio registro, o admin
CREATE POLICY "drivers_update" ON public.drivers
  FOR UPDATE
  USING (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    id = auth.uid()
    OR
    public.is_admin()
  );

-- Política DELETE: Solo company o admin
CREATE POLICY "drivers_delete" ON public.drivers
  FOR DELETE
  USING (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- =====================================================
-- TABLA: deliveries
-- =====================================================

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Ver deliveries de su empresa, o asignadas al driver, o todas si es admin
CREATE POLICY "deliveries_select" ON public.deliveries
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR
    driver_id = auth.uid()
    OR
    public.is_admin()
  );

-- Política INSERT: Solo companies de su empresa, o admins
CREATE POLICY "deliveries_insert" ON public.deliveries
  FOR INSERT
  WITH CHECK (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- Política UPDATE: Company actualiza sus deliveries, driver actualiza las asignadas a él, o admin
CREATE POLICY "deliveries_update" ON public.deliveries
  FOR UPDATE
  USING (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    (public.get_user_role() = 'driver' AND driver_id = auth.uid())
    OR
    public.is_admin()
  );

-- Política DELETE: Solo company o admin
CREATE POLICY "deliveries_delete" ON public.deliveries
  FOR DELETE
  USING (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- =====================================================
-- TABLA: routes
-- =====================================================

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Política SELECT
CREATE POLICY "routes_select" ON public.routes
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR
    driver_id = auth.uid()
    OR
    public.is_admin()
  );

-- Política INSERT
CREATE POLICY "routes_insert" ON public.routes
  FOR INSERT
  WITH CHECK (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- Política UPDATE
CREATE POLICY "routes_update" ON public.routes
  FOR UPDATE
  USING (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    (public.get_user_role() = 'driver' AND driver_id = auth.uid())
    OR
    public.is_admin()
  );

-- Política DELETE
CREATE POLICY "routes_delete" ON public.routes
  FOR DELETE
  USING (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- =====================================================
-- TABLA: notifications
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política SELECT
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR
    driver_id = auth.uid()
    OR
    public.is_admin()
  );

-- Política INSERT
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT
  WITH CHECK (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- Política UPDATE
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    OR
    driver_id = auth.uid()
    OR
    public.is_admin()
  );

-- Política DELETE
CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    OR
    public.is_admin()
  );

-- =====================================================
-- TABLA: uploaded_files
-- =====================================================

ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Política SELECT
CREATE POLICY "uploaded_files_select" ON public.uploaded_files
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR
    public.is_admin()
  );

-- Política INSERT
CREATE POLICY "uploaded_files_insert" ON public.uploaded_files
  FOR INSERT
  WITH CHECK (
    (public.get_user_role() = 'company' AND company_id = public.get_user_company_id())
    OR
    public.is_admin()
  );

-- Política UPDATE
CREATE POLICY "uploaded_files_update" ON public.uploaded_files
  FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    OR
    public.is_admin()
  );

-- Política DELETE
CREATE POLICY "uploaded_files_delete" ON public.uploaded_files
  FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    OR
    public.is_admin()
  );

-- =====================================================
-- TABLA: activity_logs
-- =====================================================

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Solo admins y companies ven sus propios logs
CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT
  USING (
    company_id = public.get_user_company_id()
    OR
    user_id = auth.uid()
    OR
    public.is_admin()
  );

-- Política INSERT: Todos pueden insertar sus propios logs
CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR
    public.is_admin()
  );

-- Política UPDATE: Solo admins
CREATE POLICY "activity_logs_update" ON public.activity_logs
  FOR UPDATE
  USING (public.is_admin());

-- Política DELETE: Solo admins
CREATE POLICY "activity_logs_delete" ON public.activity_logs
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS aplicadas exitosamente';
  RAISE NOTICE 'Tablas protegidas:';
  RAISE NOTICE '  - profiles';
  RAISE NOTICE '  - companies';
  RAISE NOTICE '  - drivers';
  RAISE NOTICE '  - deliveries';
  RAISE NOTICE '  - routes';
  RAISE NOTICE '  - notifications';
  RAISE NOTICE '  - uploaded_files';
  RAISE NOTICE '  - activity_logs';
END $$;

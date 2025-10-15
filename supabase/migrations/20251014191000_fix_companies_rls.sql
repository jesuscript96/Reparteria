-- =====================================================
-- FIX: Row-Level Security para tabla companies
-- =====================================================
-- Permite que usuarios recién registrados creen su empresa
-- =====================================================

-- 1. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Users can read own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;

-- 2. Permitir que usuarios creen su propia empresa (mismo ID que auth.uid)
CREATE POLICY "Users can insert own company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Permitir que usuarios lean su propia empresa
CREATE POLICY "Users can read own company"
  ON companies FOR SELECT
  USING (auth.uid() = id);

-- 4. Permitir que usuarios actualicen su propia empresa
CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Permitir que repartidores lean la empresa a la que pertenecen
CREATE POLICY "Drivers can read their company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

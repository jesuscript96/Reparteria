-- =====================================================
-- FIX: Row-Level Security para tabla drivers
-- =====================================================
-- Permite que repartidores recién registrados creen su perfil de driver
-- =====================================================

-- 1. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can insert own driver profile" ON drivers;
DROP POLICY IF EXISTS "Users can read own driver profile" ON drivers;
DROP POLICY IF EXISTS "Users can update own driver profile" ON drivers;
DROP POLICY IF EXISTS "Companies can read their drivers" ON drivers;
DROP POLICY IF EXISTS "Companies can update their drivers" ON drivers;

-- 2. Permitir que usuarios creen su propio perfil de driver
CREATE POLICY "Users can insert own driver profile"
  ON drivers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Permitir que drivers lean su propio perfil
CREATE POLICY "Users can read own driver profile"
  ON drivers FOR SELECT
  USING (auth.uid() = id);

-- 4. Permitir que drivers actualicen su propio perfil
CREATE POLICY "Users can update own driver profile"
  ON drivers FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Permitir que empresas lean perfiles de sus drivers
CREATE POLICY "Companies can read their drivers"
  ON drivers FOR SELECT
  USING (
    company_id = auth.uid()
  );

-- 6. Permitir que empresas actualicen perfiles de sus drivers
CREATE POLICY "Companies can update their drivers"
  ON drivers FOR UPDATE
  USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

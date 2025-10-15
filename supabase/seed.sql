-- =====================================================
-- SEED DATA for SaaS Rutas Delivery
-- Description: Test data for development
-- =====================================================

-- NOTE: In production, users will be created through Supabase Auth
-- This seed assumes you've created test users in Supabase Auth first
-- Or you can manually insert into auth.users for local development

-- =====================================================
-- 1. ADMIN USER
-- =====================================================

-- Admin Profile (UUID: replace with actual auth.users id)
INSERT INTO profiles (id, email, full_name, phone, role, company_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@rutasdelivery.com', 'Admin System', '+52-555-0000', 'admin', NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. COMPANY 1: Distribuidora del Norte
-- =====================================================

-- Company 1 Profile (UUID: replace with actual auth.users id)
INSERT INTO profiles (id, email, full_name, phone, role, company_id)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'empresa1@distribuidoranorte.com', 'Juan Pérez', '+52-555-1001', 'company', NULL)
ON CONFLICT (id) DO NOTHING;

-- Company 1 Details
INSERT INTO companies (
  id, company_name, business_type, rfc, website,
  address, lat, lng,
  plan_type, max_drivers, max_deliveries_per_month,
  enable_whatsapp, enable_email, whatsapp_number,
  is_active, onboarding_completed
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Distribuidora del Norte',
  'Alimentos y Bebidas',
  'DNO890123ABC',
  'https://distribuidoranorte.com',
  'Av. Insurgentes Norte 1234, Ciudad de México',
  19.4326, -99.1332,
  'pro', 10, 1000,
  true, true, '+52-555-1001',
  true, true
)
ON CONFLICT (id) DO NOTHING;

-- Company 1 Drivers
INSERT INTO profiles (id, email, full_name, phone, role, company_id)
VALUES
  ('11000000-0000-0000-0000-000000000001', 'driver1@distribuidoranorte.com', 'Carlos Ramírez', '+52-555-1101', 'driver', '10000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000002', 'driver2@distribuidoranorte.com', 'María González', '+52-555-1102', 'driver', '10000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000003', 'driver3@distribuidoranorte.com', 'Roberto López', '+52-555-1103', 'driver', '10000000-0000-0000-0000-000000000001'),
  ('11000000-0000-0000-0000-000000000004', 'driver4@distribuidoranorte.com', 'Ana Martínez', '+52-555-1104', 'driver', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drivers (id, company_id, driver_code, vehicle_type, license_plate, is_active, is_available)
VALUES
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'DRV001', 'van', 'ABC-123-XY', true, true),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'DRV002', 'motorcycle', 'DEF-456-ZW', true, true),
  ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'DRV003', 'car', 'GHI-789-UV', true, false),
  ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'DRV004', 'truck', 'JKL-012-ST', true, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. COMPANY 2: Logística Express
-- =====================================================

-- Company 2 Profile
INSERT INTO profiles (id, email, full_name, phone, role, company_id)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'empresa2@logisticaexpress.com', 'Laura Sánchez', '+52-555-2001', 'company', NULL)
ON CONFLICT (id) DO NOTHING;

-- Company 2 Details
INSERT INTO companies (
  id, company_name, business_type, rfc, website,
  address, lat, lng,
  plan_type, max_drivers, max_deliveries_per_month,
  enable_whatsapp, enable_email, whatsapp_number,
  is_active, onboarding_completed
)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'Logística Express',
  'Paquetería',
  'LEX567890XYZ',
  'https://logisticaexpress.com',
  'Av. Reforma 500, Ciudad de México',
  19.4285, -99.1277,
  'basic', 5, 500,
  true, true, '+52-555-2001',
  true, true
)
ON CONFLICT (id) DO NOTHING;

-- Company 2 Drivers
INSERT INTO profiles (id, email, full_name, phone, role, company_id)
VALUES
  ('21000000-0000-0000-0000-000000000001', 'driver1@logisticaexpress.com', 'Pedro Hernández', '+52-555-2101', 'driver', '20000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'driver2@logisticaexpress.com', 'Sofía Torres', '+52-555-2102', 'driver', '20000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000003', 'driver3@logisticaexpress.com', 'Diego Morales', '+52-555-2103', 'driver', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drivers (id, company_id, driver_code, vehicle_type, license_plate, is_active, is_available)
VALUES
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'EXP001', 'motorcycle', 'MNO-345-RS', true, true),
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'EXP002', 'car', 'PQR-678-QP', true, true),
  ('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'EXP003', 'van', 'STU-901-NO', true, false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. DELIVERIES FOR COMPANY 1
-- =====================================================

-- Batch 1 for Company 1
INSERT INTO deliveries (
  id, company_id, batch_id,
  customer_name, customer_phone, customer_email,
  order_id, order_content, order_value,
  delivery_date, delivery_time_start, delivery_time_end,
  delivery_address, delivery_lat, delivery_lng,
  priority, status
)
VALUES
  -- Pending deliveries
  ('d1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'batch-001',
   'Restaurant El Buen Sabor', '+52-555-3001', 'contacto@buensabor.com',
   'ORD-2024-001', 'Productos alimenticios', 1250.00,
   CURRENT_DATE, '09:00', '12:00',
   'Calle Juárez 123, Polanco, CDMX', 19.4350, -99.1900,
   'alta', 'pending'),

  ('d1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'batch-001',
   'Tienda La Esquina', '+52-555-3002', 'info@laesquina.com',
   'ORD-2024-002', 'Bebidas y snacks', 850.50,
   CURRENT_DATE, '10:00', '13:00',
   'Av. Chapultepec 456, Roma, CDMX', 19.4200, -99.1650,
   'media', 'pending'),

  ('d1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'batch-001',
   'Supermercado Central', '+52-555-3003', 'pedidos@central.com',
   'ORD-2024-003', 'Productos varios', 2100.75,
   CURRENT_DATE, '11:00', '14:00',
   'Av. Insurgentes Sur 789, Del Valle, CDMX', 19.3800, -99.1700,
   'alta', 'pending'),

  -- Assigned deliveries
  ('d1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'batch-001',
   'Cafe Moderno', '+52-555-3004', 'cafe@moderno.com',
   'ORD-2024-004', 'Café y repostería', 680.00,
   CURRENT_DATE, '08:00', '11:00',
   'Calle Amsterdam 321, Condesa, CDMX', 19.4100, -99.1720,
   'media', 'assigned'),

  ('d1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'batch-001',
   'Restaurant Italiano', '+52-555-3005', 'ordenes@italiano.com',
   'ORD-2024-005', 'Ingredientes frescos', 1450.00,
   CURRENT_DATE, '09:00', '12:00',
   'Av. Presidente Masaryk 654, Polanco, CDMX', 19.4320, -99.1950,
   'alta', 'assigned'),

  -- In transit
  ('d1000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'batch-002',
   'Panadería Tradicional', '+52-555-3006', 'pan@tradicional.com',
   'ORD-2024-006', 'Harina y levadura', 540.00,
   CURRENT_DATE, '07:00', '10:00',
   'Calle 5 de Mayo 159, Centro, CDMX', 19.4325, -99.1332,
   'baja', 'in_transit'),

  ('d1000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'batch-002',
   'Bar La Cantina', '+52-555-3007', 'bar@lacantina.com',
   'ORD-2024-007', 'Bebidas alcohólicas', 3200.00,
   CURRENT_DATE, '10:00', '13:00',
   'Calle Londres 753, Juárez, CDMX', 19.4280, -99.1630,
   'media', 'in_transit'),

  -- Delivered
  ('d1000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', 'batch-002',
   'Hotel Boutique', '+52-555-3008', 'compras@boutique.com',
   'ORD-2024-008', 'Productos de limpieza', 980.00,
   CURRENT_DATE - 1, '08:00', '11:00',
   'Av. Ejército Nacional 852, Granada, CDMX', 19.4400, -99.1900,
   'media', 'delivered'),

  ('d1000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'batch-002',
   'Oficina Corp SA', '+52-555-3009', 'recepcion@corp.com',
   'ORD-2024-009', 'Suministros de oficina', 750.00,
   CURRENT_DATE - 1, '09:00', '12:00',
   'Paseo de la Reforma 404, Cuauhtémoc, CDMX', 19.4270, -99.1700,
   'baja', 'delivered'),

  ('d1000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'batch-003',
   'Farmacia Salud', '+52-555-3010', 'pedidos@farmaciasalud.com',
   'ORD-2024-010', 'Medicamentos', 1850.00,
   CURRENT_DATE - 2, '07:00', '10:00',
   'Av. Universidad 234, Narvarte, CDMX', 19.3950, -99.1590,
   'alta', 'delivered')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. DELIVERIES FOR COMPANY 2
-- =====================================================

INSERT INTO deliveries (
  id, company_id, batch_id,
  customer_name, customer_phone, customer_email,
  order_id, order_content, order_value,
  delivery_date, delivery_time_start, delivery_time_end,
  delivery_address, delivery_lat, delivery_lng,
  priority, status
)
VALUES
  ('d2000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'batch-101',
   'Cliente Paquetería 1', '+52-555-4001', 'cliente1@email.com',
   'PKG-2024-001', 'Documentos importantes', 150.00,
   CURRENT_DATE, '08:00', '12:00',
   'Calle Morelos 567, Coyoacán, CDMX', 19.3500, -99.1620,
   'alta', 'pending'),

  ('d2000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'batch-101',
   'Cliente Paquetería 2', '+52-555-4002', 'cliente2@email.com',
   'PKG-2024-002', 'Ropa y accesorios', 320.00,
   CURRENT_DATE, '09:00', '13:00',
   'Av. División del Norte 890, Del Valle, CDMX', 19.3720, -99.1680,
   'media', 'assigned'),

  ('d2000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'batch-101',
   'Cliente Paquetería 3', '+52-555-4003', 'cliente3@email.com',
   'PKG-2024-003', 'Electrónicos', 1500.00,
   CURRENT_DATE - 1, '10:00', '14:00',
   'Av. Cuauhtémoc 432, Santa María, CDMX', 19.4150, -99.1580,
   'alta', 'delivered'),

  ('d2000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'batch-101',
   'Cliente Paquetería 4', '+52-555-4004', 'cliente4@email.com',
   'PKG-2024-004', 'Juguetes', 680.00,
   CURRENT_DATE - 1, '11:00', '15:00',
   'Calle Miguel Ángel de Quevedo 221, Coyoacán, CDMX', 19.3380, -99.1870,
   'baja', 'delivered'),

  ('d2000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'batch-102',
   'Cliente Paquetería 5', '+52-555-4005', 'cliente5@email.com',
   'PKG-2024-005', 'Libros', 280.00,
   CURRENT_DATE - 2, '08:00', '12:00',
   'Av. Revolución 876, San Ángel, CDMX', 19.3470, -99.1910,
   'media', 'delivered')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. ROUTES
-- =====================================================

-- Route 1 for Company 1 (in progress)
INSERT INTO routes (
  id, company_id, driver_id, batch_id,
  route_name, route_date, status,
  start_location_address, start_lat, start_lng,
  total_deliveries, total_distance_km, estimated_duration_minutes,
  completed_deliveries, failed_deliveries,
  optimization_score, planned_start_time
)
VALUES (
  'r1000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000001',
  'batch-002',
  'Ruta Norte - Mañana',
  CURRENT_DATE,
  'in_progress',
  'Av. Insurgentes Norte 1234, Ciudad de México',
  19.4326, -99.1332,
  3, 15.5, 90,
  1, 0,
  87.5,
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Route 2 for Company 1 (completed yesterday)
INSERT INTO routes (
  id, company_id, driver_id, batch_id,
  route_name, route_date, status,
  start_location_address, start_lat, start_lng,
  total_deliveries, total_distance_km, estimated_duration_minutes,
  completed_deliveries, failed_deliveries,
  actual_distance_km, actual_duration_minutes,
  optimization_score, on_time_percentage, efficiency_score,
  planned_start_time, actual_start_time, actual_end_time
)
VALUES (
  'r1000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000002',
  'batch-003',
  'Ruta Centro - Tarde',
  CURRENT_DATE - 1,
  'completed',
  'Av. Insurgentes Norte 1234, Ciudad de México',
  19.4326, -99.1332,
  2, 8.2, 45,
  2, 0,
  8.5, 48,
  92.3, 100.0, 93.8,
  (CURRENT_TIMESTAMP - INTERVAL '1 day')::TIMESTAMP,
  (CURRENT_TIMESTAMP - INTERVAL '1 day')::TIMESTAMP,
  (CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '48 minutes')::TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Route 3 for Company 2 (completed yesterday)
INSERT INTO routes (
  id, company_id, driver_id, batch_id,
  route_name, route_date, status,
  start_location_address, start_lat, start_lng,
  total_deliveries, total_distance_km, estimated_duration_minutes,
  completed_deliveries, failed_deliveries,
  actual_distance_km, actual_duration_minutes,
  optimization_score, on_time_percentage, efficiency_score,
  planned_start_time, actual_start_time, actual_end_time
)
VALUES (
  'r2000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '21000000-0000-0000-0000-000000000001',
  'batch-101',
  'Ruta Express 1',
  CURRENT_DATE - 1,
  'completed',
  'Av. Reforma 500, Ciudad de México',
  19.4285, -99.1277,
  2, 12.3, 60,
  2, 0,
  13.1, 65,
  88.7, 100.0, 92.3,
  (CURRENT_TIMESTAMP - INTERVAL '1 day')::TIMESTAMP,
  (CURRENT_TIMESTAMP - INTERVAL '1 day')::TIMESTAMP,
  (CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '65 minutes')::TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. UPDATE DELIVERIES WITH ROUTE ASSIGNMENTS
-- =====================================================

-- Assign deliveries to routes
UPDATE deliveries SET
  route_id = 'r1000000-0000-0000-0000-000000000001',
  route_order = 1,
  driver_id = '11000000-0000-0000-0000-000000000001'
WHERE id = 'd1000000-0000-0000-0000-000000000006';

UPDATE deliveries SET
  route_id = 'r1000000-0000-0000-0000-000000000001',
  route_order = 2,
  driver_id = '11000000-0000-0000-0000-000000000001'
WHERE id = 'd1000000-0000-0000-0000-000000000007';

UPDATE deliveries SET
  route_id = 'r1000000-0000-0000-0000-000000000002',
  route_order = 1,
  driver_id = '11000000-0000-0000-0000-000000000002'
WHERE id = 'd1000000-0000-0000-0000-000000000008';

UPDATE deliveries SET
  route_id = 'r1000000-0000-0000-0000-000000000002',
  route_order = 2,
  driver_id = '11000000-0000-0000-0000-000000000002'
WHERE id = 'd1000000-0000-0000-0000-000000000009';

UPDATE deliveries SET
  route_id = 'r2000000-0000-0000-0000-000000000001',
  route_order = 1,
  driver_id = '21000000-0000-0000-0000-000000000001'
WHERE id = 'd2000000-0000-0000-0000-000000000003';

UPDATE deliveries SET
  route_id = 'r2000000-0000-0000-0000-000000000001',
  route_order = 2,
  driver_id = '21000000-0000-0000-0000-000000000001'
WHERE id = 'd2000000-0000-0000-0000-000000000004';

-- =====================================================
-- 8. ACTIVITY LOGS
-- =====================================================

INSERT INTO activity_logs (company_id, user_id, action, resource_type, details)
VALUES
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'uploaded_deliveries', 'batch',
   '{"filename": "entregas_enero.xlsx", "rows": 10}'::jsonb),

  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'optimized_route', 'route',
   '{"deliveries": 3, "distance_km": 15.5}'::jsonb),

  ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   'created_driver', 'driver',
   '{"driver_code": "EXP001", "name": "Pedro Hernández"}'::jsonb);

-- =====================================================
-- SEED COMPLETE
-- =====================================================

-- Display summary
DO $$
DECLARE
  profile_count INTEGER;
  company_count INTEGER;
  driver_count INTEGER;
  delivery_count INTEGER;
  route_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO company_count FROM companies;
  SELECT COUNT(*) INTO driver_count FROM drivers;
  SELECT COUNT(*) INTO delivery_count FROM deliveries;
  SELECT COUNT(*) INTO route_count FROM routes;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Seed data loaded successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Profiles: %', profile_count;
  RAISE NOTICE 'Companies: %', company_count;
  RAISE NOTICE 'Drivers: %', driver_count;
  RAISE NOTICE 'Deliveries: %', delivery_count;
  RAISE NOTICE 'Routes: %', route_count;
  RAISE NOTICE '============================================';
END $$;

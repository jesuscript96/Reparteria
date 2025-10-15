-- =====================================================
-- MIGRATION: Initial Schema for SaaS Rutas Delivery
-- Description: Multi-tenant delivery route optimization
-- Date: 2024-10-14
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable PostGIS for geolocation features
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Note: gen_random_uuid() is built-in to PostgreSQL 13+, no extension needed

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles in the system
CREATE TYPE user_role AS ENUM ('admin', 'company', 'driver');

-- Subscription plan types
CREATE TYPE plan_type AS ENUM ('free', 'basic', 'pro', 'enterprise');

-- Delivery statuses
CREATE TYPE delivery_status AS ENUM (
  'pending',      -- Not yet assigned
  'assigned',     -- Assigned to driver
  'in_transit',   -- Driver is on the way
  'delivered',    -- Successfully delivered
  'failed',       -- Delivery failed
  'cancelled'     -- Cancelled by company
);

-- Route statuses
CREATE TYPE route_status AS ENUM (
  'planned',      -- Route created, not started
  'in_progress',  -- Driver is executing route
  'completed',    -- All deliveries completed
  'cancelled'     -- Route cancelled
);

-- Priority levels
CREATE TYPE priority_level AS ENUM ('alta', 'media', 'baja');

-- Vehicle types
CREATE TYPE vehicle_type AS ENUM (
  'bike',         -- Bicycle
  'motorcycle',   -- Motorcycle/moto
  'car',          -- Car
  'van',          -- Van
  'truck'         -- Truck
);

-- Notification types
CREATE TYPE notification_type AS ENUM ('whatsapp', 'email', 'sms', 'push');

-- Notification statuses
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed');

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- PROFILES - Extends auth.users
-- -----------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'company',
  company_id UUID, -- NULL for admin and company users, NOT NULL for drivers
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_role_company_relation CHECK (
    -- Admin: no company_id
    (role = 'admin' AND company_id IS NULL) OR
    -- Company: no company_id (they ARE the company)
    (role = 'company' AND company_id IS NULL) OR
    -- Driver: must have company_id
    (role = 'driver' AND company_id IS NOT NULL)
  )
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.company_id IS 'NULL for admin/company, required for drivers';

-- -----------------------------------------------------
-- COMPANIES - Additional info for company users
-- -----------------------------------------------------
CREATE TABLE companies (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_type TEXT,
  rfc TEXT,
  website TEXT,

  -- Base location
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),

  -- Subscription & limits
  plan_type plan_type NOT NULL DEFAULT 'free',
  max_drivers INTEGER NOT NULL DEFAULT 2,
  max_deliveries_per_month INTEGER NOT NULL DEFAULT 100,
  current_month_deliveries INTEGER NOT NULL DEFAULT 0,
  current_month_reset_date DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),

  -- Billing
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,

  -- Notifications config
  enable_whatsapp BOOLEAN NOT NULL DEFAULT false,
  enable_email BOOLEAN NOT NULL DEFAULT true,
  whatsapp_number TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE companies IS 'Company information and subscription details';
COMMENT ON COLUMN companies.current_month_deliveries IS 'Counter for usage limits';

-- -----------------------------------------------------
-- DRIVERS - Delivery drivers
-- -----------------------------------------------------
CREATE TABLE drivers (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_code TEXT NOT NULL,

  -- Vehicle info
  vehicle_type vehicle_type NOT NULL DEFAULT 'motorcycle',
  license_plate TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,

  -- Location
  current_location GEOGRAPHY(POINT, 4326),
  last_location_update TIMESTAMPTZ,

  -- Preferences
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  max_deliveries_per_route INTEGER NOT NULL DEFAULT 20,

  -- Stats
  total_deliveries_completed INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, driver_code)
);

COMMENT ON TABLE drivers IS 'Delivery drivers belonging to companies';
COMMENT ON COLUMN drivers.current_location IS 'Current GPS location (PostGIS geography point)';

-- -----------------------------------------------------
-- DELIVERIES - Individual delivery orders
-- -----------------------------------------------------
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID, -- Group deliveries from same upload

  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,

  -- Order info
  order_id TEXT NOT NULL,
  order_content TEXT,
  order_value DECIMAL(10, 2),

  -- Delivery schedule
  delivery_date DATE NOT NULL,
  delivery_time_start TIME,
  delivery_time_end TIME,

  -- Delivery location
  delivery_address TEXT NOT NULL,
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  delivery_instructions TEXT,

  -- Priority & status
  priority priority_level NOT NULL DEFAULT 'media',
  status delivery_status NOT NULL DEFAULT 'pending',

  -- Assignment
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  route_id UUID, -- Set when assigned to route
  route_order INTEGER, -- Position in route

  -- Timestamps
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Notifications
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  -- Proof of delivery
  delivery_photo_url TEXT,
  delivery_signature_url TEXT,
  delivery_notes TEXT,

  -- Feedback
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, order_id, delivery_date)
);

COMMENT ON TABLE deliveries IS 'Individual delivery orders';
COMMENT ON COLUMN deliveries.batch_id IS 'Groups deliveries from same Excel upload';
COMMENT ON COLUMN deliveries.route_order IS 'Position in optimized route (1-based)';

-- -----------------------------------------------------
-- ROUTES - Optimized delivery routes
-- -----------------------------------------------------
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  batch_id UUID,

  -- Route info
  route_name TEXT NOT NULL,
  route_date DATE NOT NULL,
  status route_status NOT NULL DEFAULT 'planned',

  -- Start location
  start_location_address TEXT,
  start_lat DECIMAL(10, 8),
  start_lng DECIMAL(11, 8),

  -- Planned metrics
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  total_distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,

  -- Actual metrics
  completed_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  actual_distance_km DECIMAL(10, 2),
  actual_duration_minutes INTEGER,

  -- Performance metrics
  optimization_score DECIMAL(5, 2), -- 0-100 score
  on_time_percentage DECIMAL(5, 2), -- % of on-time deliveries
  efficiency_score DECIMAL(5, 2), -- Actual vs estimated

  -- Schedule
  planned_start_time TIMESTAMPTZ,
  planned_end_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE routes IS 'Optimized delivery routes for drivers';
COMMENT ON COLUMN routes.optimization_score IS 'Quality score of route optimization (0-100)';

-- -----------------------------------------------------
-- NOTIFICATIONS - Notification history
-- -----------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,

  -- Notification details
  type notification_type NOT NULL,
  status notification_status NOT NULL DEFAULT 'pending',

  -- Message
  recipient TEXT NOT NULL, -- phone/email address
  subject TEXT,
  message TEXT NOT NULL,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- External tracking
  external_id TEXT, -- ID from Twilio/Resend

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'History of all notifications sent';
COMMENT ON COLUMN notifications.external_id IS 'External service message ID (Twilio/Resend)';

-- -----------------------------------------------------
-- UPLOADED_FILES - Track Excel/CSV uploads
-- -----------------------------------------------------
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL,

  -- File info
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  rows_total INTEGER,
  rows_processed INTEGER NOT NULL DEFAULT 0,
  rows_failed INTEGER NOT NULL DEFAULT 0,
  error_log JSONB,

  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE uploaded_files IS 'Track Excel/CSV file uploads and processing';
COMMENT ON COLUMN uploaded_files.batch_id IS 'Links to deliveries created from this file';

-- -----------------------------------------------------
-- ACTIVITY_LOGS - Audit trail
-- -----------------------------------------------------
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Action details
  action TEXT NOT NULL, -- e.g., 'created_delivery', 'optimized_route'
  resource_type TEXT, -- e.g., 'delivery', 'route'
  resource_id UUID,

  -- Metadata
  details JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_company_id ON activity_logs(company_id);

COMMENT ON TABLE activity_logs IS 'Audit log for all system actions';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_company_id ON profiles(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_profiles_email ON profiles(email);

-- Companies indexes
CREATE INDEX idx_companies_plan_type ON companies(plan_type);
CREATE INDEX idx_companies_is_active ON companies(is_active);
CREATE INDEX idx_companies_stripe_customer_id ON companies(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Drivers indexes
CREATE INDEX idx_drivers_company_id ON drivers(company_id);
CREATE INDEX idx_drivers_is_active ON drivers(is_active);
CREATE INDEX idx_drivers_is_available ON drivers(is_available);
CREATE INDEX idx_drivers_company_active ON drivers(company_id, is_active);
-- PostGIS spatial index for location queries
CREATE INDEX idx_drivers_current_location ON drivers USING GIST(current_location);

-- Deliveries indexes (critical for multi-tenant performance)
CREATE INDEX idx_deliveries_company_id ON deliveries(company_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_deliveries_route_id ON deliveries(route_id) WHERE route_id IS NOT NULL;
CREATE INDEX idx_deliveries_batch_id ON deliveries(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);
-- Composite indexes for common queries
CREATE INDEX idx_deliveries_company_status ON deliveries(company_id, status);
CREATE INDEX idx_deliveries_company_date ON deliveries(company_id, delivery_date);
CREATE INDEX idx_deliveries_driver_status ON deliveries(driver_id, status) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_deliveries_route_order ON deliveries(route_id, route_order) WHERE route_id IS NOT NULL;

-- Routes indexes
CREATE INDEX idx_routes_company_id ON routes(company_id);
CREATE INDEX idx_routes_driver_id ON routes(driver_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_route_date ON routes(route_date);
CREATE INDEX idx_routes_batch_id ON routes(batch_id) WHERE batch_id IS NOT NULL;
-- Composite indexes
CREATE INDEX idx_routes_company_date ON routes(company_id, route_date);
CREATE INDEX idx_routes_company_status ON routes(company_id, status);
CREATE INDEX idx_routes_driver_date ON routes(driver_id, route_date);

-- Notifications indexes
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_delivery_id ON notifications(delivery_id) WHERE delivery_id IS NOT NULL;
CREATE INDEX idx_notifications_driver_id ON notifications(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
-- Composite for retry queries
CREATE INDEX idx_notifications_status_retry ON notifications(status, retry_count) WHERE status = 'failed';

-- Uploaded files indexes
CREATE INDEX idx_uploaded_files_company_id ON uploaded_files(company_id);
CREATE INDEX idx_uploaded_files_batch_id ON uploaded_files(batch_id);
CREATE INDEX idx_uploaded_files_status ON uploaded_files(status);
CREATE INDEX idx_uploaded_files_created_at ON uploaded_files(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Helper function to check if user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Helper function to get user's company_id
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
DECLARE
  user_role user_role;
  user_company_id UUID;
BEGIN
  SELECT role, company_id INTO user_role, user_company_id
  FROM profiles
  WHERE id = auth.uid();

  -- If company user, return their profile id (they ARE the company)
  IF user_role = 'company' THEN
    RETURN auth.uid();
  END IF;

  -- If driver, return their company_id
  IF user_role = 'driver' THEN
    RETURN user_company_id;
  END IF;

  -- Admin or not found
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES RLS Policies
-- =====================================================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Company users can view their drivers' profiles
CREATE POLICY "Companies can view their drivers"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'driver' AND
    company_id = auth.uid()
  );

-- Drivers can view their company's profile
CREATE POLICY "Drivers can view their company"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'company' AND
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- COMPANIES RLS Policies
-- =====================================================

-- Admins can view all companies
CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (is_admin());

-- Company users can view their own company
CREATE POLICY "Companies can view own data"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Drivers can view their company
CREATE POLICY "Drivers can view their company"
  ON companies FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Company users can update their own data
CREATE POLICY "Companies can update own data"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Company users can insert their own data
CREATE POLICY "Companies can insert own data"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- DRIVERS RLS Policies
-- =====================================================

-- Admins can view all drivers
CREATE POLICY "Admins can view all drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (is_admin());

-- Companies can view their own drivers
CREATE POLICY "Companies can view own drivers"
  ON drivers FOR SELECT
  TO authenticated
  USING (company_id = auth.uid());

-- Drivers can view their own profile
CREATE POLICY "Drivers can view own profile"
  ON drivers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Companies can insert drivers
CREATE POLICY "Companies can insert drivers"
  ON drivers FOR INSERT
  TO authenticated
  WITH CHECK (company_id = auth.uid());

-- Companies can update their drivers
CREATE POLICY "Companies can update own drivers"
  ON drivers FOR UPDATE
  TO authenticated
  USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

-- Drivers can update their own data (location, status)
CREATE POLICY "Drivers can update own data"
  ON drivers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Companies can delete their drivers
CREATE POLICY "Companies can delete own drivers"
  ON drivers FOR DELETE
  TO authenticated
  USING (company_id = auth.uid());

-- =====================================================
-- DELIVERIES RLS Policies
-- =====================================================

-- Admins can view all deliveries
CREATE POLICY "Admins can view all deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (is_admin());

-- Companies can view their deliveries
CREATE POLICY "Companies can view own deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

-- Drivers can view assigned deliveries
CREATE POLICY "Drivers can view assigned deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- Companies can insert deliveries
CREATE POLICY "Companies can insert deliveries"
  ON deliveries FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- Companies can update their deliveries
CREATE POLICY "Companies can update own deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- Drivers can update assigned deliveries (status, proof, etc.)
CREATE POLICY "Drivers can update assigned deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Companies can delete their deliveries
CREATE POLICY "Companies can delete own deliveries"
  ON deliveries FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- =====================================================
-- ROUTES RLS Policies
-- =====================================================

-- Admins can view all routes
CREATE POLICY "Admins can view all routes"
  ON routes FOR SELECT
  TO authenticated
  USING (is_admin());

-- Companies can view their routes
CREATE POLICY "Companies can view own routes"
  ON routes FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

-- Drivers can view their assigned routes
CREATE POLICY "Drivers can view assigned routes"
  ON routes FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- Companies can insert routes
CREATE POLICY "Companies can insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- Companies can update their routes
CREATE POLICY "Companies can update own routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- Drivers can update their assigned routes (status, metrics)
CREATE POLICY "Drivers can update assigned routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Companies can delete their routes
CREATE POLICY "Companies can delete own routes"
  ON routes FOR DELETE
  TO authenticated
  USING (company_id = get_user_company_id());

-- =====================================================
-- NOTIFICATIONS RLS Policies
-- =====================================================

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (is_admin());

-- Companies can view their notifications
CREATE POLICY "Companies can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

-- Drivers can view their notifications
CREATE POLICY "Drivers can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- Companies can insert notifications
CREATE POLICY "Companies can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- System can update notifications (for status updates)
CREATE POLICY "Companies can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- =====================================================
-- UPLOADED_FILES RLS Policies
-- =====================================================

-- Admins can view all uploads
CREATE POLICY "Admins can view all uploads"
  ON uploaded_files FOR SELECT
  TO authenticated
  USING (is_admin());

-- Companies can view their uploads
CREATE POLICY "Companies can view own uploads"
  ON uploaded_files FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

-- Companies can insert uploads
CREATE POLICY "Companies can insert uploads"
  ON uploaded_files FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_user_company_id());

-- Companies can update their uploads (status)
CREATE POLICY "Companies can update own uploads"
  ON uploaded_files FOR UPDATE
  TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- =====================================================
-- ACTIVITY_LOGS RLS Policies
-- =====================================================

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Companies can view their activity logs
CREATE POLICY "Companies can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (company_id = get_user_company_id());

-- All authenticated users can insert their own activity
CREATE POLICY "Users can insert own activity"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- -----------------------------------------------------
-- Function: Update updated_at timestamp
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------
-- Function: Auto-create company record when company user signs up
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION create_company_on_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create company record if user role is 'company'
  IF NEW.role = 'company' THEN
    INSERT INTO companies (id, company_name)
    VALUES (NEW.id, COALESCE(NEW.full_name, 'New Company'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_insert_create_company
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'company')
  EXECUTE FUNCTION create_company_on_profile_insert();

-- -----------------------------------------------------
-- Function: Update route counters when delivery status changes
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_route_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if delivery is assigned to a route
  IF NEW.route_id IS NOT NULL THEN
    -- Update route completed/failed counters
    UPDATE routes
    SET
      completed_deliveries = (
        SELECT COUNT(*)
        FROM deliveries
        WHERE route_id = NEW.route_id
          AND status = 'delivered'
      ),
      failed_deliveries = (
        SELECT COUNT(*)
        FROM deliveries
        WHERE route_id = NEW.route_id
          AND status = 'failed'
      )
    WHERE id = NEW.route_id;

    -- Auto-complete route when all deliveries are done
    UPDATE routes
    SET status = 'completed'
    WHERE id = NEW.route_id
      AND status != 'cancelled'
      AND total_deliveries = (completed_deliveries + failed_deliveries);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_status_change_update_route
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_route_counters();

-- -----------------------------------------------------
-- Function: Increment company delivery counter
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION increment_company_delivery_counter()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment counter when new delivery is created
  UPDATE companies
  SET current_month_deliveries = current_month_deliveries + 1
  WHERE id = NEW.company_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_insert_increment_counter
  AFTER INSERT ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION increment_company_delivery_counter();

-- -----------------------------------------------------
-- Function: Reset monthly delivery counters (run via cron)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION reset_monthly_delivery_counters()
RETURNS void AS $$
BEGIN
  UPDATE companies
  SET
    current_month_deliveries = 0,
    current_month_reset_date = DATE_TRUNC('month', CURRENT_DATE)
  WHERE current_month_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_monthly_delivery_counters() IS
  'Reset delivery counters for all companies. Run this monthly via pg_cron or external scheduler.';

-- -----------------------------------------------------
-- Function: Update driver stats when delivery is completed
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update driver stats when delivery is completed
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE drivers
    SET
      total_deliveries_completed = total_deliveries_completed + 1,
      average_rating = (
        SELECT AVG(customer_rating)
        FROM deliveries
        WHERE driver_id = NEW.driver_id
          AND customer_rating IS NOT NULL
      )
    WHERE id = NEW.driver_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_delivery_completed_update_driver_stats
  AFTER UPDATE OF status ON deliveries
  FOR EACH ROW
  WHEN (NEW.driver_id IS NOT NULL)
  EXECUTE FUNCTION update_driver_stats();

-- =====================================================
-- VIEWS
-- =====================================================

-- -----------------------------------------------------
-- VIEW: deliveries_detailed
-- Comprehensive view with all related data
-- -----------------------------------------------------
CREATE OR REPLACE VIEW deliveries_detailed AS
SELECT
  d.id,
  d.company_id,
  c.company_name,
  d.batch_id,

  -- Customer info
  d.customer_name,
  d.customer_phone,
  d.customer_email,

  -- Order info
  d.order_id,
  d.order_content,
  d.order_value,

  -- Delivery details
  d.delivery_date,
  d.delivery_time_start,
  d.delivery_time_end,
  d.delivery_address,
  d.delivery_lat,
  d.delivery_lng,
  d.delivery_instructions,

  -- Status & priority
  d.priority,
  d.status,

  -- Assignment
  d.driver_id,
  dp.full_name AS driver_name,
  dr.driver_code,
  dr.vehicle_type,
  d.route_id,
  r.route_name,
  d.route_order,

  -- Timestamps
  d.assigned_at,
  d.started_at,
  d.estimated_arrival,
  d.actual_arrival,
  d.completed_at,

  -- Proof of delivery
  d.delivery_photo_url,
  d.delivery_signature_url,
  d.delivery_notes,

  -- Feedback
  d.customer_rating,
  d.customer_feedback,

  -- Notifications
  d.notification_sent,
  d.notification_sent_at,

  d.created_at,
  d.updated_at
FROM deliveries d
LEFT JOIN companies c ON d.company_id = c.id
LEFT JOIN drivers dr ON d.driver_id = dr.id
LEFT JOIN profiles dp ON dr.id = dp.id
LEFT JOIN routes r ON d.route_id = r.id;

COMMENT ON VIEW deliveries_detailed IS 'Detailed delivery view with company, driver, and route information';

-- -----------------------------------------------------
-- VIEW: company_stats
-- Aggregate statistics per company
-- -----------------------------------------------------
CREATE OR REPLACE VIEW company_stats AS
SELECT
  c.id AS company_id,
  c.company_name,
  c.plan_type,
  c.is_active,

  -- Driver stats
  COUNT(DISTINCT dr.id) AS total_drivers,
  COUNT(DISTINCT dr.id) FILTER (WHERE dr.is_active) AS active_drivers,

  -- Delivery stats (all time)
  COUNT(DISTINCT d.id) AS total_deliveries,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'delivered') AS completed_deliveries,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'failed') AS failed_deliveries,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'pending') AS pending_deliveries,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'in_transit') AS in_transit_deliveries,

  -- Current month stats
  COUNT(DISTINCT d.id) FILTER (
    WHERE d.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  ) AS current_month_deliveries,

  -- Routes stats
  COUNT(DISTINCT r.id) AS total_routes,
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'completed') AS completed_routes,

  -- Performance metrics
  ROUND(AVG(d.customer_rating), 2) AS average_customer_rating,
  ROUND(AVG(r.optimization_score), 2) AS average_optimization_score,
  ROUND(AVG(r.on_time_percentage), 2) AS average_on_time_percentage,

  -- Financial
  SUM(d.order_value) AS total_order_value,
  SUM(d.order_value) FILTER (WHERE d.status = 'delivered') AS delivered_order_value,

  c.created_at AS company_created_at
FROM companies c
LEFT JOIN drivers dr ON c.id = dr.company_id
LEFT JOIN deliveries d ON c.id = d.company_id
LEFT JOIN routes r ON c.id = r.company_id
GROUP BY c.id, c.company_name, c.plan_type, c.is_active, c.created_at;

COMMENT ON VIEW company_stats IS 'Aggregate statistics for each company';

-- -----------------------------------------------------
-- VIEW: driver_performance
-- Driver performance metrics
-- -----------------------------------------------------
CREATE OR REPLACE VIEW driver_performance AS
SELECT
  dr.id AS driver_id,
  dr.company_id,
  p.full_name AS driver_name,
  dr.driver_code,
  dr.vehicle_type,
  dr.is_active,
  dr.is_available,

  -- Delivery stats
  COUNT(d.id) AS total_assigned_deliveries,
  COUNT(d.id) FILTER (WHERE d.status = 'delivered') AS completed_deliveries,
  COUNT(d.id) FILTER (WHERE d.status = 'failed') AS failed_deliveries,
  COUNT(d.id) FILTER (WHERE d.status = 'in_transit') AS in_progress_deliveries,

  -- Success rate
  ROUND(
    COUNT(d.id) FILTER (WHERE d.status = 'delivered')::NUMERIC /
    NULLIF(COUNT(d.id) FILTER (WHERE d.status IN ('delivered', 'failed')), 0) * 100,
    2
  ) AS success_rate_percentage,

  -- Rating
  ROUND(AVG(d.customer_rating), 2) AS average_rating,
  COUNT(d.id) FILTER (WHERE d.customer_rating IS NOT NULL) AS total_ratings,

  -- On-time performance
  COUNT(d.id) FILTER (
    WHERE d.status = 'delivered'
      AND d.actual_arrival <= d.estimated_arrival
  ) AS on_time_deliveries,

  -- Current month stats
  COUNT(d.id) FILTER (
    WHERE d.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  ) AS current_month_deliveries,

  -- Route stats
  COUNT(DISTINCT r.id) AS total_routes,
  ROUND(AVG(r.efficiency_score), 2) AS average_efficiency_score,

  dr.created_at AS driver_since
FROM drivers dr
LEFT JOIN profiles p ON dr.id = p.id
LEFT JOIN deliveries d ON dr.id = d.driver_id
LEFT JOIN routes r ON dr.id = r.driver_id
GROUP BY dr.id, dr.company_id, p.full_name, dr.driver_code, dr.vehicle_type,
         dr.is_active, dr.is_available, dr.created_at;

COMMENT ON VIEW driver_performance IS 'Performance metrics for each driver';

-- -----------------------------------------------------
-- VIEW: route_summary
-- Route summary with key metrics
-- -----------------------------------------------------
CREATE OR REPLACE VIEW route_summary AS
SELECT
  r.id AS route_id,
  r.company_id,
  c.company_name,
  r.driver_id,
  p.full_name AS driver_name,
  r.route_name,
  r.route_date,
  r.status,

  -- Deliveries
  r.total_deliveries,
  r.completed_deliveries,
  r.failed_deliveries,
  (r.total_deliveries - r.completed_deliveries - r.failed_deliveries) AS pending_deliveries,

  -- Metrics
  r.total_distance_km,
  r.estimated_duration_minutes,
  r.actual_distance_km,
  r.actual_duration_minutes,

  -- Performance
  r.optimization_score,
  r.on_time_percentage,
  r.efficiency_score,

  -- Schedule
  r.planned_start_time,
  r.planned_end_time,
  r.actual_start_time,
  r.actual_end_time,

  -- Completion percentage
  ROUND(
    (r.completed_deliveries::NUMERIC / NULLIF(r.total_deliveries, 0)) * 100,
    2
  ) AS completion_percentage,

  r.created_at,
  r.updated_at
FROM routes r
LEFT JOIN companies c ON r.company_id = c.id
LEFT JOIN drivers dr ON r.driver_id = dr.id
LEFT JOIN profiles p ON dr.id = p.id;

COMMENT ON VIEW route_summary IS 'Route summary with company and driver details';

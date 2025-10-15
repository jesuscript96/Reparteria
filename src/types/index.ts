// Re-export database types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

// =====================================================
// ENUM TYPE ALIASES (más fáciles de usar)
// =====================================================

export type UserRole = 'admin' | 'company' | 'driver'
export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise'
export type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled'
export type RouteStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled'
export type PriorityLevel = 'alta' | 'media' | 'baja'
export type VehicleType = 'bike' | 'motorcycle' | 'car' | 'van' | 'truck'
export type NotificationType = 'whatsapp' | 'email' | 'sms' | 'push'
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed'

// =====================================================
// INTERFACES LIMPIAS (sin relaciones de DB)
// =====================================================

// -----------------------------------------------------
// Profile
// -----------------------------------------------------
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  company_id: string | null
  created_at: string
  updated_at: string
}

// -----------------------------------------------------
// Company
// -----------------------------------------------------
export interface Company {
  id: string
  company_name: string
  business_type: string | null
  rfc: string | null
  website: string | null

  // Location
  address: string | null
  lat: number | null
  lng: number | null

  // Subscription & limits
  plan_type: PlanType
  max_drivers: number
  max_deliveries_per_month: number
  current_month_deliveries: number
  current_month_reset_date: string

  // Billing
  stripe_customer_id: string | null
  subscription_id: string | null
  subscription_status: string | null
  trial_ends_at: string | null

  // Notifications
  enable_whatsapp: boolean
  enable_email: boolean
  whatsapp_number: string | null

  // Status
  is_active: boolean
  onboarding_completed: boolean

  created_at: string
  updated_at: string
}

// -----------------------------------------------------
// Driver
// -----------------------------------------------------
export interface Driver {
  id: string
  company_id: string
  driver_code: string

  // Vehicle
  vehicle_type: VehicleType
  license_plate: string | null

  // Status
  is_active: boolean
  is_available: boolean

  // Location (PostGIS geography point)
  current_location: unknown | null
  last_location_update: string | null

  // Preferences
  notifications_enabled: boolean
  max_deliveries_per_route: number

  // Stats
  total_deliveries_completed: number
  average_rating: number | null

  created_at: string
  updated_at: string
}

// -----------------------------------------------------
// Delivery
// -----------------------------------------------------
export interface Delivery {
  id: string
  company_id: string
  batch_id: string | null

  // Customer
  customer_name: string
  customer_phone: string | null
  customer_email: string | null

  // Order
  order_id: string
  order_content: string | null
  order_value: number | null

  // Delivery schedule
  delivery_date: string
  delivery_time_start: string | null
  delivery_time_end: string | null

  // Delivery location
  delivery_address: string
  delivery_lat: number | null
  delivery_lng: number | null
  delivery_instructions: string | null

  // Priority & status
  priority: PriorityLevel
  status: DeliveryStatus

  // Assignment
  driver_id: string | null
  route_id: string | null
  route_order: number | null

  // Timestamps
  assigned_at: string | null
  started_at: string | null
  estimated_arrival: string | null
  actual_arrival: string | null
  completed_at: string | null

  // Notifications
  notification_sent: boolean
  notification_sent_at: string | null

  // Proof of delivery
  delivery_photo_url: string | null
  delivery_signature_url: string | null
  delivery_notes: string | null

  // Feedback
  customer_rating: number | null
  customer_feedback: string | null

  created_at: string
  updated_at: string
}

// -----------------------------------------------------
// Route
// -----------------------------------------------------
export interface Route {
  id: string
  company_id: string
  driver_id: string
  batch_id: string | null

  // Route info
  route_name: string
  route_date: string
  status: RouteStatus

  // Start location
  start_location_address: string | null
  start_lat: number | null
  start_lng: number | null

  // Planned metrics
  total_deliveries: number
  total_distance_km: number | null
  estimated_duration_minutes: number | null

  // Actual metrics
  completed_deliveries: number
  failed_deliveries: number
  actual_distance_km: number | null
  actual_duration_minutes: number | null

  // Performance metrics
  optimization_score: number | null
  on_time_percentage: number | null
  efficiency_score: number | null

  // Schedule
  planned_start_time: string | null
  planned_end_time: string | null
  actual_start_time: string | null
  actual_end_time: string | null

  created_at: string
  updated_at: string
}

// -----------------------------------------------------
// Notification
// -----------------------------------------------------
export interface Notification {
  id: string
  company_id: string
  delivery_id: string | null
  driver_id: string | null

  // Notification details
  type: NotificationType
  status: NotificationStatus

  // Message
  recipient: string
  subject: string | null
  message: string

  // Timestamps
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null

  // Error handling
  error_message: string | null
  retry_count: number

  // External tracking
  external_id: string | null

  created_at: string
}

// -----------------------------------------------------
// Uploaded File
// -----------------------------------------------------
export interface UploadedFile {
  id: string
  company_id: string
  batch_id: string

  // File info
  filename: string
  file_path: string
  file_size_bytes: number

  // Processing status
  status: string
  rows_total: number | null
  rows_processed: number
  rows_failed: number
  error_log: Record<string, unknown> | null

  processed_at: string | null
  created_at: string
}

// -----------------------------------------------------
// Activity Log
// -----------------------------------------------------
export interface ActivityLog {
  id: string
  company_id: string | null
  user_id: string | null

  // Action details
  action: string
  resource_type: string | null
  resource_id: string | null

  // Metadata
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null

  created_at: string
}

// =====================================================
// VIEW TYPES (estadísticas agregadas)
// =====================================================

export interface CompanyStats {
  company_id: string | null
  company_name: string | null
  plan_type: PlanType | null
  is_active: boolean | null

  // Driver stats
  total_drivers: number | null
  active_drivers: number | null

  // Delivery stats
  total_deliveries: number | null
  completed_deliveries: number | null
  failed_deliveries: number | null
  pending_deliveries: number | null
  in_transit_deliveries: number | null
  current_month_deliveries: number | null

  // Routes stats
  total_routes: number | null
  completed_routes: number | null

  // Performance
  average_customer_rating: number | null
  average_optimization_score: number | null
  average_on_time_percentage: number | null

  // Financial
  total_order_value: number | null
  delivered_order_value: number | null

  company_created_at: string | null
}

export interface DeliveryDetailed extends Delivery {
  company_name: string | null
  driver_name: string | null
  driver_code: string | null
  vehicle_type: VehicleType | null
  route_name: string | null
}

export interface DriverPerformance {
  driver_id: string | null
  company_id: string | null
  driver_name: string | null
  driver_code: string | null
  vehicle_type: VehicleType | null
  is_active: boolean | null
  is_available: boolean | null

  // Delivery stats
  total_assigned_deliveries: number | null
  completed_deliveries: number | null
  failed_deliveries: number | null
  in_progress_deliveries: number | null

  // Performance
  success_rate_percentage: number | null
  average_rating: number | null
  total_ratings: number | null
  on_time_deliveries: number | null

  // Current month
  current_month_deliveries: number | null

  // Routes
  total_routes: number | null
  average_efficiency_score: number | null

  driver_since: string | null
}

export interface RouteSummary extends Route {
  company_name: string | null
  driver_name: string | null
  pending_deliveries: number | null
  completion_percentage: number | null
}

// =====================================================
// TIPOS CON RELACIONES (para joins)
// =====================================================

export interface ProfileWithCompany extends Profile {
  company?: Company
}

export interface DriverWithProfile extends Driver {
  profile?: Profile
}

export interface DeliveryWithRelations extends Delivery {
  company?: Company
  driver?: Driver
  route?: Route
}

export interface RouteWithRelations extends Route {
  company?: Company
  driver?: Driver
  deliveries?: Delivery[]
}

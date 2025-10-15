// =====================================================
// API RESPONSE TYPES
// =====================================================

/**
 * Generic API response wrapper
 * @template T - Type of the data being returned
 */
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

/**
 * API error response
 */
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
  statusCode?: number
}

/**
 * Paginated API response
 * @template T - Type of items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Query parameters for pagination
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Filter parameters for deliveries
 */
export interface DeliveryFilters extends PaginationParams {
  status?: string[]
  priority?: string[]
  driver_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

/**
 * Filter parameters for routes
 */
export interface RouteFilters extends PaginationParams {
  status?: string[]
  driver_id?: string
  date_from?: string
  date_to?: string
  search?: string
}

/**
 * Filter parameters for drivers
 */
export interface DriverFilters extends PaginationParams {
  is_active?: boolean
  is_available?: boolean
  vehicle_type?: string[]
  search?: string
}

// =====================================================
// FILE UPLOAD TYPES
// =====================================================

/**
 * Response from file upload API
 */
export interface FileUploadResponse {
  file_id: string
  batch_id: string
  filename: string
  file_size_bytes: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

/**
 * File processing result
 */
export interface FileProcessingResult {
  batch_id: string
  rows_total: number
  rows_processed: number
  rows_failed: number
  errors?: Array<{
    row: number
    field: string
    message: string
  }>
}

// =====================================================
// ROUTE OPTIMIZATION TYPES
// =====================================================

/**
 * Request for route optimization
 */
export interface OptimizeRouteRequest {
  delivery_ids: string[]
  driver_id: string
  route_date: string
  start_location?: {
    address: string
    lat: number
    lng: number
  }
}

/**
 * Response from route optimization
 */
export interface OptimizeRouteResponse {
  route_id: string
  route_name: string
  total_deliveries: number
  total_distance_km: number
  estimated_duration_minutes: number
  optimization_score: number
  ordered_deliveries: Array<{
    delivery_id: string
    route_order: number
    estimated_arrival: string
  }>
}

// =====================================================
// DASHBOARD STATS TYPES
// =====================================================

/**
 * Dashboard overview statistics
 */
export interface DashboardStats {
  today: {
    total_deliveries: number
    completed: number
    in_transit: number
    pending: number
    failed: number
  }
  this_month: {
    total_deliveries: number
    total_distance_km: number
    average_rating: number
    on_time_percentage: number
  }
  active_routes: number
  available_drivers: number
}

/**
 * Driver dashboard statistics
 */
export interface DriverDashboardStats {
  today: {
    assigned_deliveries: number
    completed: number
    pending: number
  }
  current_route: {
    route_id: string | null
    route_name: string | null
    total_deliveries: number
    completed: number
    next_delivery: {
      id: string
      customer_name: string
      delivery_address: string
      estimated_arrival: string
    } | null
  } | null
  stats: {
    total_completed: number
    average_rating: number
    success_rate: number
  }
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

/**
 * Analytics data for charts
 */
export interface AnalyticsData {
  deliveries_over_time: TimeSeriesDataPoint[]
  deliveries_by_status: Array<{
    status: string
    count: number
    percentage: number
  }>
  top_drivers: Array<{
    driver_id: string
    driver_name: string
    total_deliveries: number
    success_rate: number
    average_rating: number
  }>
  performance_metrics: {
    average_optimization_score: number
    average_on_time_percentage: number
    average_customer_rating: number
    total_distance_km: number
  }
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

/**
 * Request to send notification
 */
export interface SendNotificationRequest {
  delivery_id?: string
  driver_id?: string
  type: 'whatsapp' | 'email' | 'sms' | 'push'
  recipient: string
  subject?: string
  message: string
  template?: string
  variables?: Record<string, string>
}

/**
 * Notification status update
 */
export interface NotificationStatusUpdate {
  notification_id: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  external_id?: string
  error_message?: string
}

// =====================================================
// AUTH TYPES
// =====================================================

/**
 * User session data
 */
export interface UserSession {
  user_id: string
  email: string
  role: 'admin' | 'company' | 'driver'
  company_id: string | null
  access_token: string
  refresh_token: string
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Registration data for company
 */
export interface CompanyRegistration {
  email: string
  password: string
  full_name: string
  phone: string
  company_name: string
  business_type?: string
}

/**
 * Registration data for driver
 */
export interface DriverRegistration {
  email: string
  password: string
  full_name: string
  phone: string
  company_id: string
  driver_code: string
  vehicle_type: 'bike' | 'motorcycle' | 'car' | 'van' | 'truck'
  license_plate?: string
}

// =====================================================
// SUBSCRIPTION & BILLING TYPES
// =====================================================

/**
 * Subscription plan details
 */
export interface SubscriptionPlan {
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
  name: string
  price_monthly: number
  price_yearly: number
  max_drivers: number
  max_deliveries_per_month: number
  features: string[]
}

/**
 * Subscription update request
 */
export interface UpdateSubscriptionRequest {
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
  billing_cycle: 'monthly' | 'yearly'
  payment_method_id?: string
}

/**
 * Invoice data
 */
export interface Invoice {
  id: string
  invoice_number: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  created_at: string
  due_date: string
  paid_at: string | null
  pdf_url: string | null
}

// =====================================================
// WEBHOOK TYPES
// =====================================================

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'delivery.created'
  | 'delivery.updated'
  | 'delivery.completed'
  | 'delivery.failed'
  | 'route.created'
  | 'route.started'
  | 'route.completed'
  | 'driver.location_updated'
  | 'notification.sent'
  | 'notification.delivered'

/**
 * Webhook payload
 */
export interface WebhookPayload<T = unknown> {
  event: WebhookEventType
  timestamp: string
  data: T
  company_id: string
}

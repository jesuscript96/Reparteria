export interface AdminStats {
  totals: {
    companies: number
    activeCompanies: number
    drivers: number
    deliveries: number
    routes: number
  }
  recent: {
    newCompaniesLast30Days: number
    deliveriesToday: number
  }
  deliveriesByStatus: {
    [key: string]: number
  }
}

export interface CompanyListItem {
  id: string
  company_name: string
  business_type: string | null
  plan_type: string
  is_active: boolean
  created_at: string
  total_drivers: number
  total_deliveries: number
}

export interface AdminCompanyDetails {
  id: string
  company_name: string
  business_type: string | null
  rfc: string | null
  website: string | null
  address: string | null
  lat: number | null
  lng: number | null
  plan_type: string
  max_drivers: number
  max_deliveries_per_month: number
  enable_whatsapp: boolean
  enable_email: boolean
  whatsapp_number: string | null
  is_active: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface AdminActivityLog {
  id: string
  company_id: string | null
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalDeliveries: number
  completedDeliveries: number
  avgDeliveryTime: number | null
  systemUptime: number
}

/**
 * StatCard Component
 *
 * Displays key metrics and statistics
 * Used in dashboard overviews
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className
}: StatCardProps) {
  const trendColor = trend && trend.value > 0 ? 'text-green-600' : 'text-red-600'
  const trendPrefix = trend && trend.value > 0 ? '+' : ''

  return (
    <Card className={cn('card', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-700">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-neutral-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-900">
          {value}
        </div>
        {description && (
          <p className="text-caption mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={cn('text-xs font-medium', trendColor)}>
              {trendPrefix}{trend.value}%
            </span>
            <span className="text-caption">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

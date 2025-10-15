/**
 * StatusBadge Component
 *
 * Displays delivery status with semantic colors
 * Based on design system tokens
 */

import { cn } from '@/lib/utils'

export type DeliveryStatus = 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'canceled'

interface StatusBadgeProps {
  status: DeliveryStatus
  className?: string
}

const statusConfig: Record<DeliveryStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'badge-pending',
  },
  'in-transit': {
    label: 'En Tránsito',
    className: 'badge-in-transit',
  },
  delivered: {
    label: 'Entregado',
    className: 'badge-delivered',
  },
  delayed: {
    label: 'Retrasado',
    className: 'badge-delayed',
  },
  canceled: {
    label: 'Cancelado',
    className: 'badge-canceled',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={cn('badge', config.className, className)}>
      <span
        className="w-1.5 h-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}

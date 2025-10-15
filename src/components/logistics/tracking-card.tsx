/**
 * TrackingCard Component
 *
 * Displays delivery tracking information with timeline
 * Shows delivery ID, status, customer info, and progress
 */

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge, DeliveryStatus } from './status-badge'
import { Package, MapPin, Calendar } from 'lucide-react'

interface TrackingEvent {
  timestamp: string
  description: string
  location?: string
  isCompleted: boolean
}

interface TrackingCardProps {
  deliveryId: string
  status: DeliveryStatus
  customerName: string
  customerAddress: string
  estimatedDelivery?: string
  events?: TrackingEvent[]
  className?: string
  onClick?: () => void
}

export function TrackingCard({
  deliveryId,
  status,
  customerName,
  customerAddress,
  estimatedDelivery,
  events = [],
  className,
  onClick,
}: TrackingCardProps) {
  const isInteractive = !!onClick

  return (
    <Card
      className={cn(
        'card animate-fade-in',
        isInteractive && 'card-interactive',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-4 border-b border-neutral-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Package className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-mono text-sm font-semibold text-neutral-900">
                #{deliveryId}
              </p>
              <p className="text-caption mt-0.5">
                {customerName}
              </p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Customer Address */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
          <p className="text-body-sm text-neutral-700">
            {customerAddress}
          </p>
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-500 flex-shrink-0" />
            <p className="text-body-sm text-neutral-700">
              Entrega estimada: <span className="font-medium">{estimatedDelivery}</span>
            </p>
          </div>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <div className="mt-6">
            <p className="text-label text-neutral-700 mb-4">
              Historial
            </p>
            <div className="relative pl-6">
              {/* Timeline line */}
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-neutral-200" />

              {/* Timeline events */}
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute -left-6 top-1 w-4 h-4 rounded-full border-3 bg-white z-10',
                        event.isCompleted
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-300'
                      )}
                    />

                    {/* Event content */}
                    <div className="space-y-1">
                      <p className="text-body-sm font-medium text-neutral-900">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-caption">
                        <span>{event.timestamp}</span>
                        {event.location && (
                          <>
                            <span className="text-neutral-400">•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

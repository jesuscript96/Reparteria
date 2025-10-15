/**
 * EmptyState Component
 *
 * Displays when there's no data to show
 * Provides helpful messaging and optional action button
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 p-3 rounded-full bg-neutral-100">
          <Icon className="h-8 w-8 text-neutral-500" />
        </div>
      )}
      <h3 className="text-heading-3 text-neutral-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-body-sm text-neutral-600 max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

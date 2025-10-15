import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'text-blue-600',
        white: 'text-white',
        black: 'text-black',
        muted: 'text-gray-400',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
  label?: string
}

/**
 * Loading Spinner Component
 *
 * A customizable spinner for loading states
 *
 * @param size - Size of the spinner (sm, md, lg, xl)
 * @param variant - Color variant (default, white, black, muted)
 * @param className - Additional CSS classes
 * @param label - Optional accessible label
 */
export function LoadingSpinner({
  size,
  variant,
  className,
  label = 'Loading...'
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * Full Page Loading Spinner
 *
 * Centered spinner that covers the entire viewport
 */
export function FullPageSpinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="xl" />
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  )
}

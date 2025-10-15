import { cn } from '@/lib/utils'
import { Truck } from 'lucide-react'
import Link from 'next/link'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
}

const sizeClasses = {
  sm: {
    icon: 'h-6 w-6',
    text: 'text-lg',
  },
  md: {
    icon: 'h-8 w-8',
    text: 'text-xl',
  },
  lg: {
    icon: 'h-10 w-10',
    text: 'text-2xl',
  },
}

/**
 * Logo Component
 *
 * Displays the app logo with optional link
 *
 * @param variant - Display variant (full: icon + text, icon: icon only)
 * @param size - Size of the logo (sm, md, lg)
 * @param className - Additional CSS classes
 * @param href - Optional link URL (default: '/')
 */
export function Logo({
  variant = 'full',
  size = 'md',
  className,
  href = '/',
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Truck className={cn('text-blue-600', sizeClasses[size].icon)} />
      </div>
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-bold text-gray-900', sizeClasses[size].text)}>
            RutasDelivery
          </span>
          <span className="text-xs text-gray-500">Optimización de entregas</span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    )
  }

  return content
}

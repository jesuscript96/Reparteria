/**
 * DataTable Component
 *
 * Enhanced table for logistics data
 * Features: sticky header, zebra striping, hover states, responsive
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {
  const isInteractive = !!onRowClick

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="text-body">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-neutral-200 overflow-hidden', className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead className="bg-neutral-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-label text-neutral-700 border-b border-neutral-200',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-neutral-200 last:border-0',
                  'even:bg-neutral-50',
                  isInteractive && 'cursor-pointer hover:bg-primary-50 transition-colors duration-150'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-4 text-body-sm text-neutral-900',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.className
                    )}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

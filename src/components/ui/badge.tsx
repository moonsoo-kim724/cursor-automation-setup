import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
        destructive: 'border-transparent bg-error-500 text-white hover:bg-error-600',
        outline: 'text-neutral-900 border-neutral-300',
        success: 'border-transparent bg-brand-secondary-100 text-brand-secondary-800',
        warning: 'border-transparent bg-warning-100 text-warning-800',
        // 의료 전문 배지
        medical: 'border-transparent bg-brand-primary-100 text-brand-primary-800',
        certification: 'border-brand-primary-200 bg-brand-primary-50 text-brand-primary-700',
        award: 'border-warning-200 bg-warning-50 text-warning-700',
        experience: 'border-brand-secondary-200 bg-brand-secondary-50 text-brand-secondary-700',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        lg: 'px-3 py-1 text-sm rounded-lg',
        xl: 'px-4 py-2 text-base rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants } 
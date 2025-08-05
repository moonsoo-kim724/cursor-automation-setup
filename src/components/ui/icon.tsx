import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const iconVariants = cva(
  'flex-shrink-0',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
        '3xl': 'h-12 w-12',
      },
      color: {
        default: 'text-neutral-600',
        primary: 'text-brand-primary-600',
        secondary: 'text-brand-secondary-600',
        accent: 'text-brand-accent-600',
        success: 'text-success-500',
        warning: 'text-warning-500',
        error: 'text-error-500',
        muted: 'text-neutral-400',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
    },
  }
)

export interface IconProps
  extends Omit<React.SVGAttributes<SVGElement>, 'color'>,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, color, icon: IconComponent, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(iconVariants({ size, color, className }))}
        {...props}
      />
    )
  }
)
Icon.displayName = 'Icon'

export { Icon, iconVariants } 
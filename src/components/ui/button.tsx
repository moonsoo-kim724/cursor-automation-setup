import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Medical Primary - Professional Blue (#0054A6)
        default: 'bg-brand-primary-700 text-white hover:bg-brand-primary-800 focus-visible:ring-brand-primary-200 shadow-medium hover:shadow-large border-0',
        // Medical Secondary - Light Blue
        secondary: 'bg-brand-secondary-100 text-brand-primary-700 hover:bg-brand-secondary-200 focus-visible:ring-brand-secondary-200 border border-brand-secondary-300 hover:border-brand-primary-300',
        // Medical Success - Healthcare Green
        success: 'bg-brand-success-600 text-white hover:bg-brand-success-700 focus-visible:ring-brand-success-200 shadow-medium hover:shadow-large',
        // Medical Accent - Healthcare Teal
        accent: 'bg-brand-accent-500 text-white hover:bg-brand-accent-600 focus-visible:ring-brand-accent-200 shadow-medium hover:shadow-large',
        // Medical Destructive
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200 shadow-medium hover:shadow-large',
        // Medical Outline - Professional
        outline: 'border-2 border-brand-primary-300 bg-white text-brand-primary-700 hover:bg-brand-primary-50 hover:border-brand-primary-500 focus-visible:ring-brand-primary-200',
        // Medical Ghost - Subtle
        ghost: 'text-brand-trust-700 hover:bg-brand-secondary-100 hover:text-brand-primary-700 focus-visible:ring-brand-secondary-200',
        // Medical Link
        link: 'text-brand-primary-700 underline-offset-4 hover:underline hover:text-brand-primary-800 focus-visible:ring-brand-primary-200 p-0 h-auto',
        // Medical Trust - Deep Navy
        trust: 'bg-brand-trust-700 text-white hover:bg-brand-trust-800 focus-visible:ring-brand-trust-200 shadow-trust hover:shadow-large',
      },
      size: {
        sm: 'h-9 px-3 text-xs rounded-lg',
        default: 'h-11 px-4 py-2 text-sm rounded-xl',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl font-bold',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onDragLeave' | 'onDragEnter' | 'onDragOver' | 'onDrop'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        {...(props as any)}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, HTMLMotionProps } from 'framer-motion'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        // 브랜드 프라이머리 버튼
        default: 'bg-brand-primary-600 text-white hover:bg-brand-primary-700 focus-visible:ring-brand-primary-500 shadow-soft hover:shadow-medium',
        // 그린 액션 버튼 (예약, 상담)
        success: 'bg-brand-secondary-600 text-white hover:bg-brand-secondary-700 focus-visible:ring-brand-secondary-500 shadow-soft hover:shadow-medium',
        // 위험/취소 버튼
        destructive: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-soft hover:shadow-medium',
        // 아웃라인 버튼
        outline: 'border border-brand-primary-300 bg-white text-brand-primary-700 hover:bg-brand-primary-50 focus-visible:ring-brand-primary-500',
        // 서브 버튼
        secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus-visible:ring-neutral-500',
        // 고스트 버튼
        ghost: 'text-brand-primary-600 hover:bg-brand-primary-50 focus-visible:ring-brand-primary-500',
        // 링크 스타일
        link: 'text-brand-primary-600 underline-offset-4 hover:underline focus-visible:ring-brand-primary-500',
        // 액센트 버튼 (AI 기능)
        accent: 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 focus-visible:ring-brand-accent-500 shadow-soft hover:shadow-medium',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
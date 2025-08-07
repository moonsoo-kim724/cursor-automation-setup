import * as React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border bg-white text-gray-900 transition-all duration-200',
  {
    variants: {
      variant: {
        // Vercel 스타일 기본 카드
        default: 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300',
        // 강조된 카드
        elevated: 'border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300',
        // 브랜드 카드 (블랙 테마)
        brand: 'border-gray-300 bg-gray-50/50 hover:bg-gray-50',
        // 성공/액션 카드 (그린 테마)
        success: 'border-green-200 bg-green-50/50 hover:bg-green-50',
        // 경고 카드
        warning: 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50',
        // 에러 카드
        error: 'border-red-200 bg-red-50/50 hover:bg-red-50',
        // 고스트 카드
        ghost: 'border-transparent bg-transparent shadow-none hover:bg-gray-50',
        // 아웃라인 강조
        outline: 'border-2 border-gray-200 shadow-none hover:border-gray-300',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, children, ...props }, ref) => {
    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={cn(cardVariants({ variant, size, className }))}
          whileHover={{ y: -1, scale: 1.005 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      )
    }
    
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-tight tracking-tight text-gray-900',
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants } 
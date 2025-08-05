'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button } from './button'

const modalVariants = cva(
  'relative bg-white rounded-xl shadow-large border border-neutral-200 mx-auto max-h-[90vh] overflow-auto',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full',
        default: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        '3xl': 'max-w-3xl w-full',
        '4xl': 'max-w-4xl w-full',
        full: 'max-w-none w-[95vw]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}) => {
  React.useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(modalVariants({ size }), className)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
          >
            {/* Close Button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Header */}
            {(title || description) && (
              <div className="px-6 pt-6 pb-4">
                {title && (
                  <h2 
                    id="modal-title" 
                    className="text-xl font-semibold text-neutral-900 pr-8"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p 
                    id="modal-description" 
                    className="mt-2 text-sm text-neutral-600"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'px-6',
              (title || description) ? 'pb-6' : 'py-6'
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Modal 하위 컴포넌트들
const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('px-6 pt-6 pb-4', className)}>
    {children}
  </div>
)

const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <h2 className={cn('text-xl font-semibold text-neutral-900 pr-8', className)}>
    {children}
  </h2>
)

const ModalDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <p className={cn('mt-2 text-sm text-neutral-600', className)}>
    {children}
  </p>
)

const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('px-6 pb-6', className)}>
    {children}
  </div>
)

const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn('px-6 pb-6 pt-4 flex justify-end space-x-2 border-t border-neutral-200', className)}>
    {children}
  </div>
)

// 편의 함수들
const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const openModal = React.useCallback(() => setIsOpen(true), [])
  const closeModal = React.useCallback(() => setIsOpen(false), [])
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), [])
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  }
}

export { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalContent, 
  ModalFooter, 
  useModal,
  modalVariants
} 
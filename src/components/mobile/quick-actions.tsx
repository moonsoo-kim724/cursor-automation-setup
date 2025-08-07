'use client'

import { Button } from '@/components/ui/button'
import { getTouchOptimizedClasses, useTouchOptimized } from '@/hooks/use-touch-optimized'
import { motion } from 'framer-motion'
import { Calendar, MapPin, MessageCircle, Phone } from 'lucide-react'

interface QuickActionsProps {
  onChatbotOpen: () => void
  onLeadbotOpen: () => void
}

export function QuickActions({ onChatbotOpen, onLeadbotOpen }: QuickActionsProps) {
  const { isTouchDevice } = useTouchOptimized()

  const actions = [
    {
      icon: MessageCircle,
      label: 'AI상담',
      action: onChatbotOpen,
      color: 'bg-brand-secondary-600 hover:bg-brand-secondary-700',
      textColor: 'text-white'
    },
    {
      icon: Calendar,
      label: '예약',
      action: onLeadbotOpen,
      color: 'bg-brand-accent-600 hover:bg-brand-accent-700',
      textColor: 'text-white'
    },
    {
      icon: Phone,
      label: '전화',
      action: () => window.open('tel:1544-7260'),
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      icon: MapPin,
      label: '위치',
      action: () => {
        const locationSection = document.getElementById('location')
        if (locationSection) {
          locationSection.scrollIntoView({ behavior: 'smooth' })
        }
      },
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-white'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-neutral-200 shadow-xl p-4">
        <div className="grid grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
            >
              <Button
                onClick={action.action}
                variant="ghost"
                size="sm"
                className={`
                  flex flex-col items-center gap-2 h-auto py-3 px-2
                  ${action.color} ${action.textColor}
                  rounded-xl shadow-sm transition-all duration-200
                  hover:shadow-md hover:scale-105 active:scale-95
                  ${getTouchOptimizedClasses(isTouchDevice, 'large')}
                `}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

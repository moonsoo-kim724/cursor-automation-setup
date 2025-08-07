'use client'

import { Button } from '@/components/ui/button'
import { getTouchOptimizedClasses, useTouchOptimized } from '@/hooks/use-touch-optimized'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Calendar,
    HelpCircle,
    Home,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface MobileMenuProps {
  onChatbotOpen: () => void
  onLeadbotOpen: () => void
}

export function MobileMenu({ onChatbotOpen, onLeadbotOpen }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isTouchDevice } = useTouchOptimized()

  // 메뉴가 열려있을 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems = [
    {
      icon: Home,
      label: '홈',
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setIsOpen(false)
      }
    },
    {
      icon: MessageCircle,
      label: 'AI 상담',
      action: () => {
        onChatbotOpen()
        setIsOpen(false)
      }
    },
    {
      icon: Calendar,
      label: '예약하기',
      action: () => {
        onLeadbotOpen()
        setIsOpen(false)
      }
    },
    {
      icon: HelpCircle,
      label: 'FAQ',
      action: () => {
        const faqSection = document.getElementById('faq')
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth' })
        }
        setIsOpen(false)
      }
    },
    {
      icon: MapPin,
      label: '위치안내',
      action: () => {
        const locationSection = document.getElementById('location')
        if (locationSection) {
          locationSection.scrollIntoView({ behavior: 'smooth' })
        }
        setIsOpen(false)
      }
    },
    {
      icon: Phone,
      label: '전화상담',
      action: () => {
        window.open('tel:1544-7260')
        setIsOpen(false)
      }
    }
  ]

  return (
    <>
      {/* 햄버거 메뉴 버튼 */}
      <motion.div
        className="fixed top-4 right-4 z-50 md:hidden"
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className={`
            bg-white/90 backdrop-blur-sm border-brand-secondary-200
            shadow-lg hover:bg-brand-secondary-50
            ${getTouchOptimizedClasses(isTouchDevice, 'medium')}
          `}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-brand-secondary-600" />
          ) : (
            <Menu className="h-5 w-5 text-brand-secondary-600" />
          )}
        </Button>
      </motion.div>

      {/* 모바일 메뉴 오버레이 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* 메뉴 패널 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              {/* 헤더 */}
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">
                      연수김안과의원
                    </h2>
                    <p className="text-sm text-neutral-600">
                      30년의 신뢰, AI로 미래를 열다
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className={getTouchOptimizedClasses(isTouchDevice, 'medium')}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* 메뉴 아이템들 */}
              <div className="py-6">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={item.action}
                    className={`
                      w-full flex items-center gap-4 px-6 py-4
                      text-left hover:bg-brand-secondary-50
                      transition-colors duration-200
                      ${getTouchOptimizedClasses(isTouchDevice, 'medium')}
                    `}
                  >
                    <item.icon className="h-5 w-5 text-brand-secondary-600" />
                    <span className="text-neutral-900 font-medium">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* 하단 정보 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-neutral-100 bg-neutral-50">
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-2">
                    진료 문의
                  </p>
                  <a
                    href="tel:1544-7260"
                    className={`
                      inline-flex items-center gap-2 px-4 py-2
                      bg-brand-secondary-600 text-white rounded-lg
                      hover:bg-brand-secondary-700 transition-colors
                      ${getTouchOptimizedClasses(isTouchDevice, 'medium')}
                    `}
                  >
                    <Phone className="h-4 w-4" />
                    1544-7260
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

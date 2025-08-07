'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // PWA 설치 가능 여부 확인
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // 사용자가 이전에 설치 프롬프트를 거부했는지 확인
      const installDismissed = localStorage.getItem('pwa-install-dismissed')
      const installDismissedTime = localStorage.getItem('pwa-install-dismissed-time')

      if (!installDismissed || (installDismissedTime &&
          Date.now() - parseInt(installDismissedTime) > 7 * 24 * 60 * 60 * 1000)) { // 7일 후 다시 표시
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 10000) // 10초 후 표시
      }
    }

    // PWA가 이미 설치되었는지 확인
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // 이미 설치되었는지 확인
    if (localStorage.getItem('pwa-installed') === 'true' ||
        window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setShowInstallPrompt(false)
      localStorage.removeItem('pwa-install-dismissed')
    } else {
      console.log('User dismissed the install prompt')
      handleDismiss()
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
  }

  if (isInstalled || !showInstallPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="border-brand-secondary-200 bg-white shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-secondary-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-brand-secondary-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-neutral-900">
                      앱으로 설치하기
                    </CardTitle>
                    <CardDescription className="text-xs text-neutral-600">
                      더 빠르고 편리한 이용을 위해
                    </CardDescription>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="설치 프롬프트 닫기"
                >
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-3">
                <div className="text-xs text-neutral-600">
                  • 홈 화면에서 바로 접속<br />
                  • 오프라인에서도 기본 기능 사용<br />
                  • 빠른 로딩 속도
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 bg-brand-secondary-600 hover:bg-brand-secondary-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    설치하기
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="text-neutral-600 border-neutral-200"
                  >
                    나중에
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

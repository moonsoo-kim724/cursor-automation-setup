'use client'

import { useEffect, useState } from 'react'

export function useTouchOptimized() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    // 터치 디바이스 감지
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    // 화면 방향 감지
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    checkTouchDevice()
    checkOrientation()

    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return { isTouchDevice, isLandscape }
}

// 터치 영역 최적화를 위한 최소 크기 상수
export const TOUCH_TARGET_SIZE = {
  minimum: 44, // iOS 권장 최소 크기
  comfortable: 48, // 편안한 터치 크기
  large: 56 // 큰 터치 크기
}

// 모바일 최적화 클래스 생성 헬퍼
export function getTouchOptimizedClasses(isTouchDevice: boolean, size: 'small' | 'medium' | 'large' = 'medium') {
  if (!isTouchDevice) return ''

  const sizeMap = {
    small: 'min-h-[44px] min-w-[44px]',
    medium: 'min-h-[48px] min-w-[48px]',
    large: 'min-h-[56px] min-w-[56px]'
  }

  return `${sizeMap[size]} touch-manipulation select-none`
}

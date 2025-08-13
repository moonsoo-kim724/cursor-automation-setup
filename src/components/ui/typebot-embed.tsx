'use client'

import { useEffect } from 'react'

interface TypebotEmbedProps {
  typebotId: string
  className?: string
  theme?: {
    button?: { backgroundColor?: string }
    chatWindow?: { backgroundColor?: string }
  }
}

export function TypebotEmbed({
  typebotId,
  className = '',
  theme = {
    button: { backgroundColor: '#10b981' },
    chatWindow: { backgroundColor: '#ffffff' }
  }
}: TypebotEmbedProps) {
  useEffect(() => {
    // 타입봇 스크립트 로드
    const script = document.createElement('script')
    script.src = 'https://typebot.io/js/typebot.js'
    script.async = true
    script.id = 'typebot-script'

    // 이미 스크립트가 로드되어 있는지 확인
    if (!document.getElementById('typebot-script')) {
      document.head.appendChild(script)
    }

    script.onload = () => {
      // @ts-ignore - Typebot 글로벌 객체
      if (window.Typebot) {
        // @ts-ignore
        window.Typebot.initBubble({
          typebot: typebotId,
          theme: {
            button: theme.button,
            chatWindow: theme.chatWindow,
            previewMessage: {
              message: "안녕하세요! 눈콩이입니다 👋",
              autoShowDelay: 5000
            }
          },
          onOpen: () => {
            console.log('Typebot opened')
          },
          onClose: () => {
            console.log('Typebot closed')
          }
        })
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      // @ts-ignore
      if (window.Typebot && window.Typebot.close) {
        // @ts-ignore
        window.Typebot.close()
      }
    }
  }, [typebotId, theme])

  return (
    <div className={`typebot-container ${className}`}>
      {/* 타입봇 버블은 자동으로 생성됩니다 */}
    </div>
  )
}

// 타입봇 표준 임베드 컴포넌트
export function TypebotStandard({
  typebotId,
  className = "w-full h-96"
}: {
  typebotId: string
  className?: string
}) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://typebot.io/js/typebot.js'
    script.async = true
    script.id = 'typebot-standard-script'

    if (!document.getElementById('typebot-standard-script')) {
      document.head.appendChild(script)
    }

    script.onload = () => {
      // @ts-ignore
      if (window.Typebot) {
        // @ts-ignore
        window.Typebot.initStandard({
          typebot: typebotId,
          apiHost: 'https://typebot.io'
        })
      }
    }
  }, [typebotId])

  return (
    <div
      id="typebot-standard"
      className={className}
      style={{
        minHeight: '400px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  )
}

// 전역 Typebot 타입 선언
declare global {
  interface Window {
    Typebot: {
      initBubble: (config: any) => void
      initStandard: (config: any) => void
      close: () => void
    }
  }
}

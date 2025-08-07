import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '연수김안과의원 - 30년의 신뢰, AI로 미래를 열다',
    short_name: '연수김안과',
    description: '인천 송도 연수김안과의원은 30년 전문 경력의 안과 수술 전문 병원입니다. AI 기반 디지털 헬스케어와 다국어 진료로 프리미엄 안과 서비스를 제공합니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0054A6',
    orientation: 'portrait-primary',
    categories: ['medical', 'health', 'business'],
    lang: 'ko',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/desktop-screenshot.png',
        sizes: '1280x720',
        type: 'image/png'
      },
      {
        src: '/screenshots/mobile-screenshot.png',
        sizes: '390x844',
        type: 'image/png'
      }
    ],
    shortcuts: [
      {
        name: 'AI 상담',
        short_name: 'AI상담',
        description: 'AI 챗봇과 즉시 상담하기',
        url: '/?chat=true',
        icons: [{ src: '/icons/chat-icon.png', sizes: '96x96' }]
      },
      {
        name: '예약하기',
        short_name: '예약',
        description: '온라인 검진 예약',
        url: '/?booking=true',
        icons: [{ src: '/icons/calendar-icon.png', sizes: '96x96' }]
      },
      {
        name: '위치안내',
        short_name: '위치',
        description: '병원 위치 및 교통편',
        url: '/?location=true',
        icons: [{ src: '/icons/location-icon.png', sizes: '96x96' }]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  }
}

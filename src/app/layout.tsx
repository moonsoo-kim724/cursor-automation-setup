import { InstallPrompt } from '@/components/pwa/install-prompt'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

// 한글 최적화 폰트 - 성능 최적화
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: true,
  fallback: [
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    '맑은 고딕',
    'sans-serif'
  ],
  adjustFontFallback: true,
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: {
    default: '연수김안과의원 - 30년의 신뢰, AI로 미래를 열다',
    template: '%s | 연수김안과의원'
  },
  description: '인천 송도 연수김안과의원은 30년 전문 경력의 안과 수술 전문 병원입니다. AI 기반 디지털 헬스케어와 다국어 진료로 프리미엄 안과 서비스를 제공합니다.',
  keywords: [
    '연수김안과의원', '인천 송도 안과', '안과 전문의', '시력교정술', 'LASIK', 'LASEK',
    '백내장 수술', '노안 교정', '망막 질환', '녹내장', 'AI 안과 진료',
    '외국인 친화 병원', '다국어 진료', '송도 신도시', '의료 관광'
  ],
  authors: [{ name: '연수김안과의원' }],
  creator: '연수김안과의원',
  publisher: '연수김안과의원',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ysk-eye.clinic'),
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/',
      'en-US': '/en',
      'zh-CN': '/zh',
    },
  },
  openGraph: {
    title: '연수김안과의원 - 30년의 신뢰, AI로 미래를 열다',
    description: '인천 송도 소재 30년 전문 경력의 안과 수술 전문 병원. AI 기반 디지털 헬스케어 서비스 제공.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '연수김안과의원',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '연수김안과의원 - 30년의 신뢰, AI로 미래를 열다',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '연수김안과의원 - 30년의 신뢰, AI로 미래를 열다',
    description: '인천 송도 소재 30년 전문 경력의 안과 수술 전문 병원',
    images: ['/og-image.jpg'],
    creator: '@ysk_eye_clinic',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      'naver-site-verification': 'your-naver-verification-code',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0054A6' },
    { media: '(prefers-color-scheme: dark)', color: '#0054A6' }
  ],
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${notoSansKR.variable} ${inter.variable} font-sans antialiased bg-white text-neutral-900`}>
        {/* Skip Navigation Links for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-4 py-2 rounded z-50 focus:z-[9999] transition-all duration-200 font-medium"
        >
          주요 내용으로 건너뛰기
        </a>
        <a
          href="#navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-40 bg-black text-white px-4 py-2 rounded z-50 focus:z-[9999] transition-all duration-200 font-medium"
        >
          내비게이션으로 건너뛰기
        </a>
        <main id="main-content">
          {children}
        </main>
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  )
}

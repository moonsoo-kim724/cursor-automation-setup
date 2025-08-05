import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

// 한글 최적화 폰트
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-pretendard',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className={`${notoSansKR.variable} ${inter.variable} font-sans antialiased bg-white text-neutral-900`}>
        {children}
      </body>
    </html>
  )
} 
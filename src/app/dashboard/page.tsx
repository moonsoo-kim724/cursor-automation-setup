import Dashboard from '@/components/ui/dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '2RU4 프로젝트 대시보드 - 연수김안과의원',
  description: '연수김안과의원 AI 랜딩페이지 실시간 모니터링 대시보드',
  robots: 'noindex, nofollow', // 대시보드는 검색엔진에 노출하지 않음
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <Dashboard />
    </div>
  )
}
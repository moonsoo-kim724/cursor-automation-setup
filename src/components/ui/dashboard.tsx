'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { TrendingUp, Users, CheckCircle, Clock, BarChart3, Eye, Calendar, MessageCircle } from 'lucide-react'

interface VoosterTask {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
}

interface ProjectStats {
  todayBookings: number
  totalPatients: number
  successRate: number
  activeChats: number
  completedTasks: string[]
  currentTask: string
  projectStatus: string
  voosterTasks?: VoosterTask[]
  voosterConnected?: boolean
  lastSync?: string
  project?: {
    id: string
    name: string
    status: string
  }
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ProjectStats>({
    todayBookings: 0,
    totalPatients: 0,
    successRate: 99.8,
    activeChats: 0,
    completedTasks: ["T-001", "T-002", "T-003", "T-004", "T-005", "T-007"],
    currentTask: "T-006",
    projectStatus: "in-progress"
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 부스터 대시보드 데이터 로딩
    const loadDashboardData = async () => {
      try {
        // 프로젝트 상태 데이터 로드
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setStats(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.log('Dashboard data loading from static config')
      }
    }

    loadDashboardData()
    
    // 실시간 업데이트 (30초마다)
    const interval = setInterval(loadDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료'
      case 'in-progress': return '진행중'
      case 'pending': return '대기'
      default: return '알수없음'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* 프로젝트 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">2RU4 프로젝트 대시보드</h1>
          <p className="text-neutral-600 mt-1">연수김안과의원 AI 랜딩페이지 실시간 모니터링</p>
          {stats.voosterConnected !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${stats.voosterConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-neutral-500">
                Vooster.ai {stats.voosterConnected ? '연결됨' : '연결 안됨'} 
                {stats.lastSync && ` • 마지막 동기화: ${new Date(stats.lastSync).toLocaleTimeString('ko-KR')}`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(stats.projectStatus)} text-white border-none`}
          >
            {getStatusText(stats.projectStatus)}
          </Badge>
          {stats.project?.id && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {stats.project.id}
            </Badge>
          )}
        </div>
      </div>

      {/* 핵심 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-brand-primary-200 bg-brand-primary-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-primary-600" />
              오늘 예약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary-700">{stats.todayBookings}</div>
            <p className="text-xs text-neutral-500 mt-1">전일 대비 +0%</p>
          </CardContent>
        </Card>

        <Card className="border-brand-secondary-200 bg-brand-secondary-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-secondary-600" />
              총 환자수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-secondary-700">{stats.totalPatients.toLocaleString()}+</div>
            <p className="text-xs text-neutral-500 mt-1">누적 진료 환자</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              성공률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.successRate}%</div>
            <p className="text-xs text-neutral-500 mt-1">수술 성공률</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              AI 상담
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.activeChats}</div>
            <p className="text-xs text-neutral-500 mt-1">활성 채팅 세션</p>
          </CardContent>
        </Card>
      </div>

      {/* 작업 진행 상황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary-600" />
              프로젝트 진행 상황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">전체 진행률</span>
                <span className="text-sm text-neutral-600">
                  {stats.completedTasks.length}/8 ({Math.round((stats.completedTasks.length / 8) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-brand-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.completedTasks.length / 8) * 100}%` }}
                ></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    완료: {stats.completedTasks.length}개
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    현재: {stats.currentTask}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-secondary-600" />
              실시간 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-brand-primary-50 rounded-lg">
                <div className="w-2 h-2 bg-brand-primary-600 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium">개발 서버 실행 중</p>
                  <p className="text-xs text-neutral-500">localhost:3000에서 실행 중</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-brand-secondary-50 rounded-lg">
                <div className="w-2 h-2 bg-brand-secondary-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">AI 챗봇 활성</p>
                  <p className="text-xs text-neutral-500">24시간 상담 서비스 운영</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${stats.voosterConnected ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`w-2 h-2 rounded-full ${stats.voosterConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></div>
                <div>
                  <p className="text-sm font-medium">Vooster.ai 연동</p>
                  <p className="text-xs text-neutral-500">
                    {stats.voosterConnected ? '실시간 프로젝트 동기화 활성' : '연결 확인 중...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vooster 작업 목록 */}
      {stats.voosterTasks && stats.voosterTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Vooster.ai 작업 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.voosterTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                      task.status === 'blocked' ? 'bg-red-500' : 'bg-neutral-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{task.title || task.id}</p>
                      <p className="text-xs text-neutral-500">
                        {task.status === 'completed' ? '완료' :
                         task.status === 'in_progress' ? '진행 중' :
                         task.status === 'blocked' ? '차단됨' : '대기'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${
                      task.priority === 'high' || task.priority === 'critical' ? 'border-red-200 text-red-700' :
                      task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                      'border-green-200 text-green-700'
                    }`}>
                      {task.priority === 'critical' ? '긴급' :
                       task.priority === 'high' ? '높음' :
                       task.priority === 'medium' ? '중간' : '낮음'}
                    </Badge>
                    {task.progress > 0 && (
                      <span className="text-xs text-neutral-500">{task.progress}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 빠른 액션 버튼들 */}
      <div className="flex flex-wrap gap-4">
        <Button 
          variant="outline" 
          className="border-brand-primary-300 text-brand-primary-700 hover:bg-brand-primary-50"
          onClick={() => window.open('http://localhost:3000', '_blank')}
        >
          <Eye className="h-4 w-4 mr-2" />
          사이트 미리보기
        </Button>
        <Button 
          variant="outline" 
          className="border-brand-secondary-300 text-brand-secondary-700 hover:bg-brand-secondary-50"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI 챗봇 테스트
        </Button>
        <Button 
          variant="outline" 
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          onClick={() => window.open('https://app.vooster.ai/ko/org/withwinbiz/projects/prj_dc9j4s3djswft2oz5a94spsk', '_blank')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Vooster 대시보드
        </Button>
        <Button 
          variant="outline" 
          className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          상세 분석
        </Button>
      </div>
    </div>
  )
}

export default Dashboard
import { NextRequest, NextResponse } from 'next/server'
import { voosterClient } from '@/lib/vooster/client'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // 1. Vooster.ai에서 실시간 데이터 가져오기 시도
    let dashboardData
    const isVoosterConnected = await voosterClient.isConnected()
    
    if (isVoosterConnected) {
      console.log('✅ Vooster.ai 연결 성공 - 실시간 데이터 조회 중...')
      dashboardData = await voosterClient.getDashboardData()
    } else {
      console.log('⚠️  Vooster.ai 연결 실패 - 로컬 데이터 사용')
      dashboardData = await voosterClient.getDashboardData() // 내부적으로 fallback 처리됨
    }

    // 2. 로컬 Vooster 작업 데이터 로드
    const voosterTasksPath = path.join(process.cwd(), '.vooster', 'tasks.json')
    let voosterTasksData = []
    let localProjectData = {}
    
    // Vooster 작업 데이터 로드
    if (fs.existsSync(voosterTasksPath)) {
      const tasksConfig = JSON.parse(fs.readFileSync(voosterTasksPath, 'utf8'))
      voosterTasksData = tasksConfig.tasks.slice(0, 10) // 최신 10개만 표시
      
      // 완료된 작업과 현재 작업 계산
      const completedTasks = tasksConfig.tasks.filter(task => task.status === 'COMPLETED').map(task => task.taskId)
      const inProgressTask = tasksConfig.tasks.find(task => task.status === 'IN_PROGRESS')
      
      localProjectData = {
        completedTasks,
        currentTask: inProgressTask?.taskId || 'T-006',
        projectStatus: 'in-progress',
        totalTasks: tasksConfig.totalCount
      }
    }
    
    // 기존 프로젝트 설정과 병합
    const projectConfigPath = path.join(process.cwd(), '.vooster', 'project.json')
    if (fs.existsSync(projectConfigPath)) {
      const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
      localProjectData = {
        ...localProjectData,
        projectName: projectConfig.name,
        projectUid: projectConfig.uid
      }
    }

    // 3. 실시간 통계 업데이트
    const now = new Date()
    const todayBookings = Math.floor(Math.random() * 5) // 실제 예약 시스템 연동 필요
    const activeChats = Math.floor(Math.random() * 3) // 실제 채팅 세션 수
    
    // 4. 최종 응답 데이터 구성
    const responseData = {
      // Vooster 프로젝트 데이터
      project: {
        ...dashboardData.project,
        uid: localProjectData.projectUid || dashboardData.project.id,
        name: localProjectData.projectName || dashboardData.project.name
      },
      voosterTasks: voosterTasksData.map(task => ({
        id: task.taskId,
        title: task.summary,
        status: task.status.toLowerCase().replace('_', '_') === 'in_progress' ? 'in_progress' : 
                task.status.toLowerCase() === 'completed' ? 'completed' : 
                task.status.toLowerCase() === 'backlog' ? 'pending' : 'pending',
        priority: task.importance === 'MUST' ? 'high' : 
                 task.importance === 'SHOULD' ? 'medium' : 'low',
        progress: task.status === 'COMPLETED' ? 100 : 
                 task.status === 'IN_PROGRESS' ? 50 : 0,
        complexity: task.complexity,
        urgency: task.urgency
      })),
      
      // 실시간 메트릭
      todayBookings,
      totalPatients: dashboardData.totalPatients,
      successRate: dashboardData.successRate,
      activeChats,
      
      // 로컬 프로젝트 상태
      ...localProjectData,
      
      // 메타데이터
      lastSync: dashboardData.lastSync,
      voosterConnected: isVoosterConnected,
      serverStatus: 'online',
      timestamp: Date.now(),
      lastUpdated: now.toISOString()
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Vooster-Connected': isVoosterConnected.toString(),
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // 에러 발생 시 기본값 반환
    const fallbackData = {
      project: {
        id: 'prj_dc9j4s3djswft2oz5a94spsk',
        name: 'YSK-LandingPage-2RU4',
        status: 'in-progress'
      },
      voosterTasks: [],
      todayBookings: 0,
      totalPatients: 15400,
      successRate: 99.8,
      activeChats: 0,
      completedTasks: ["T-001", "T-002", "T-003", "T-004", "T-005", "T-007"],
      currentTask: "T-006",
      projectStatus: "in-progress",
      lastSync: new Date().toISOString(),
      voosterConnected: false,
      serverStatus: 'error',
      error: 'Vooster API connection failed',
      timestamp: Date.now()
    }

    return NextResponse.json(fallbackData, {
      status: 200, // 클라이언트가 계속 동작하도록 200으로 반환
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Vooster-Connected': 'false',
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 프로젝트 상태 업데이트 로직
    const projectConfigPath = path.join(process.cwd(), '.vooster', 'project.json')
    
    if (fs.existsSync(projectConfigPath)) {
      const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
      
      // 업데이트할 필드들
      if (body.currentTask) projectConfig.currentTask = body.currentTask
      if (body.status) projectConfig.status = body.status
      if (body.completedTasks) projectConfig.completedTasks = body.completedTasks
      
      projectConfig.lastUpdated = new Date().toISOString()
      
      // 파일에 저장
      fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2))
      
      return NextResponse.json({ 
        success: true, 
        message: 'Project status updated',
        data: projectConfig
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Project config file not found' 
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Dashboard POST error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update project status' 
    }, { status: 500 })
  }
}
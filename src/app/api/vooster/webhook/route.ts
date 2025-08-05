import { NextRequest, NextResponse } from 'next/server'
import { voosterClient } from '@/lib/vooster/client'
import fs from 'fs'
import path from 'path'

/**
 * Vooster.ai 웹훅 엔드포인트
 * 프로젝트 상태 변경 시 실시간 동기화
 */
export async function POST(request: NextRequest) {
  try {
    const webhookPayload = await request.json()
    
    console.log('🔔 Vooster 웹훅 수신:', {
      event: webhookPayload.event,
      projectId: webhookPayload.project_id,
      timestamp: new Date().toISOString()
    })

    // 웹훅 인증 (선택사항)
    const webhookSecret = process.env.VOOSTER_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('X-Vooster-Signature')
      // 실제 환경에서는 HMAC 검증 구현 필요
    }

    // 프로젝트 ID 확인
    const expectedProjectId = process.env.VOOSTER_PROJECT_ID
    if (webhookPayload.project_id !== expectedProjectId) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    // 웹훅 이벤트 처리
    let updateData = {}
    
    switch (webhookPayload.event) {
      case 'task.created':
        console.log('✅ 새 작업 생성:', webhookPayload.data.title)
        updateData = {
          event: 'task_created',
          task: webhookPayload.data,
          lastSync: new Date().toISOString()
        }
        break
        
      case 'task.updated':
        console.log('🔄 작업 업데이트:', webhookPayload.data.title)
        updateData = {
          event: 'task_updated',
          task: webhookPayload.data,
          lastSync: new Date().toISOString()
        }
        break
        
      case 'task.completed':
        console.log('🎉 작업 완료:', webhookPayload.data.title)
        await updateLocalProjectFile(webhookPayload.data)
        updateData = {
          event: 'task_completed',
          task: webhookPayload.data,
          lastSync: new Date().toISOString()
        }
        break
        
      case 'project.updated':
        console.log('📊 프로젝트 업데이트')
        updateData = {
          event: 'project_updated',
          project: webhookPayload.data,
          lastSync: new Date().toISOString()
        }
        break
        
      default:
        console.log('ℹ️  알 수 없는 이벤트:', webhookPayload.event)
        updateData = {
          event: webhookPayload.event,
          data: webhookPayload.data,
          lastSync: new Date().toISOString()
        }
    }

    // 실시간 업데이트를 위한 브로드캐스트 (향후 WebSocket 구현)
    // await broadcastToClients(updateData)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event: webhookPayload.event,
      processedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Vooster 웹훅 처리 실패:', error)
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * 로컬 프로젝트 파일 업데이트
 */
async function updateLocalProjectFile(taskData: any) {
  try {
    const projectConfigPath = path.join(process.cwd(), '.vooster', 'project.json')
    
    let projectConfig = {
      name: "YSK-LandingPage-2RU4",
      projectId: "2RU4",
      completedTasks: ["T-001", "T-002", "T-003", "T-004", "T-005", "T-007"],
      currentTask: "T-006",
      status: "in-progress"
    }
    
    // 기존 설정 파일 읽기
    if (fs.existsSync(projectConfigPath)) {
      const existingConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
      projectConfig = { ...projectConfig, ...existingConfig }
    }
    
    // 작업 완료 시 완료 목록에 추가
    if (taskData.status === 'completed' && !projectConfig.completedTasks.includes(taskData.id)) {
      projectConfig.completedTasks.push(taskData.id)
    }
    
    // 현재 작업 업데이트
    if (taskData.status === 'in_progress') {
      projectConfig.currentTask = taskData.id
    }
    
    // 마지막 업데이트 시간
    projectConfig.lastUpdated = new Date().toISOString()
    projectConfig.lastSync = new Date().toISOString()
    
    // 파일 저장
    fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2), 'utf8')
    
    console.log('💾 로컬 프로젝트 파일 업데이트 완료')
    
  } catch (error) {
    console.error('❌ 로컬 프로젝트 파일 업데이트 실패:', error)
  }
}

/**
 * GET 요청 처리 (웹훅 엔드포인트 확인용)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Vooster webhook endpoint is active',
    projectId: process.env.VOOSTER_PROJECT_ID,
    timestamp: new Date().toISOString(),
    status: 'ready'
  })
}
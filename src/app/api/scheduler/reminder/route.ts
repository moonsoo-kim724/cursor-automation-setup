/**
 * YSK 연수김안과의원 - 리마인더 스케줄러 관리 API
 * GET /api/scheduler/reminder - 스케줄러 상태 확인
 * POST /api/scheduler/reminder - 스케줄러 시작/중지/수동 실행
 */

import { reminderScheduler } from '@/lib/scheduler/reminder'
import { NextRequest, NextResponse } from 'next/server'

export interface ReminderSchedulerRequest {
  action: 'start' | 'stop' | 'send_tomorrow' | 'send_today' | 'send_followup' | 'status'
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      status: 'active', // 실제로는 스케줄러 상태를 확인해야 함
      message: 'YSK 연수김안과의원 리마인더 스케줄러 관리 API',
      version: '1.0.0',
      availableActions: [
        'start - 스케줄러 시작',
        'stop - 스케줄러 중지',
        'send_tomorrow - 내일 예약 리마인더 즉시 발송',
        'send_today - 오늘 예약 리마인더 즉시 발송',
        'send_followup - 노쇼 후속 조치 즉시 실행',
        'status - 스케줄러 상태 확인'
      ],
      schedule: {
        tomorrow_reminders: '매일 오후 6시 (18:00)',
        today_reminders: '매일 오전 9시 (09:00)',
        followup_check: '매일 오후 7시 (19:00)'
      },
      timezone: 'Asia/Seoul',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: '스케줄러 상태 조회 중 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ReminderSchedulerRequest = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'action은 필수 항목입니다',
          availableActions: ['start', 'stop', 'send_tomorrow', 'send_today', 'send_followup', 'status']
        },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'start':
        try {
          reminderScheduler.start()
          result = {
            action: 'start',
            success: true,
            message: '리마인더 스케줄러가 시작되었습니다',
            schedule: {
              tomorrow_reminders: '매일 오후 6시',
              today_reminders: '매일 오전 9시',
              followup_check: '매일 오후 7시'
            }
          }
        } catch (error: any) {
          result = {
            action: 'start',
            success: false,
            error: '스케줄러 시작 중 오류 발생',
            details: error.message
          }
        }
        break

      case 'stop':
        try {
          reminderScheduler.stop()
          result = {
            action: 'stop',
            success: true,
            message: '리마인더 스케줄러가 중지되었습니다'
          }
        } catch (error: any) {
          result = {
            action: 'stop',
            success: false,
            error: '스케줄러 중지 중 오류 발생',
            details: error.message
          }
        }
        break

      case 'send_tomorrow':
        try {
          console.log('📨 내일 예약 리마인더 수동 실행 시작...')
          await reminderScheduler.sendTomorrowReminders()
          result = {
            action: 'send_tomorrow',
            success: true,
            message: '내일 예약 리마인더가 성공적으로 발송되었습니다',
            executedAt: new Date().toISOString()
          }
          console.log('✅ 내일 예약 리마인더 수동 실행 완료')
        } catch (error: any) {
          console.error('❌ 내일 예약 리마인더 수동 실행 실패:', error)
          result = {
            action: 'send_tomorrow',
            success: false,
            error: '내일 예약 리마인더 발송 중 오류 발생',
            details: error.message
          }
        }
        break

      case 'send_today':
        try {
          console.log('📨 오늘 예약 리마인더 수동 실행 시작...')
          await reminderScheduler.sendTodayReminders()
          result = {
            action: 'send_today',
            success: true,
            message: '오늘 예약 리마인더가 성공적으로 발송되었습니다',
            executedAt: new Date().toISOString()
          }
          console.log('✅ 오늘 예약 리마인더 수동 실행 완료')
        } catch (error: any) {
          console.error('❌ 오늘 예약 리마인더 수동 실행 실패:', error)
          result = {
            action: 'send_today',
            success: false,
            error: '오늘 예약 리마인더 발송 중 오류 발생',
            details: error.message
          }
        }
        break

      case 'send_followup':
        try {
          console.log('📞 노쇼 후속 조치 수동 실행 시작...')
          await reminderScheduler.sendMissedAppointmentFollowUp()
          result = {
            action: 'send_followup',
            success: true,
            message: '노쇼 후속 조치가 성공적으로 실행되었습니다',
            executedAt: new Date().toISOString()
          }
          console.log('✅ 노쇼 후속 조치 수동 실행 완료')
        } catch (error: any) {
          console.error('❌ 노쇼 후속 조치 수동 실행 실패:', error)
          result = {
            action: 'send_followup',
            success: false,
            error: '노쇼 후속 조치 실행 중 오류 발생',
            details: error.message
          }
        }
        break

      case 'status':
        result = {
          action: 'status',
          success: true,
          scheduler: {
            status: 'active', // 실제로는 스ケ줄러 인스턴스의 상태를 확인해야 함
            uptime: '알 수 없음', // 실제로는 시작 시간부터 계산
            nextRun: {
              tomorrow_reminders: '오늘 오후 6시',
              today_reminders: '내일 오전 9시',
              followup_check: '오늘 오후 7시'
            }
          },
          message: '스케줄러 상태 조회 완료'
        }
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: `지원되지 않는 액션: ${action}`,
            availableActions: ['start', 'stop', 'send_tomorrow', 'send_today', 'send_followup', 'status']
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('리마인더 스케줄러 API 오류:', error)

    return NextResponse.json(
      {
        success: false,
        error: '리마인더 스케줄러 처리 중 서버 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// PUT - 스케줄러 설정 업데이트 (향후 확장용)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    return NextResponse.json({
      success: false,
      message: '스케줄 설정 업데이트 기능은 아직 구현되지 않았습니다',
      plannedFeatures: [
        '스케줄 시간 변경',
        '알림 채널 설정',
        '대상 환자 필터링',
        '휴일 제외 설정'
      ]
    }, { status: 501 })

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: '요청 처리 중 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE - 스케줄러 완전 정지 및 정리 (향후 확장용)
export async function DELETE() {
  try {
    reminderScheduler.stop()

    return NextResponse.json({
      success: true,
      message: '리마인더 스케줄러가 완전히 정지되고 정리되었습니다',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: '스케줄러 정지 중 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}

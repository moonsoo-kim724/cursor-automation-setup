/**
 * YSK 연수김안과의원 - 통합 알림 발송 API
 * POST /api/notifications/send
 */

import { AppointmentNotificationData, ConsultationNotificationData, notificationManager } from '@/lib/notifications'
import { NextRequest, NextResponse } from 'next/server'

export interface NotificationRequest {
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancellation' | 'consultation_summary' | 'lead_notification' | 'emergency' | 'system_alert'
  data: AppointmentNotificationData | ConsultationNotificationData | any
  channels?: {
    email?: boolean
    slack?: boolean
    kakao?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json()
    const { type, data, channels = { email: true, slack: true, kakao: true } } = body

    // 입력 데이터 검증
    if (!type || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'type과 data는 필수 항목입니다'
        },
        { status: 400 }
      )
    }

    let result: any

    switch (type) {
      case 'appointment_confirmation':
        // 예약 확인 알림
        if (!data.patientName || !data.phoneNumber || !data.appointmentDate || !data.appointmentTime) {
          return NextResponse.json(
            {
              success: false,
              error: '예약 확인 알림에는 patientName, phoneNumber, appointmentDate, appointmentTime이 필요합니다'
            },
            { status: 400 }
          )
        }

        result = await notificationManager.sendAppointmentConfirmation(data as AppointmentNotificationData, channels)
        break

      case 'appointment_reminder':
        // 예약 리마인더 알림
        if (!data.patientName || !data.phoneNumber || !data.appointmentDate || !data.appointmentTime) {
          return NextResponse.json(
            {
              success: false,
              error: '예약 리마인더에는 patientName, phoneNumber, appointmentDate, appointmentTime이 필요합니다'
            },
            { status: 400 }
          )
        }

        result = await notificationManager.sendAppointmentReminder(data as AppointmentNotificationData, channels)
        break

      case 'appointment_cancellation':
        // 예약 취소 알림
        if (!data.patientName || !data.appointmentDate || !data.appointmentTime) {
          return NextResponse.json(
            {
              success: false,
              error: '예약 취소 알림에는 patientName, appointmentDate, appointmentTime이 필요합니다'
            },
            { status: 400 }
          )
        }

        result = await notificationManager.sendAppointmentCancellation(data as AppointmentNotificationData, channels)
        break

      case 'consultation_summary':
        // 상담 요약 알림
        if (!data.patientName || !data.phoneNumber || !data.symptoms || !data.recommendations) {
          return NextResponse.json(
            {
              success: false,
              error: '상담 요약 알림에는 patientName, phoneNumber, symptoms, recommendations가 필요합니다'
            },
            { status: 400 }
          )
        }

        result = await notificationManager.sendConsultationSummary(data as ConsultationNotificationData, channels)
        break

      case 'lead_notification':
        // 리드 제출 알림 (Slack만)
        if (!data.patientName || !data.phoneNumber || !data.serviceType) {
          return NextResponse.json(
            {
              success: false,
              error: '리드 알림에는 patientName, phoneNumber, serviceType이 필요합니다'
            },
            { status: 400 }
          )
        }

        const leadResult = await notificationManager.sendLeadNotification({
          patientName: data.patientName,
          phoneNumber: data.phoneNumber,
          serviceType: data.serviceType,
          priority: data.priority || 'medium'
        })

        result = { slack: leadResult, email: false, kakao: false, errors: leadResult ? [] : ['리드 알림 발송 실패'] }
        break

      case 'emergency':
        // 응급 상황 알림
        if (!data.patientName || !data.phoneNumber || !data.message) {
          return NextResponse.json(
            {
              success: false,
              error: '응급 알림에는 patientName, phoneNumber, message가 필요합니다'
            },
            { status: 400 }
          )
        }

        const emergencyResult = await notificationManager.sendEmergencyNotification({
          patientName: data.patientName,
          phoneNumber: data.phoneNumber,
          message: data.message,
          priority: 'urgent'
        })

        result = { slack: emergencyResult, email: false, kakao: false, errors: emergencyResult ? [] : ['응급 알림 발송 실패'] }
        break

      case 'system_alert':
        // 시스템 알림
        if (!data.message) {
          return NextResponse.json(
            {
              success: false,
              error: '시스템 알림에는 message가 필요합니다'
            },
            { status: 400 }
          )
        }

        const systemResult = await notificationManager.sendSystemAlert(
          data.message,
          data.priority || 'medium'
        )

        result = { slack: systemResult, email: false, kakao: false, errors: systemResult ? [] : ['시스템 알림 발송 실패'] }
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: `지원되지 않는 알림 타입: ${type}`
          },
          { status: 400 }
        )
    }

    // 성공/실패 판단
    const hasSuccess = result.email || result.slack || result.kakao
    const hasErrors = result.errors && result.errors.length > 0

    return NextResponse.json({
      success: hasSuccess,
      result: result,
      message: hasSuccess
        ? (hasErrors ? '일부 알림이 발송되었습니다' : '모든 알림이 성공적으로 발송되었습니다')
        : '알림 발송에 실패했습니다'
    })

  } catch (error: any) {
    console.error('알림 발송 API 오류:', error)

    return NextResponse.json(
      {
        success: false,
        error: '알림 발송 중 서버 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'YSK 연수김안과의원 통합 알림 시스템',
    version: '1.0.0',
    supportedTypes: [
      'appointment_confirmation',
      'appointment_reminder',
      'appointment_cancellation',
      'consultation_summary',
      'lead_notification',
      'emergency',
      'system_alert'
    ],
    supportedChannels: ['email', 'slack', 'kakao'],
    timestamp: new Date().toISOString()
  })
}

/**
 * YSK 연수김안과의원 - 통합 알림 관리 시스템
 * 이메일, Slack, 카카오톡 알림을 통합 관리
 */

import EmailService, { EmailTemplate } from './email'
import KakaoService, { KakaoMessageTemplate } from './kakao'
import SlackService, { SlackNotificationData } from './slack'

export interface NotificationConfig {
  email?: boolean
  slack?: boolean
  kakao?: boolean
}

export interface AppointmentNotificationData {
  // 환자 정보
  patientName: string
  phoneNumber: string
  email?: string

  // 예약 정보
  appointmentDate: string
  appointmentTime: string
  serviceType: string
  doctorName?: string

  // 추가 정보
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  additionalInfo?: Record<string, any>
}

export interface ConsultationNotificationData {
  // 환자 정보
  patientName: string
  phoneNumber: string
  email?: string

  // 상담 정보
  consultationDate: string
  symptoms: string
  recommendations: string

  // 추가 정보
  additionalInfo?: Record<string, any>
}

export class NotificationManager {
  private static instance: NotificationManager
  private emailService: EmailService
  private slackService: SlackService
  private kakaoService: KakaoService

  private constructor() {
    this.emailService = EmailService.getInstance()
    this.slackService = SlackService.getInstance()
    this.kakaoService = KakaoService.getInstance()
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  /**
   * 새 예약 시 모든 채널로 알림 발송
   */
  async sendAppointmentConfirmation(
    data: AppointmentNotificationData,
    config: NotificationConfig = { email: true, slack: true, kakao: true }
  ): Promise<{
    email: boolean
    slack: boolean
    kakao: boolean
    errors: string[]
  }> {
    const results = {
      email: false,
      slack: false,
      kakao: false,
      errors: [] as string[]
    }

    // 병렬로 모든 알림 발송
    const promises: Promise<void>[] = []

    // 이메일 알림
    if (config.email && data.email) {
      promises.push(
        this.emailService.sendAppointmentConfirmation({
          type: 'appointment_confirmation',
          to: data.email,
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          doctorName: data.doctorName,
          clinicInfo: {
            name: '연수김안과의원',
            address: '인천광역시 연수구 컨벤시아대로 165 포스코타워-연수 B동 17층',
            phone: '032-716-7582'
          }
        }).then(success => {
          results.email = success
          if (!success) results.errors.push('이메일 발송 실패')
        }).catch(error => {
          results.errors.push(`이메일 발송 오류: ${error.message}`)
        })
      )
    }

    // Slack 알림
    if (config.slack) {
      promises.push(
        this.slackService.sendNewAppointmentNotification({
          type: 'new_appointment',
          patientName: data.patientName,
          phoneNumber: data.phoneNumber,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          serviceType: data.serviceType,
          priority: data.priority
        }).then(success => {
          results.slack = success
          if (!success) results.errors.push('Slack 알림 실패')
        }).catch(error => {
          results.errors.push(`Slack 알림 오류: ${error.message}`)
        })
      )
    }

    // 카카오톡 알림
    if (config.kakao) {
      promises.push(
        this.kakaoService.sendAppointmentConfirmation({
          type: 'appointment_confirmation',
          phoneNumber: data.phoneNumber,
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          serviceType: data.serviceType,
          doctorName: data.doctorName
        }).then(response => {
          results.kakao = response.success
          if (!response.success) results.errors.push(`카카오톡 알림 실패: ${response.error}`)
        }).catch(error => {
          results.errors.push(`카카오톡 알림 오류: ${error.message}`)
        })
      )
    }

    // 모든 알림 완료 대기
    await Promise.all(promises)

    // 결과 로깅
    console.log('예약 확인 알림 발송 결과:', results)

    return results
  }

  /**
   * 예약 리마인더 알림 발송
   */
  async sendAppointmentReminder(
    data: AppointmentNotificationData,
    config: NotificationConfig = { email: true, kakao: true }
  ): Promise<{
    email: boolean
    slack: boolean
    kakao: boolean
    errors: string[]
  }> {
    const results = {
      email: false,
      slack: false,
      kakao: false,
      errors: [] as string[]
    }

    const promises: Promise<void>[] = []

    // 이메일 리마인더
    if (config.email && data.email) {
      promises.push(
        this.emailService.sendAppointmentReminder({
          type: 'appointment_reminder',
          to: data.email,
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          doctorName: data.doctorName
        }).then(success => {
          results.email = success
          if (!success) results.errors.push('리마인더 이메일 발송 실패')
        }).catch(error => {
          results.errors.push(`리마인더 이메일 오류: ${error.message}`)
        })
      )
    }

    // 카카오톡 리마인더
    if (config.kakao) {
      promises.push(
        this.kakaoService.sendAppointmentReminder({
          type: 'appointment_reminder',
          phoneNumber: data.phoneNumber,
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          serviceType: data.serviceType,
          doctorName: data.doctorName
        }).then(response => {
          results.kakao = response.success
          if (!response.success) results.errors.push(`카카오톡 리마인더 실패: ${response.error}`)
        }).catch(error => {
          results.errors.push(`카카오톡 리마인더 오류: ${error.message}`)
        })
      )
    }

    await Promise.all(promises)

    console.log('예약 리마인더 발송 결과:', results)
    return results
  }

  /**
   * 예약 취소 알림 발송
   */
  async sendAppointmentCancellation(
    data: AppointmentNotificationData,
    config: NotificationConfig = { slack: true, kakao: true }
  ): Promise<{
    email: boolean
    slack: boolean
    kakao: boolean
    errors: string[]
  }> {
    const results = {
      email: false,
      slack: false,
      kakao: false,
      errors: [] as string[]
    }

    const promises: Promise<void>[] = []

    // Slack 알림 (직원용)
    if (config.slack) {
      promises.push(
        this.slackService.sendAppointmentCancellationNotification({
          type: 'appointment_cancellation',
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime
        }).then(success => {
          results.slack = success
          if (!success) results.errors.push('Slack 취소 알림 실패')
        }).catch(error => {
          results.errors.push(`Slack 취소 알림 오류: ${error.message}`)
        })
      )
    }

    // 카카오톡 알림 (환자용)
    if (config.kakao) {
      promises.push(
        this.kakaoService.sendAppointmentCancellation({
          type: 'appointment_cancellation',
          phoneNumber: data.phoneNumber,
          patientName: data.patientName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          serviceType: data.serviceType
        }).then(response => {
          results.kakao = response.success
          if (!response.success) results.errors.push(`카카오톡 취소 알림 실패: ${response.error}`)
        }).catch(error => {
          results.errors.push(`카카오톡 취소 알림 오류: ${error.message}`)
        })
      )
    }

    await Promise.all(promises)

    console.log('예약 취소 알림 발송 결과:', results)
    return results
  }

  /**
   * 상담 요약 알림 발송
   */
  async sendConsultationSummary(
    data: ConsultationNotificationData,
    config: NotificationConfig = { email: true, kakao: true }
  ): Promise<{
    email: boolean
    slack: boolean
    kakao: boolean
    errors: string[]
  }> {
    const results = {
      email: false,
      slack: false,
      kakao: false,
      errors: [] as string[]
    }

    const promises: Promise<void>[] = []

    // 이메일 상담 요약
    if (config.email && data.email) {
      promises.push(
        this.emailService.sendConsultationSummary({
          type: 'consultation_summary',
          to: data.email,
          patientName: data.patientName,
          additionalData: {
            date: data.consultationDate,
            symptoms: data.symptoms,
            recommendations: data.recommendations,
            ...data.additionalInfo
          }
        }).then(success => {
          results.email = success
          if (!success) results.errors.push('상담 요약 이메일 발송 실패')
        }).catch(error => {
          results.errors.push(`상담 요약 이메일 오류: ${error.message}`)
        })
      )
    }

    // 카카오톡 상담 요약
    if (config.kakao) {
      promises.push(
        this.kakaoService.sendConsultationSummary({
          type: 'consultation_summary',
          phoneNumber: data.phoneNumber,
          patientName: data.patientName,
          additionalData: {
            date: data.consultationDate,
            symptoms: data.symptoms,
            recommendations: data.recommendations,
            ...data.additionalInfo
          }
        }).then(response => {
          results.kakao = response.success
          if (!response.success) results.errors.push(`카카오톡 상담 요약 실패: ${response.error}`)
        }).catch(error => {
          results.errors.push(`카카오톡 상담 요약 오류: ${error.message}`)
        })
      )
    }

    await Promise.all(promises)

    console.log('상담 요약 알림 발송 결과:', results)
    return results
  }

  /**
   * 리드 제출 알림 발송 (직원용)
   */
  async sendLeadNotification(
    data: {
      patientName: string
      phoneNumber: string
      serviceType: string
      priority?: 'low' | 'medium' | 'high' | 'urgent'
    }
  ): Promise<boolean> {
    try {
      const success = await this.slackService.sendLeadSubmissionNotification({
        type: 'lead_submission',
        patientName: data.patientName,
        phoneNumber: data.phoneNumber,
        serviceType: data.serviceType,
        priority: data.priority || 'medium'
      })

      console.log('리드 제출 Slack 알림 결과:', success)
      return success
    } catch (error) {
      console.error('리드 제출 알림 발송 중 오류:', error)
      return false
    }
  }

  /**
   * 응급 상황 알림 발송
   */
  async sendEmergencyNotification(
    data: {
      patientName: string
      phoneNumber: string
      message: string
      priority: 'urgent'
    }
  ): Promise<boolean> {
    try {
      const success = await this.slackService.sendEmergencyContactNotification({
        type: 'emergency_contact',
        patientName: data.patientName,
        phoneNumber: data.phoneNumber,
        priority: data.priority,
        additionalInfo: {
          message: data.message
        }
      })

      console.log('응급 상황 Slack 알림 결과:', success)
      return success
    } catch (error) {
      console.error('응급 상황 알림 발송 중 오류:', error)
      return false
    }
  }

  /**
   * 시스템 알림 발송
   */
  async sendSystemAlert(
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<boolean> {
    try {
      const success = await this.slackService.sendSystemAlert({
        type: 'system_alert',
        priority: priority,
        additionalInfo: {
          message: message
        }
      })

      console.log('시스템 알림 발송 결과:', success)
      return success
    } catch (error) {
      console.error('시스템 알림 발송 중 오류:', error)
      return false
    }
  }
}

// 편의를 위한 기본 인스턴스 export
export const notificationManager = NotificationManager.getInstance()

// 개별 서비스들도 export
export { EmailService, KakaoService, SlackService }
export type { EmailTemplate, KakaoMessageTemplate, SlackNotificationData }

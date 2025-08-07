/**
 * YSK 연수김안과의원 - Slack 알림 서비스
 * 병원 직원을 위한 내부 알림 시스템
 */

import { WebClient } from '@slack/web-api'

export interface SlackNotificationData {
  type: 'new_appointment' | 'appointment_cancellation' | 'emergency_contact' | 'system_alert' | 'lead_submission'
  patientName?: string
  appointmentDate?: string
  appointmentTime?: string
  phoneNumber?: string
  serviceType?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  additionalInfo?: Record<string, any>
}

export class SlackService {
  private static instance: SlackService
  private client: WebClient
  private webhookUrl: string
  private channels: {
    alerts: string
    reservations: string
    general: string
  }

  private constructor() {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN)
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || ''
    this.channels = {
      alerts: process.env.SLACK_CHANNEL_ALERTS || '#alerts',
      reservations: process.env.SLACK_CHANNEL_RESERVATIONS || '#reservations',
      general: '#general'
    }
  }

  public static getInstance(): SlackService {
    if (!SlackService.instance) {
      SlackService.instance = new SlackService()
    }
    return SlackService.instance
  }

  /**
   * 새 예약 알림 발송
   */
  async sendNewAppointmentNotification(data: SlackNotificationData): Promise<boolean> {
    try {
      const message = this.createNewAppointmentMessage(data)

      const response = await this.client.chat.postMessage({
        channel: this.channels.reservations,
        ...message
      })

      if (response.ok) {
        console.log('Slack 새 예약 알림 발송 성공:', response.ts)
        return true
      } else {
        console.error('Slack 새 예약 알림 발송 실패:', response.error)
        return false
      }
    } catch (error) {
      console.error('Slack 새 예약 알림 발송 중 오류:', error)
      return this.fallbackWebhookNotification(data)
    }
  }

  /**
   * 예약 취소 알림 발송
   */
  async sendAppointmentCancellationNotification(data: SlackNotificationData): Promise<boolean> {
    try {
      const message = this.createCancellationMessage(data)

      const response = await this.client.chat.postMessage({
        channel: this.channels.reservations,
        ...message
      })

      if (response.ok) {
        console.log('Slack 예약 취소 알림 발송 성공:', response.ts)
        return true
      } else {
        console.error('Slack 예약 취소 알림 발송 실패:', response.error)
        return false
      }
    } catch (error) {
      console.error('Slack 예약 취소 알림 발송 중 오류:', error)
      return this.fallbackWebhookNotification(data)
    }
  }

  /**
   * 응급 연락 알림 발송
   */
  async sendEmergencyContactNotification(data: SlackNotificationData): Promise<boolean> {
    try {
      const message = this.createEmergencyMessage(data)

      const response = await this.client.chat.postMessage({
        channel: this.channels.alerts,
        ...message
      })

      if (response.ok) {
        console.log('Slack 응급 알림 발송 성공:', response.ts)
        return true
      } else {
        console.error('Slack 응급 알림 발송 실패:', response.error)
        return false
      }
    } catch (error) {
      console.error('Slack 응급 알림 발송 중 오류:', error)
      return this.fallbackWebhookNotification(data)
    }
  }

  /**
   * 리드 제출 알림 발송
   */
  async sendLeadSubmissionNotification(data: SlackNotificationData): Promise<boolean> {
    try {
      const message = this.createLeadSubmissionMessage(data)

      const response = await this.client.chat.postMessage({
        channel: this.channels.reservations,
        ...message
      })

      if (response.ok) {
        console.log('Slack 리드 제출 알림 발송 성공:', response.ts)
        return true
      } else {
        console.error('Slack 리드 제출 알림 발송 실패:', response.error)
        return false
      }
    } catch (error) {
      console.error('Slack 리드 제출 알림 발송 중 오류:', error)
      return this.fallbackWebhookNotification(data)
    }
  }

  /**
   * 시스템 알림 발송
   */
  async sendSystemAlert(data: SlackNotificationData): Promise<boolean> {
    try {
      const message = this.createSystemAlertMessage(data)

      const response = await this.client.chat.postMessage({
        channel: this.channels.alerts,
        ...message
      })

      if (response.ok) {
        console.log('Slack 시스템 알림 발송 성공:', response.ts)
        return true
      } else {
        console.error('Slack 시스템 알림 발송 실패:', response.error)
        return false
      }
    } catch (error) {
      console.error('Slack 시스템 알림 발송 중 오류:', error)
      return this.fallbackWebhookNotification(data)
    }
  }

  /**
   * 새 예약 메시지 생성
   */
  private createNewAppointmentMessage(data: SlackNotificationData) {
    const priorityEmoji = this.getPriorityEmoji(data.priority)
    const serviceEmoji = this.getServiceEmoji(data.serviceType)

    return {
      text: `${priorityEmoji} 새로운 예약이 등록되었습니다`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${priorityEmoji} 새로운 예약 등록`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*환자명:*\n${data.patientName || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*연락처:*\n${data.phoneNumber || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*예약 날짜:*\n${data.appointmentDate || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*예약 시간:*\n${data.appointmentTime || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*서비스 유형:*\n${serviceEmoji} ${data.serviceType || '일반 진료'}`
            },
            {
              type: 'mrkdwn',
              text: `*등록 시간:*\n${new Date().toLocaleString('ko-KR')}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '예약 관리'
              },
              style: 'primary',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/appointments`
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '환자 정보'
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/patients`
            }
          ]
        }
      ]
    }
  }

  /**
   * 예약 취소 메시지 생성
   */
  private createCancellationMessage(data: SlackNotificationData) {
    return {
      text: `⚠️ 예약이 취소되었습니다`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `⚠️ 예약 취소 알림`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*환자명:*\n${data.patientName || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*취소된 예약:*\n${data.appointmentDate} ${data.appointmentTime}`
            },
            {
              type: 'mrkdwn',
              text: `*취소 시간:*\n${new Date().toLocaleString('ko-KR')}`
            }
          ]
        }
      ]
    }
  }

  /**
   * 응급 연락 메시지 생성
   */
  private createEmergencyMessage(data: SlackNotificationData) {
    return {
      text: `🚨 응급 연락이 있습니다!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 응급 연락 알림`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*환자명:*\n${data.patientName || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*연락처:*\n${data.phoneNumber || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*우선순위:*\n${data.priority?.toUpperCase() || 'HIGH'}`
            },
            {
              type: 'mrkdwn',
              text: `*접수 시간:*\n${new Date().toLocaleString('ko-KR')}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*추가 정보:*\n${data.additionalInfo?.message || '추가 정보 없음'}`
          }
        }
      ]
    }
  }

  /**
   * 리드 제출 메시지 생성
   */
  private createLeadSubmissionMessage(data: SlackNotificationData) {
    return {
      text: `💡 새로운 리드가 제출되었습니다`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `💡 새로운 리드 제출`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*이름:*\n${data.patientName || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*연락처:*\n${data.phoneNumber || '정보 없음'}`
            },
            {
              type: 'mrkdwn',
              text: `*관심 서비스:*\n${data.serviceType || '일반 상담'}`
            },
            {
              type: 'mrkdwn',
              text: `*제출 시간:*\n${new Date().toLocaleString('ko-KR')}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '리드 관리'
              },
              style: 'primary',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads`
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '연락하기'
              },
              url: `tel:${data.phoneNumber}`
            }
          ]
        }
      ]
    }
  }

  /**
   * 시스템 알림 메시지 생성
   */
  private createSystemAlertMessage(data: SlackNotificationData) {
    const priorityEmoji = data.priority === 'urgent' ? '🔴' : data.priority === 'high' ? '🟡' : '🔵'

    return {
      text: `${priorityEmoji} 시스템 알림`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${priorityEmoji} 시스템 알림`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*메시지:* ${data.additionalInfo?.message || '시스템 알림입니다'}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*우선순위:*\n${data.priority?.toUpperCase() || 'MEDIUM'}`
            },
            {
              type: 'mrkdwn',
              text: `*발생 시간:*\n${new Date().toLocaleString('ko-KR')}`
            }
          ]
        }
      ]
    }
  }

  /**
   * 우선순위 이모지 반환
   */
  private getPriorityEmoji(priority?: string): string {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟡'
      case 'medium': return '🟢'
      case 'low': return '🔵'
      default: return '🟢'
    }
  }

  /**
   * 서비스 유형 이모지 반환
   */
  private getServiceEmoji(serviceType?: string): string {
    if (!serviceType) return '👁️'

    const lowerType = serviceType.toLowerCase()
    if (lowerType.includes('라식') || lowerType.includes('라섹')) return '✨'
    if (lowerType.includes('백내장')) return '🌤️'
    if (lowerType.includes('노안')) return '👓'
    if (lowerType.includes('렌즈삽입')) return '💎'
    if (lowerType.includes('녹내장')) return '🌊'
    return '👁️'
  }

  /**
   * Webhook을 사용한 대체 알림 방법
   */
  private async fallbackWebhookNotification(data: SlackNotificationData): Promise<boolean> {
    if (!this.webhookUrl) {
      console.error('Slack Webhook URL이 설정되지 않았습니다')
      return false
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${data.type} 알림: ${data.patientName || '환자'} - ${data.appointmentDate || ''} ${data.appointmentTime || ''}`
        })
      })

      if (response.ok) {
        console.log('Slack Webhook 알림 발송 성공')
        return true
      } else {
        console.error('Slack Webhook 알림 발송 실패:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Slack Webhook 알림 발송 중 오류:', error)
      return false
    }
  }
}

export default SlackService

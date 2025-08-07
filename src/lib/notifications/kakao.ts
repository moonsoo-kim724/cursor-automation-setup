/**
 * YSK 연수김안과의원 - 카카오톡 알림톡/친구톡 서비스
 * 환자를 위한 예약 확인, 리마인더, 알림 발송
 */

export interface KakaoMessageTemplate {
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancellation' | 'consultation_summary'
  phoneNumber: string
  patientName: string
  appointmentDate?: string
  appointmentTime?: string
  serviceType?: string
  doctorName?: string
  additionalData?: Record<string, any>
}

export interface KakaoAPIResponse {
  success: boolean
  messageId?: string
  error?: string
}

export class KakaoService {
  private static instance: KakaoService
  private apiKey: string
  private baseUrl: string
  private templates: {
    appointment: string
    reminder: string
    cancellation: string
    consultation: string
  }

  private constructor() {
    this.apiKey = process.env.KAKAO_API_KEY || ''
    this.baseUrl = 'https://api.bizppurio.com' // 비즈뿌리오 API 기준 (실제 사용시 변경 필요)
    this.templates = {
      appointment: process.env.KAKAO_TEMPLATE_ID_APPOINTMENT || '',
      reminder: process.env.KAKAO_TEMPLATE_ID_REMINDER || '',
      cancellation: process.env.KAKAO_TEMPLATE_ID_CANCELLATION || '',
      consultation: process.env.KAKAO_TEMPLATE_ID_CONSULTATION || ''
    }
  }

  public static getInstance(): KakaoService {
    if (!KakaoService.instance) {
      KakaoService.instance = new KakaoService()
    }
    return KakaoService.instance
  }

  /**
   * 예약 확인 알림톡 발송
   */
  async sendAppointmentConfirmation(template: KakaoMessageTemplate): Promise<KakaoAPIResponse> {
    try {
      const message = this.generateAppointmentConfirmationMessage(template)

      const response = await this.sendKakaoMessage({
        templateId: this.templates.appointment,
        phoneNumber: template.phoneNumber,
        message: message,
        buttons: [
          {
            name: '예약관리',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/appointment/manage`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/appointment/manage`
          },
          {
            name: '병원위치',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/location`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/location`
          }
        ]
      })

      if (response.success) {
        console.log('카카오톡 예약 확인 알림 발송 성공:', response.messageId)
      } else {
        console.error('카카오톡 예약 확인 알림 발송 실패:', response.error)
      }

      return response
    } catch (error) {
      console.error('카카오톡 예약 확인 알림 발송 중 오류:', error)
      return { success: false, error: '알림 발송 중 오류가 발생했습니다' }
    }
  }

  /**
   * 예약 리마인더 알림톡 발송
   */
  async sendAppointmentReminder(template: KakaoMessageTemplate): Promise<KakaoAPIResponse> {
    try {
      const message = this.generateAppointmentReminderMessage(template)

      const response = await this.sendKakaoMessage({
        templateId: this.templates.reminder,
        phoneNumber: template.phoneNumber,
        message: message,
        buttons: [
          {
            name: '위치안내',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/location`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/location`
          },
          {
            name: '변경/취소',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/appointment/manage`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/appointment/manage`
          }
        ]
      })

      if (response.success) {
        console.log('카카오톡 예약 리마인더 발송 성공:', response.messageId)
      } else {
        console.error('카카오톡 예약 리마인더 발송 실패:', response.error)
      }

      return response
    } catch (error) {
      console.error('카카오톡 예약 리마인더 발송 중 오류:', error)
      return { success: false, error: '리마인더 발송 중 오류가 발생했습니다' }
    }
  }

  /**
   * 예약 취소 알림톡 발송
   */
  async sendAppointmentCancellation(template: KakaoMessageTemplate): Promise<KakaoAPIResponse> {
    try {
      const message = this.generateAppointmentCancellationMessage(template)

      const response = await this.sendKakaoMessage({
        templateId: this.templates.cancellation,
        phoneNumber: template.phoneNumber,
        message: message,
        buttons: [
          {
            name: '재예약하기',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/appointment`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/appointment`
          },
          {
            name: '상담받기',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/chatbot`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/chatbot`
          }
        ]
      })

      if (response.success) {
        console.log('카카오톡 예약 취소 알림 발송 성공:', response.messageId)
      } else {
        console.error('카카오톡 예약 취소 알림 발송 실패:', response.error)
      }

      return response
    } catch (error) {
      console.error('카카오톡 예약 취소 알림 발송 중 오류:', error)
      return { success: false, error: '취소 알림 발송 중 오류가 발생했습니다' }
    }
  }

  /**
   * 상담 요약 알림톡 발송
   */
  async sendConsultationSummary(template: KakaoMessageTemplate): Promise<KakaoAPIResponse> {
    try {
      const message = this.generateConsultationSummaryMessage(template)

      const response = await this.sendKakaoMessage({
        templateId: this.templates.consultation,
        phoneNumber: template.phoneNumber,
        message: message,
        buttons: [
          {
            name: '진료예약',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/appointment`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/appointment`
          },
          {
            name: '추가상담',
            type: 'WL',
            url_mobile: `${process.env.NEXT_PUBLIC_APP_URL}/chatbot`,
            url_pc: `${process.env.NEXT_PUBLIC_APP_URL}/chatbot`
          }
        ]
      })

      if (response.success) {
        console.log('카카오톡 상담 요약 발송 성공:', response.messageId)
      } else {
        console.error('카카오톡 상담 요약 발송 실패:', response.error)
      }

      return response
    } catch (error) {
      console.error('카카오톡 상담 요약 발송 중 오류:', error)
      return { success: false, error: '상담 요약 발송 중 오류가 발생했습니다' }
    }
  }

  /**
   * 예약 확인 메시지 생성
   */
  private generateAppointmentConfirmationMessage(template: KakaoMessageTemplate): string {
    return `[연수김안과의원] 예약 확정 안내

안녕하세요, ${template.patientName}님!
예약이 성공적으로 확정되었습니다.

📅 예약 정보
• 날짜: ${template.appointmentDate}
• 시간: ${template.appointmentTime}
• 진료: ${template.serviceType || '일반 진료'}
• 담당: ${template.doctorName || '연수김안과 의료진'}

🏥 병원 정보
• 연수김안과의원
• 인천 연수구 컨벤시아대로 165 포스코타워-연수 B동 17층
• ☎️ 032-716-7582

📋 방문 전 준비사항
• 방문 30분 전까지 내원
• 신분증, 건강보험증 지참
• 렌즈 착용자는 24시간 전 제거 권장

변경이나 취소는 최소 1일 전까지 연락 바랍니다.

30년의 신뢰, AI로 미래를 열다
연수김안과의원`
  }

  /**
   * 예약 리마인더 메시지 생성
   */
  private generateAppointmentReminderMessage(template: KakaoMessageTemplate): string {
    return `[연수김안과의원] 내일 예약 안내

${template.patientName}님, 안녕하세요!
내일 예약이 있어 안내드립니다.

⏰ 예약 정보
• 날짜: ${template.appointmentDate}
• 시간: ${template.appointmentTime}
• 진료: ${template.serviceType || '일반 진료'}

📋 내일 방문 준비사항
✅ 신분증 및 건강보험증 지참
✅ 렌즈 착용자는 오늘부터 제거 권장
✅ 30분 전 내원
✅ 기존 안경 및 처방전 지참

🚗 교통 안내
• 인천지하철 1호선 센트럴파크역 2번 출구
• 포스코타워-연수 지하주차장 이용 가능

변경이나 취소는 032-716-7582로 연락주세요.

연수김안과의원 드림`
  }

  /**
   * 예약 취소 메시지 생성
   */
  private generateAppointmentCancellationMessage(template: KakaoMessageTemplate): string {
    return `[연수김안과의원] 예약 취소 확인

${template.patientName}님, 안녕하세요!

다음 예약이 취소되었습니다.
• 날짜: ${template.appointmentDate}
• 시간: ${template.appointmentTime}

언제든지 다시 예약하실 수 있습니다.

📞 재예약 문의: 032-716-7582
💬 AI 상담: 홈페이지에서 언제든지

감사합니다.
연수김안과의원 드림`
  }

  /**
   * 상담 요약 메시지 생성
   */
  private generateConsultationSummaryMessage(template: KakaoMessageTemplate): string {
    const consultationData = template.additionalData
    return `[연수김안과의원] AI 상담 요약

${template.patientName}님, 안녕하세요!
오늘 AI 상담 내용을 요약해드립니다.

🤖 상담 내용
• 상담 일시: ${consultationData?.date || new Date().toLocaleDateString('ko-KR')}
• 주요 증상: ${consultationData?.symptoms || '일반 안과 상담'}

💡 AI 추천사항
${consultationData?.recommendations || 'AI 상담 내용을 참고하시고, 정확한 진단은 내원하여 검사받으시기 바랍니다.'}

⚠️ 중요 안내
이 상담은 참고용이며, 정확한 진단은 직접 내원하여 검사받으시기 바랍니다.

증상이 지속되거나 악화되면 즉시 내원해 주세요.

연수김안과의원 드림`
  }

  /**
   * 카카오톡 메시지 발송 (실제 API 호출)
   */
  private async sendKakaoMessage(params: {
    templateId: string
    phoneNumber: string
    message: string
    buttons?: Array<{
      name: string
      type: string
      url_mobile?: string
      url_pc?: string
    }>
  }): Promise<KakaoAPIResponse> {
    // 실제 환경에서는 각 카카오톡 서비스 제공업체의 API를 사용
    // 예시: 비즈뿌리오, 카카오비즈메시지, 알리고 등

    if (!this.apiKey) {
      console.warn('카카오톡 API 키가 설정되지 않아 시뮬레이션 모드로 실행됩니다.')
      return this.simulateKakaoMessage(params)
    }

    try {
      // 실제 API 호출 예시 (비즈뿌리오 기준)
      const response = await fetch(`${this.baseUrl}/v1/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          account: process.env.KAKAO_ACCOUNT_ID,
          messageType: 'AT', // 알림톡
          from: process.env.KAKAO_SENDER_KEY,
          to: params.phoneNumber,
          content: {
            templateId: params.templateId,
            message: params.message,
            buttons: params.buttons
          }
        })
      })

      const result = await response.json()

      if (response.ok && result.code === '200') {
        return {
          success: true,
          messageId: result.messageId
        }
      } else {
        return {
          success: false,
          error: result.message || '알림톡 발송에 실패했습니다'
        }
      }
    } catch (error) {
      console.error('카카오톡 API 호출 중 오류:', error)
      return {
        success: false,
        error: 'API 호출 중 오류가 발생했습니다'
      }
    }
  }

  /**
   * 카카오톡 메시지 발송 시뮬레이션 (개발용)
   */
  private simulateKakaoMessage(params: {
    templateId: string
    phoneNumber: string
    message: string
    buttons?: Array<{
      name: string
      type: string
      url_mobile?: string
      url_pc?: string
    }>
  }): Promise<KakaoAPIResponse> {
    console.log('=== 카카오톡 알림톡 시뮬레이션 ===')
    console.log(`수신번호: ${params.phoneNumber}`)
    console.log(`템플릿ID: ${params.templateId}`)
    console.log(`메시지 내용:\n${params.message}`)

    if (params.buttons && params.buttons.length > 0) {
      console.log('버튼:')
      params.buttons.forEach((button, index) => {
        console.log(`  ${index + 1}. ${button.name} (${button.url_mobile || button.url_pc})`)
      })
    }
    console.log('====================================')

    // 시뮬레이션 성공 응답
    return Promise.resolve({
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    })
  }

  /**
   * 전화번호 형식 검증 및 정리
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    // 한국 전화번호 형식으로 정리
    const cleaned = phoneNumber.replace(/[^\d]/g, '')

    if (cleaned.startsWith('82')) {
      return `+${cleaned}`
    } else if (cleaned.startsWith('010')) {
      return `+82${cleaned.substring(1)}`
    } else if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return `+82${cleaned.substring(1)}`
    }

    return cleaned
  }
}

export default KakaoService

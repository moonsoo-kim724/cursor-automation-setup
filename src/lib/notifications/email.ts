/**
 * YSK 연수김안과의원 - 이메일 알림 서비스
 * Resend.com을 사용한 이메일 자동 발송
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailTemplate {
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_cancellation' | 'consultation_summary'
  to: string
  patientName: string
  appointmentDate?: string
  appointmentTime?: string
  doctorName?: string
  clinicInfo?: {
    name: string
    address: string
    phone: string
  }
  additionalData?: Record<string, any>
}

export class EmailService {
  private static instance: EmailService
  private fromEmail: string

  private constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@ysk-eye.ai'
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * 예약 확인 이메일 발송
   */
  async sendAppointmentConfirmation(template: EmailTemplate): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('Resend API key not configured, skipping email send')
        return false
      }
      
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: template.to,
        subject: '[연수김안과의원] 예약이 확정되었습니다',
        html: this.generateAppointmentConfirmationHTML(template),
      })

      if (error) {
        console.error('이메일 발송 실패:', error)
        return false
      }

      console.log('예약 확인 이메일 발송 성공:', data?.id)
      return true
    } catch (error) {
      console.error('이메일 발송 중 오류:', error)
      return false
    }
  }

  /**
   * 예약 리마인더 이메일 발송
   */
  async sendAppointmentReminder(template: EmailTemplate): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('Resend API key not configured, skipping email send')
        return false
      }
      
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: template.to,
        subject: '[연수김안과의원] 내일 예약이 있습니다',
        html: this.generateAppointmentReminderHTML(template),
      })

      if (error) {
        console.error('리마인더 이메일 발송 실패:', error)
        return false
      }

      console.log('리마인더 이메일 발송 성공:', data?.id)
      return true
    } catch (error) {
      console.error('리마인더 이메일 발송 중 오류:', error)
      return false
    }
  }

  /**
   * 상담 요약 이메일 발송
   */
  async sendConsultationSummary(template: EmailTemplate): Promise<boolean> {
    try {
      if (!resend) {
        console.warn('Resend API key not configured, skipping email send')
        return false
      }
      
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: template.to,
        subject: '[연수김안과의원] 상담 내용 요약',
        html: this.generateConsultationSummaryHTML(template),
      })

      if (error) {
        console.error('상담 요약 이메일 발송 실패:', error)
        return false
      }

      console.log('상담 요약 이메일 발송 성공:', data?.id)
      return true
    } catch (error) {
      console.error('상담 요약 이메일 발송 중 오류:', error)
      return false
    }
  }

  /**
   * 예약 확인 HTML 템플릿 생성
   */
  private generateAppointmentConfirmationHTML(template: EmailTemplate): string {
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약 확인</title>
        <style>
            body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0070F3 0%, #00D2FF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #0070F3; }
            .button { display: inline-block; background: #0070F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏥 연수김안과의원</h1>
                <p>30년의 신뢰, AI로 미래를 열다</p>
            </div>
            <div class="content">
                <h2>안녕하세요, ${template.patientName}님!</h2>
                <p>예약이 성공적으로 확정되었습니다. 아래 내용을 확인해 주세요.</p>

                <div class="info-box">
                    <h3>📅 예약 정보</h3>
                    <p><strong>예약 날짜:</strong> ${template.appointmentDate}</p>
                    <p><strong>예약 시간:</strong> ${template.appointmentTime}</p>
                    <p><strong>담당 의료진:</strong> ${template.doctorName || '연수김안과의원 의료진'}</p>
                </div>

                <div class="info-box">
                    <h3>🏥 병원 정보</h3>
                    <p><strong>연수김안과의원</strong></p>
                    <p>📍 ${template.clinicInfo?.address || '인천시 연수구 컨벤시아대로 165 포스코타워송도 5층'}</p>
                    <p>📞 ${template.clinicInfo?.phone || '대표: 1544-7260, 직통: 032)817-3487'}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ysk-eye.ai'}/appointment/manage" class="button">예약 관리</a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ysk-eye.ai'}/location" class="button">위치 안내</a>
                </div>

                <div class="info-box">
                    <h3>📋 방문 전 안내사항</h3>
                    <ul>
                        <li>방문 30분 전까지 내원해 주세요</li>
                        <li>신분증과 건강보험증을 지참해 주세요</li>
                        <li>렌즈 착용자는 24시간 전 렌즈 제거를 권장합니다</li>
                        <li>변경이나 취소는 최소 1일 전까지 연락 바랍니다</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p>© 2025 연수김안과의원. All rights reserved.</p>
                <p>문의사항이 있으시면 032-716-7582로 연락주세요.</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  /**
   * 예약 리마인더 HTML 템플릿 생성
   */
  private generateAppointmentReminderHTML(template: EmailTemplate): string {
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>예약 리마인더</title>
        <style>
            body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ 예약 리마인더</h1>
                <p>연수김안과의원</p>
            </div>
            <div class="content">
                <div class="reminder-box">
                    <h2>📢 ${template.patientName}님, 내일 예약이 있습니다!</h2>
                    <p><strong>예약 날짜:</strong> ${template.appointmentDate}</p>
                    <p><strong>예약 시간:</strong> ${template.appointmentTime}</p>
                </div>

                <div class="info-box">
                    <h3>📋 내일 방문 준비사항</h3>
                    <ul>
                        <li>✅ 신분증 및 건강보험증 지참</li>
                        <li>✅ 렌즈 착용자는 오늘부터 렌즈 제거 권장</li>
                        <li>✅ 30분 전 내원</li>
                        <li>✅ 기존 안경 및 처방전 지참</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ysk-eye.ai'}/appointment/manage" class="button">예약 변경/취소</a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ysk-eye.ai'}/location" class="button">병원 위치</a>
                </div>

                <div class="info-box">
                    <h3>🚗 교통 안내</h3>
                    <p><strong>주소:</strong> 인천시 연수구 컨벤시아대로 165 포스코타워송도 5층</p>
                    <p><strong>지하철:</strong> 인천지하철 1호선 센트럴파크역 2번 출구</p>
                    <p><strong>주차:</strong> 포스코타워-연수 지하주차장 이용 가능</p>
                </div>
            </div>
            <div class="footer">
                <p>변경이나 취소는 032-716-7582로 연락주세요.</p>
                <p>© 2025 연수김안과의원. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  /**
   * 상담 요약 HTML 템플릿 생성
   */
  private generateConsultationSummaryHTML(template: EmailTemplate): string {
    const consultationData = template.additionalData
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>상담 요약</title>
        <style>
            body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .summary-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 상담 요약</h1>
                <p>연수김안과의원 AI 상담 내용</p>
            </div>
            <div class="content">
                <h2>안녕하세요, ${template.patientName}님!</h2>
                <p>오늘 진행된 AI 상담 내용을 요약해서 보내드립니다.</p>

                <div class="summary-box">
                    <h3>🤖 상담 내용</h3>
                    <p><strong>상담 일시:</strong> ${consultationData?.date || new Date().toLocaleDateString('ko-KR')}</p>
                    <p><strong>주요 증상/문의:</strong> ${consultationData?.symptoms || '일반 안과 상담'}</p>
                    <p><strong>AI 추천사항:</strong></p>
                    <div style="background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 6px;">
                        ${consultationData?.recommendations || 'AI 상담 내용이 여기에 표시됩니다.'}
                    </div>
                </div>

                <div class="summary-box">
                    <h3>⚠️ 중요 안내</h3>
                    <ul>
                        <li>이 상담은 참고용이며, 정확한 진단은 직접 내원하여 검사받으시기 바랍니다.</li>
                        <li>증상이 지속되거나 악화되면 즉시 병원에 내원해 주세요.</li>
                        <li>응급한 경우 032-716-7582로 연락 바랍니다.</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ysk-eye.ai'}/appointment" class="button">진료 예약하기</a>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ysk-eye.ai'}/chatbot" class="button">추가 상담받기</a>
                </div>
            </div>
            <div class="footer">
                <p>© 2025 연수김안과의원. All rights reserved.</p>
                <p>추가 문의: 032-716-7582</p>
            </div>
        </div>
    </body>
    </html>
    `
  }
}

export default EmailService

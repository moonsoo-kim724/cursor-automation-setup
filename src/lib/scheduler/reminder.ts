/**
 * YSK 연수김안과의원 - 예약 리마인더 자동화 스케줄러
 * node-cron을 사용한 리마인더 자동 발송 시스템
 */

import { notificationManager } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import * as cron from 'node-cron'

export interface ReminderScheduler {
  start(): void
  stop(): void
  sendTomorrowReminders(): Promise<void>
  sendTodayReminders(): Promise<void>
  sendMissedAppointmentFollowUp(): Promise<void>
}

class AppointmentReminderScheduler implements ReminderScheduler {
  private reminderTask: cron.ScheduledTask | null = null
  private todayReminderTask: cron.ScheduledTask | null = null
  private followUpTask: cron.ScheduledTask | null = null
  private isRunning = false

  /**
   * 스케줄러 시작
   */
  start(): void {
    if (this.isRunning) {
      console.log('리마인더 스케줄러가 이미 실행 중입니다.')
      return
    }

    console.log('🕒 예약 리마인더 스케줄러를 시작합니다...')

    // 매일 오후 6시에 내일 예약 리마인더 발송
    this.reminderTask = cron.schedule('0 18 * * *', async () => {
      console.log('📅 내일 예약 리마인더 발송 작업 시작')
      await this.sendTomorrowReminders()
    }, {
      timezone: 'Asia/Seoul'
    })

    // 매일 오전 9시에 오늘 예약 리마인더 발송 (당일 확인용)
    this.todayReminderTask = cron.schedule('0 9 * * *', async () => {
      console.log('📅 오늘 예약 리마인더 발송 작업 시작')
      await this.sendTodayReminders()
    }, {
      timezone: 'Asia/Seoul'
    })

    // 매일 오후 7시에 노쇼 환자 후속 조치
    this.followUpTask = cron.schedule('0 19 * * *', async () => {
      console.log('📞 노쇼 환자 후속 조치 작업 시작')
      await this.sendMissedAppointmentFollowUp()
    }, {
      timezone: 'Asia/Seoul'
    })

    this.isRunning = true
    console.log('✅ 예약 리마인더 스케줄러가 성공적으로 시작되었습니다.')
    console.log('- 내일 예약 리마인더: 매일 오후 6시')
    console.log('- 오늘 예약 리마인더: 매일 오전 9시')
    console.log('- 노쇼 후속 조치: 매일 오후 7시')
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('리마인더 스케줄러가 실행 중이 아닙니다.')
      return
    }

    if (this.reminderTask) {
      this.reminderTask.destroy()
      this.reminderTask = null
    }

    if (this.todayReminderTask) {
      this.todayReminderTask.destroy()
      this.todayReminderTask = null
    }

    if (this.followUpTask) {
      this.followUpTask.destroy()
      this.followUpTask = null
    }

    this.isRunning = false
    console.log('⏹️ 예약 리마인더 스케줄러가 중지되었습니다.')
  }

  /**
   * 내일 예약 리마인더 발송
   */
  async sendTomorrowReminders(): Promise<void> {
    try {
      const supabase = await createClient()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowDate = tomorrow.toISOString().split('T')[0]

      // 내일 예약된 환자 조회
      const { data: appointments, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          reservation_time,
          type,
          status,
          patients:patient_id (
            id,
            full_name,
            phone_number,
            email
          )
        `)
        .eq('reservation_date', tomorrowDate)
        .in('status', ['pending', 'confirmed'])
        .not('reminder_sent', 'eq', true) // 이미 리마인더를 보낸 것은 제외

      if (error) {
        console.error('내일 예약 조회 오류:', error)
        return
      }

      if (!appointments || appointments.length === 0) {
        console.log('📅 내일 예약된 환자가 없습니다.')
        return
      }

      console.log(`📨 ${appointments.length}명의 환자에게 내일 예약 리마인더를 발송합니다.`)

      let successCount = 0
      let failCount = 0

      // 각 환자에게 리마인더 발송
      for (const appointment of appointments) {
        const patient = appointment.patients as any
        if (!patient) continue

        try {
          const result = await notificationManager.sendAppointmentReminder({
            patientName: patient.full_name,
            phoneNumber: patient.phone_number,
            email: patient.email,
            appointmentDate: appointment.reservation_date,
            appointmentTime: appointment.reservation_time,
            serviceType: this.getServiceTypeName(appointment.type),
            priority: 'medium'
          }, {
            email: !!patient.email, // 이메일이 있을 때만
            slack: false,           // 리마인더는 Slack 발송 안함
            kakao: true            // 카카오톡은 항상 발송
          })

          if (result.kakao || result.email) {
            // 리마인더 발송 성공 시 플래그 업데이트
            await supabase
              .from('reservations')
              .update({
                reminder_sent: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', appointment.id)

            successCount++
            console.log(`✅ ${patient.full_name} (${patient.phone_number}) - 리마인더 발송 성공`)
          } else {
            failCount++
            console.error(`❌ ${patient.full_name} (${patient.phone_number}) - 리마인더 발송 실패`)
          }

        } catch (error) {
          failCount++
          console.error(`❌ ${patient.full_name} 리마인더 발송 중 오류:`, error)
        }

        // API 호출 간격 조절 (500ms 대기)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      console.log(`📊 내일 예약 리마인더 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`)

      // Slack으로 관리자에게 결과 보고
      if (successCount > 0 || failCount > 0) {
        await notificationManager.sendSystemAlert(
          `📅 내일 예약 리마인더 발송 완료\n• 성공: ${successCount}건\n• 실패: ${failCount}건\n• 대상 날짜: ${tomorrowDate}`,
          failCount > successCount ? 'high' : 'medium'
        )
      }

    } catch (error) {
      console.error('내일 예약 리마인더 발송 중 오류:', error)

      // 시스템 오류 알림
      await notificationManager.sendSystemAlert(
        `❌ 내일 예약 리마인더 시스템 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
        'urgent'
      )
    }
  }

  /**
   * 오늘 예약 리마인더 발송 (당일 확인용)
   */
  async sendTodayReminders(): Promise<void> {
    try {
      const supabase = await createClient()
      const today = new Date().toISOString().split('T')[0]

      // 오늘 예약된 환자 조회
      const { data: appointments, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          reservation_time,
          type,
          status,
          patients:patient_id (
            id,
            full_name,
            phone_number,
            email
          )
        `)
        .eq('reservation_date', today)
        .in('status', ['pending', 'confirmed'])
        .not('today_reminder_sent', 'eq', true) // 당일 리마인더를 이미 보낸 것은 제외

      if (error) {
        console.error('오늘 예약 조회 오류:', error)
        return
      }

      if (!appointments || appointments.length === 0) {
        console.log('📅 오늘 예약된 환자가 없습니다.')
        return
      }

      console.log(`📨 ${appointments.length}명의 환자에게 오늘 예약 안내를 발송합니다.`)

      let successCount = 0

      // Slack으로 직원들에게 오늘 예약 현황 알림
      const appointmentList = appointments.map((apt: any) => {
        const patient = apt.patients as any
        return `• ${apt.reservation_time} - ${patient?.full_name} (${this.getServiceTypeName(apt.type)})`
      }).join('\n')

      await notificationManager.sendSystemAlert(
        `📅 오늘(${today}) 예약 현황 (${appointments.length}건)\n\n${appointmentList}`,
        'medium'
      )

      // 각 환자에게 당일 확인 알림 발송 (카카오톡만, 간단한 메시지)
      for (const appointment of appointments) {
        const patient = appointment.patients as any
        if (!patient) continue

        try {
          // 당일 리마인더는 카카오톡으로만 간단히 발송
          const result = await notificationManager.sendAppointmentReminder({
            patientName: patient.full_name,
            phoneNumber: patient.phone_number,
            email: patient.email,
            appointmentDate: appointment.reservation_date,
            appointmentTime: appointment.reservation_time,
            serviceType: this.getServiceTypeName(appointment.type),
            priority: 'high' // 당일이므로 높은 우선순위
          }, {
            email: false, // 당일은 이메일 발송 안함
            slack: false, // Slack은 별도 처리
            kakao: true   // 카카오톡만 발송
          })

          if (result.kakao) {
            // 당일 리마인더 발송 성공 시 플래그 업데이트
            await supabase
              .from('reservations')
              .update({
                today_reminder_sent: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', appointment.id)

            successCount++
          }

        } catch (error) {
          console.error(`❌ ${patient?.full_name} 당일 리마인더 발송 중 오류:`, error)
        }

        // API 호출 간격 조절
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      console.log(`📊 오늘 예약 리마인더 발송 완료: ${successCount}건`)

    } catch (error) {
      console.error('오늘 예약 리마인더 발송 중 오류:', error)
    }
  }

  /**
   * 노쇼 환자 후속 조치
   */
  async sendMissedAppointmentFollowUp(): Promise<void> {
    try {
      const supabase = await createClient()
      const today = new Date().toISOString().split('T')[0]

      // 오늘 예약이었는데 상태가 여전히 pending/confirmed인 경우 (노쇼 가능성)
      const { data: missedAppointments, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          reservation_time,
          type,
          status,
          patients:patient_id (
            id,
            full_name,
            phone_number,
            email
          )
        `)
        .eq('reservation_date', today)
        .in('status', ['pending', 'confirmed'])
        .not('followup_sent', 'eq', true)

      if (error) {
        console.error('노쇼 예약 조회 오류:', error)
        return
      }

      if (!missedAppointments || missedAppointments.length === 0) {
        console.log('📅 노쇼 가능성이 있는 예약이 없습니다.')
        return
      }

      console.log(`📞 ${missedAppointments.length}건의 노쇼 가능성 예약에 대한 후속 조치를 진행합니다.`)

      // 직원들에게 노쇼 현황 알림
      const missedList = missedAppointments.map((apt: any) => {
        const patient = apt.patients as any
        return `• ${apt.reservation_time} - ${patient?.full_name} (${patient?.phone_number}) - ${this.getServiceTypeName(apt.type)}`
      }).join('\n')

      await notificationManager.sendSystemAlert(
        `⚠️ 노쇼 가능성 있는 예약 (${missedAppointments.length}건)\n\n${missedList}\n\n확인 및 연락이 필요합니다.`,
        'high'
      )

      // 각 노쇼 예약에 대해 후속 조치 플래그 업데이트
      for (const appointment of missedAppointments) {
        await supabase
          .from('reservations')
          .update({
            followup_sent: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointment.id)
      }

      console.log(`📊 노쇼 후속 조치 완료: ${missedAppointments.length}건`)

    } catch (error) {
      console.error('노쇼 후속 조치 중 오류:', error)
    }
  }

  /**
   * 서비스 타입 이름 변환
   */
  private getServiceTypeName(serviceType: string): string {
    const typeMap: Record<string, string> = {
      'consultation': '일반 상담',
      'exam': '정밀 검사',
      'lasik': '라식/라섹 상담',
      'cataract': '백내장 상담',
      'presbyopia': '노안 상담',
      'dry-eye': '안구건조증 상담',
      'pediatric': '소아 안과',
      'retina': '망막 질환',
      'glaucoma': '녹내장'
    }

    return typeMap[serviceType] || serviceType
  }
}

// 싱글톤 인스턴스 생성
export const reminderScheduler = new AppointmentReminderScheduler()

// Next.js 환경에서 자동 시작 (서버 사이드만)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서만 자동 시작
  reminderScheduler.start()
}

export default reminderScheduler

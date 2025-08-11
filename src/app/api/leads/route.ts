import { notificationManager } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import { LeadProcessor, LeadDataSchema } from '@/lib/lead-processor'
import { NextRequest, NextResponse } from 'next/server'

interface LeadData {
  name: string
  phone: string
  email?: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  symptoms?: string
  source: 'leadbot' | 'typebot'
}

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadData = await request.json()

    // 요청 데이터 검증
    const requiredFields = ['name', 'phone', 'serviceType', 'preferredDate', 'preferredTime']
    for (const field of requiredFields) {
      if (!leadData[field as keyof LeadData]) {
        return NextResponse.json(
          { error: `필수 필드가 누락되었습니다: ${field}` },
          { status: 400 }
        )
      }
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]{8,9}$/
    const cleanPhone = leadData.phone.replace(/-/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 날짜 유효성 검증
    const preferredDate = new Date(leadData.preferredDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (preferredDate < today) {
      return NextResponse.json(
        { error: '희망 날짜는 오늘 이후여야 합니다.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient()

    // 1. 환자 데이터 처리 (upsert)
    const { data: existingPatient, error: patientFindError } = await supabase
      .from('patients')
      .select('id')
      .eq('phone_number', cleanPhone)
      .single()

    let patientId: string

    if (existingPatient) {
      // 기존 환자 업데이트
      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update({
          full_name: leadData.name,
          email: leadData.email || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPatient.id)
        .select('id')
        .single()

      if (updateError) {
        console.error('환자 정보 업데이트 실패:', updateError)
        return NextResponse.json(
          { error: '환자 정보 업데이트에 실패했습니다.' },
          { status: 500 }
        )
      }

      patientId = existingPatient.id
    } else {
      // 새 환자 생성
      const { data: newPatient, error: insertError } = await supabase
        .from('patients')
        .insert({
          full_name: leadData.name,
          phone_number: cleanPhone,
          email: leadData.email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (insertError || !newPatient) {
        console.error('환자 생성 실패:', insertError)
        return NextResponse.json(
          { error: '환자 정보 생성에 실패했습니다.' },
          { status: 500 }
        )
      }

      patientId = newPatient.id
    }

    // 2. 예약 데이터 생성
    const timeMapping: Record<string, string> = {
      '오전 (09:00-12:00)': '10:00',
      '오후 (13:00-17:00)': '15:00',
      '저녁 (17:00-18:00)': '17:30',
      'morning': '10:00',
      'afternoon': '15:00',
      'evening': '17:30'
    }

    const serviceTypeMapping: Record<string, string> = {
      '일반 상담': 'consultation',
      '정밀 검사': 'exam',
      '라식/라섹 상담': 'lasik',
      '백내장 상담': 'cataract',
      '노안 상담': 'presbyopia',
      '안구건조증 상담': 'dry-eye'
    }

    const reservationTime = timeMapping[leadData.preferredTime] || '10:00'
    const serviceType = serviceTypeMapping[leadData.serviceType] || leadData.serviceType

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        patient_id: patientId,
        reservation_date: leadData.preferredDate,
        reservation_time: reservationTime,
        type: serviceType,
        status: 'pending',
        notes: leadData.symptoms ? `증상/요청사항: ${leadData.symptoms}\n출처: ${leadData.source}` : `출처: ${leadData.source}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (reservationError || !reservation) {
      console.error('예약 생성 실패:', reservationError)
      return NextResponse.json(
        { error: '예약 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 3. 리드 추적 테이블에 기록 (옵션)
    await supabase.from('lead_tracking').insert({
      patient_id: patientId,
      reservation_id: reservation.id,
      source: leadData.source,
      service_type: serviceType,
      lead_data: leadData,
      created_at: new Date().toISOString()
    }).then((result: any) => {
      if (result.error) {
        console.warn('리드 추적 기록 실패 (무시):', result.error)
      }
    })

    // 4. 알림 발송 (병렬 처리)
    const notificationPromises = [
      // Slack 리드 알림 (직원용)
      notificationManager.sendLeadNotification({
        patientName: leadData.name,
        phoneNumber: cleanPhone,
        serviceType: leadData.serviceType,
        priority: 'medium'
      }).catch(error => {
        console.error('Slack 리드 알림 발송 실패:', error)
        return false
      }),

      // 예약 확인 알림 (환자용 - 카카오톡만)
      notificationManager.sendAppointmentConfirmation({
        patientName: leadData.name,
        phoneNumber: cleanPhone,
        email: leadData.email,
        appointmentDate: leadData.preferredDate,
        appointmentTime: reservationTime,
        serviceType: leadData.serviceType,
        priority: 'medium'
      }, {
        email: false, // 이메일은 비활성화 (카카오톡만)
        slack: false, // Slack은 별도 리드 알림으로 처리
        kakao: true   // 카카오톡만 활성화
      }).catch(error => {
        console.error('예약 확인 알림 발송 실패:', error)
        return { email: false, slack: false, kakao: false, errors: ['알림 발송 실패'] }
      })
    ]

    // 알림 발송 (백그라운드에서 처리)
    Promise.all(notificationPromises).then(results => {
      const [slackResult, appointmentResult] = results
      console.log('리드 알림 발송 결과:', {
        slack: slackResult,
        appointment: appointmentResult
      })
    })

    // 5. 성공 응답 (알림 발송과 관계없이 즉시 응답)
    return NextResponse.json({
      success: true,
      message: '리드가 성공적으로 등록되었습니다.',
      data: {
        patientId,
        reservationId: reservation.id,
        preferredDate: leadData.preferredDate,
        preferredTime: reservationTime,
        serviceType
      }
    })

  } catch (error) {
    console.error('리드 처리 중 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// GET: 리드 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const source = searchParams.get('source') // 'leadbot' 또는 'typebot'

    const supabase = await createClient()

    let query = supabase
      .from('reservations')
      .select(`
        id,
        reservation_date,
        reservation_time,
        type,
        status,
        notes,
        created_at,
        patients:patient_id (
          full_name,
          phone_number,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 소스 필터 적용
    if (source) {
      query = query.ilike('notes', `%출처: ${source}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('리드 목록 조회 오류:', error)
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count || 0
      }
    })

  } catch (error) {
    console.error('리드 GET API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

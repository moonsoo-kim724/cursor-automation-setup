/**
 * YSK 연수김안과의원 - 상담 요약 발송 API
 * POST /api/consultation/summary
 */

import { notificationManager } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface ConsultationSummaryRequest {
  // 환자 정보
  patientName: string
  phoneNumber: string
  email?: string

  // 상담 내용
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>

  // 추출된 정보
  symptoms?: string
  recommendations?: string
  urgency?: 'low' | 'medium' | 'high' | 'urgent'

  // 추가 정보
  consultationDate?: string
  followUpNeeded?: boolean
  appointmentSuggested?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ConsultationSummaryRequest = await request.json()

    // 필수 필드 검증
    if (!body.patientName || !body.phoneNumber || !body.conversationHistory) {
      return NextResponse.json(
        {
          success: false,
          error: 'patientName, phoneNumber, conversationHistory는 필수 항목입니다'
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.conversationHistory) || body.conversationHistory.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '상담 내용이 비어있습니다'
        },
        { status: 400 }
      )
    }

    // 전화번호 정리
    const cleanPhone = body.phoneNumber.replace(/[^\d]/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: '올바른 전화번호 형식이 아닙니다'
        },
        { status: 400 }
      )
    }

    // 상담 내용 요약 생성
    const conversationText = body.conversationHistory
      .map(msg => `${msg.role === 'user' ? '환자' : 'AI'}: ${msg.content}`)
      .join('\n')

    // 증상과 추천사항 추출 (제공되지 않은 경우)
    const symptoms = body.symptoms || extractSymptoms(body.conversationHistory)
    const recommendations = body.recommendations || extractRecommendations(body.conversationHistory)

    // Supabase에 상담 기록 저장
    const supabase = await createClient()

    try {
      // 환자 정보 확인/생성
      let patientId: string

      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone_number', cleanPhone)
        .single()

      if (existingPatient) {
        patientId = existingPatient.id

        // 기존 환자 정보 업데이트 (이름, 이메일)
        await supabase
          .from('patients')
          .update({
            full_name: body.patientName,
            email: body.email || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', patientId)
      } else {
        // 새 환자 생성
        const { data: newPatient, error: insertError } = await supabase
          .from('patients')
          .insert({
            full_name: body.patientName,
            phone_number: cleanPhone,
            email: body.email || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single()

        if (insertError || !newPatient) {
          console.error('환자 생성 실패:', insertError)
          return NextResponse.json(
            {
              success: false,
              error: '환자 정보 생성에 실패했습니다'
            },
            { status: 500 }
          )
        }

        patientId = newPatient.id
      }

      // 상담 기록 저장
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          patient_id: patientId,
          conversation_history: body.conversationHistory,
          symptoms: symptoms,
          recommendations: recommendations,
          urgency_level: body.urgency === 'urgent' ? 5 : body.urgency === 'high' ? 4 : body.urgency === 'medium' ? 3 : 2,
          follow_up_needed: body.followUpNeeded || false,
          appointment_suggested: body.appointmentSuggested || false,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (consultationError) {
        console.error('상담 기록 저장 실패:', consultationError)
        // 상담 기록 저장 실패해도 알림은 보내도록 함
      }

      // 상담 요약 알림 발송
      const notificationResult = await notificationManager.sendConsultationSummary({
        patientName: body.patientName,
        phoneNumber: cleanPhone,
        email: body.email,
        consultationDate: body.consultationDate || new Date().toISOString().split('T')[0],
        symptoms: symptoms,
        recommendations: recommendations,
        additionalInfo: {
          urgency: body.urgency,
          followUpNeeded: body.followUpNeeded,
          appointmentSuggested: body.appointmentSuggested,
          conversationLength: body.conversationHistory.length
        }
      }, {
        email: !!body.email, // 이메일이 있을 때만 발송
        slack: false,        // 상담 요약은 Slack에 보내지 않음
        kakao: true          // 카카오톡은 항상 발송
      })

      return NextResponse.json({
        success: true,
        message: '상담 요약이 성공적으로 발송되었습니다',
        data: {
          patientId,
          consultationId: consultation?.id,
          notificationResult,
          summary: {
            symptoms,
            recommendations,
            urgency: body.urgency || 'medium',
            followUpNeeded: body.followUpNeeded || false,
            appointmentSuggested: body.appointmentSuggested || false
          }
        }
      })

    } catch (dbError) {
      console.error('데이터베이스 오류:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: '데이터베이스 처리 중 오류가 발생했습니다'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('상담 요약 API 오류:', error)

    return NextResponse.json(
      {
        success: false,
        error: '상담 요약 처리 중 서버 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * 대화 내용에서 증상 추출
 */
function extractSymptoms(conversationHistory: Array<{ role: string; content: string }>): string {
  const userMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join(' ')

  // 증상 관련 키워드 패턴
  const symptomPatterns = [
    /아프|아픔|통증|따가|쓰라|화끈/g,
    /흐리|뿌옇|안 보|잘 안/g,
    /건조|마르|껄끄/g,
    /충혈|빨갛|빨간/g,
    /눈부|밝은|빛/g,
    /가려|긁고|문지/g,
    /분비물|눈곱|끈적/g,
    /깜빡|떨림|경련/g
  ]

  const foundSymptoms: string[] = []
  symptomPatterns.forEach(pattern => {
    const matches = userMessages.match(pattern)
    if (matches && matches.length > 0) {
      foundSymptoms.push(...matches)
    }
  })

  return foundSymptoms.length > 0
    ? `환자가 호소한 주요 증상: ${foundSymptoms.slice(0, 5).join(', ')}`
    : '일반적인 안과 상담 문의'
}

/**
 * 대화 내용에서 AI 추천사항 추출
 */
function extractRecommendations(conversationHistory: Array<{ role: string; content: string }>): string {
  const aiMessages = conversationHistory
    .filter(msg => msg.role === 'assistant')
    .map(msg => msg.content)
    .join(' ')

  // 추천사항 관련 키워드 패턴
  const recommendationPatterns = [
    /권장|권유|추천|제안/g,
    /검사|진료|상담|내원/g,
    /치료|수술|시술/g,
    /주의|조심|피하/g,
    /사용|착용|점안/g
  ]

  const foundRecommendations: string[] = []
  recommendationPatterns.forEach(pattern => {
    const matches = aiMessages.match(pattern)
    if (matches && matches.length > 0) {
      foundRecommendations.push(...matches)
    }
  })

  // AI 메시지에서 핵심 추천사항 문장 추출
  const sentences = aiMessages.split(/[.!?]/).filter(s => s.trim().length > 10)
  const keyRecommendations = sentences.filter(sentence =>
    /권장|추천|제안|검사|내원|상담/.test(sentence)
  ).slice(0, 3)

  return keyRecommendations.length > 0
    ? keyRecommendations.join('. ') + '.'
    : 'AI 상담을 통해 기본적인 안과 정보를 제공받았습니다. 정확한 진단을 위해 내원 검사를 권장합니다.'
}

export async function GET() {
  return NextResponse.json({
    message: 'YSK 연수김안과의원 상담 요약 발송 API',
    version: '1.0.0',
    description: '챗봇 상담 완료 후 환자에게 상담 요약을 이메일/카카오톡으로 발송합니다',
    requiredFields: ['patientName', 'phoneNumber', 'conversationHistory'],
    optionalFields: ['email', 'symptoms', 'recommendations', 'urgency', 'consultationDate'],
    timestamp: new Date().toISOString()
  })
}

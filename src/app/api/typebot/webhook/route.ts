/**
 * YSK 연수김안과의원 - Typebot 웹훅 처리 API
 * POST /api/typebot/webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LeadProcessor, LeadDataSchema } from '@/lib/lead-processor'

// Typebot 웹훅 스키마
const TypebotWebhookSchema = z.object({
  typebotId: z.string(),
  sessionId: z.string(),
  answers: z.array(z.object({
    blockId: z.string(),
    variableName: z.string().optional(),
    value: z.any()
  }))
})

type TypebotWebhookData = z.infer<typeof TypebotWebhookSchema>

// Typebot 답변에서 리드 데이터 추출
function extractLeadData(answers: TypebotWebhookData['answers']) {
  const leadData: any = {
    source: 'typebot',
    urgency: 'medium'
  }

  for (const answer of answers) {
    const { variableName, value } = answer
    
    if (!variableName || !value) continue

    switch (variableName.toLowerCase()) {
      case 'name':
      case '이름':
        leadData.name = String(value)
        break
      case 'phone':
      case '전화번호':
      case 'phoneNumber':
        leadData.phone = String(value)
        break
      case 'email':
      case '이메일':
        leadData.email = String(value)
        break
      case 'age':
      case '나이':
        leadData.age = parseInt(value)
        break
      case 'symptoms':
      case '증상':
        leadData.symptoms = String(value)
        break
      case 'urgency':
      case '긴급도':
        leadData.urgency = String(value)
        break
      case 'preferredDate':
      case '희망날짜':
        leadData.preferredDate = String(value)
        break
      case 'preferredTime':
      case '희망시간':
        leadData.preferredTime = String(value)
        break
      case 'serviceType':
      case '서비스타입':
        leadData.serviceType = String(value)
        break
    }
  }

  return leadData
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 웹훅 데이터 검증
    const validationResult = TypebotWebhookSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '웹훅 데이터가 유효하지 않습니다',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { typebotId, sessionId, answers } = validationResult.data

    console.log('🤖 Typebot 웹훅 수신:', {
      typebotId,
      sessionId,
      answersCount: answers.length,
      timestamp: new Date().toISOString()
    })

    // 답변에서 리드 데이터 추출
    const leadData = extractLeadData(answers)
    
    const results = {
      leadSaved: false,
      newsletterSubscribed: false,
      emailSent: false,
      slackNotified: false,
      errors: [] as string[]
    }

    // 리드 데이터 처리 (이름과 전화번호가 있는 경우만)
    if (leadData.name && leadData.phone) {
      try {
        const processResult = await LeadProcessor.processLead(leadData)
        if (processResult.success) {
          results.leadSaved = true
          console.log('✅ 리드 저장 성공:', processResult.leadId)
        } else {
          results.errors.push('리드 저장 실패')
        }
      } catch (error) {
        results.errors.push('리드 처리 오류')
        console.error('리드 처리 오류:', error)
      }
    }

    // 뉴스레터 자동 구독 (이메일이 있는 경우)
    if (leadData.email && leadData.name) {
      try {
        const subscribeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: leadData.email,
            name: leadData.name,
            source: 'typebot',
            tags: ['typebot', 'auto_subscribe']
          })
        })
        
        if (subscribeResponse.ok) {
          results.newsletterSubscribed = true
        }
      } catch (error) {
        results.errors.push('뉴스레터 구독 실패')
      }
    }

    // Slack 알림 발송
    try {
      // TODO: Slack 웹훅 구현
      console.log('📢 Slack 알림:', { leadData, sessionId })
      // results.slackNotified = true
      results.errors.push('Slack 알림 발송 실패') // 임시로 에러 추가
    } catch (error) {
      results.errors.push('Slack 알림 발송 실패')
    }

    // 응답
    return NextResponse.json({
      success: true,
      message: 'Typebot 웹훅이 부분적으로 처리되었습니다',
      data: {
        typebotId,
        sessionId,
        leadData,
        processedAt: new Date().toISOString()
      },
      results,
      errors: results.errors.length > 0 ? results.errors : undefined
    })

  } catch (error: any) {
    console.error('Typebot 웹훅 처리 오류:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Typebot 웹훅 처리 중 서버 오류가 발생했습니다',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// API 정보 조회
export async function GET() {
  return NextResponse.json({
    message: 'YSK 연수김안과의원 Typebot 웹훅 서비스',
    version: '1.0.0',
    features: [
      'Typebot 대화 데이터 자동 처리',
      '리드 데이터 추출 및 저장',
      '뉴스레터 자동 구독',
      'Slack 알림 발송',
      '이메일 자동 응답'
    ],
    usage: {
      endpoint: 'POST /api/typebot/webhook',
      required_fields: ['typebotId', 'sessionId', 'answers'],
      supported_variables: [
        'name/이름', 'phone/전화번호', 'email/이메일', 
        'age/나이', 'symptoms/증상', 'urgency/긴급도',
        'preferredDate/희망날짜', 'preferredTime/희망시간'
      ]
    },
    timestamp: new Date().toISOString()
  })
}
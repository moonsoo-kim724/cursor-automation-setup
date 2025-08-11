/**
 * YSK 연수김안과의원 - 뉴스레터 구독 관리 API
 * POST /api/newsletter/subscribe
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 뉴스레터 구독 요청 스키마
const NewsletterSubscribeSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력하세요'),
  name: z.string().min(1, '이름을 입력하세요').optional(),
  source: z.enum(['website', 'typebot', 'chatbot', 'manual']).default('website'),
  tags: z.array(z.string()).optional(),
  preferences: z.object({
    eyeHealth: z.boolean().default(true),
    treatments: z.boolean().default(true),
    promotions: z.boolean().default(false),
    appointments: z.boolean().default(true)
  }).optional(),
  metadata: z.object({
    userAgent: z.string().optional(),
    referer: z.string().optional(),
    ipAddress: z.string().optional(),
    leadId: z.string().optional()
  }).optional()
})

type NewsletterSubscribeRequest = z.infer<typeof NewsletterSubscribeSchema>

// 스팸 도메인 체크 함수
const SPAM_DOMAINS = [
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email'
]

function isSpamEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return SPAM_DOMAINS.includes(domain)
}

// Supabase에 구독자 저장 함수
async function saveSubscriberToDatabase(subscriberData: any) {
  try {
    // TODO: Supabase 연동 구현
    console.log('💾 뉴스레터 구독자 저장:', {
      ...subscriberData,
      subscribedAt: new Date().toISOString(),
      status: 'pending_confirmation'
    })
    
    return { 
      success: true, 
      subscriberId: 'sub_' + Date.now(),
      status: 'pending_confirmation'
    }
  } catch (error) {
    console.error('구독자 저장 오류:', error)
    return { success: false, error }
  }
}

// 확인 이메일 발송 함수
async function sendConfirmationEmail(email: string, name?: string, subscriberId?: string) {
  try {
    // TODO: 이메일 발송 구현
    console.log('📧 확인 이메일 발송:', { email, name, subscriberId })
    return { success: true }
  } catch (error) {
    console.error('확인 이메일 발송 오류:', error)
    return { success: false, error }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 입력 데이터 검증
    const validationResult = NewsletterSubscribeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 유효하지 않습니다',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { email, name, source, tags, preferences, metadata } = validationResult.data

    // 스팸 이메일 검증
    if (isSpamEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: '임시 이메일 주소는 사용할 수 없습니다'
        },
        { status: 400 }
      )
    }

    console.log('📧 뉴스레터 구독 요청:', {
      email,
      name,
      source,
      timestamp: new Date().toISOString()
    })

    // 1. 데이터베이스에 구독자 저장
    const saveResult = await saveSubscriberToDatabase({
      email,
      name,
      source,
      tags: tags || ['general'],
      preferences: preferences || {
        eyeHealth: true,
        treatments: true,
        promotions: false,
        appointments: true
      },
      metadata: {
        ...metadata,
        subscribedAt: new Date().toISOString(),
        ipAddress: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    })

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '구독 처리 중 오류가 발생했습니다',
          details: 'Database save failed'
        },
        { status: 500 }
      )
    }

    // 2. 확인 이메일 발송 (Double Opt-in)
    const confirmationResult = await sendConfirmationEmail(
      email, 
      name, 
      saveResult.subscriberId
    )

    if (!confirmationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '확인 이메일 발송에 실패했습니다',
          details: 'Email confirmation failed'
        },
        { status: 500 }
      )
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '뉴스레터 구독이 요청되었습니다. 이메일을 확인하여 구독을 완료해주세요.',
      data: {
        subscriberId: saveResult.subscriberId,
        email,
        name,
        status: 'pending_confirmation',
        subscribedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('뉴스레터 구독 API 오류:', error)

    return NextResponse.json(
      {
        success: false,
        error: '뉴스레터 구독 처리 중 서버 오류가 발생했습니다',
        details: error.message
      },
      { status: 500 }
    )
  }
}
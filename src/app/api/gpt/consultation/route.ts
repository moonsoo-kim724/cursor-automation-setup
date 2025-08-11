/**
 * YSK 연수김안과의원 - GPT AI 상담 API
 * POST /api/gpt/consultation
 */

import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { z } from 'zod'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// 요청 스키마 검증
const GPTConsultationSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  patientInfo: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  }).optional()
})

// 의료법 준수 시스템 프롬프트
const MEDICAL_SYSTEM_PROMPT = `
당신은 연수김안과의원의 AI 상담 어시스턴트입니다.

중요한 법적 준수사항:
1. 절대로 확정적인 진단을 내리지 마세요
2. 구체적인 치료법을 직접 권하지 마세요
3. 처방전이나 약물을 추천하지 마세요
4. 의료진의 직접적인 진료를 대체할 수 없음을 명시하세요

응급상황 키워드 감지:
- "갑작스러운 시야 손실"
- "심한 눈 통증"
- "복시 (물체가 둘로 보임)"
- "번개 같은 광시증"
- "눈 외상/부상"
- "화학물질 접촉"

위 증상이 언급되면 즉시 응급실 방문을 권하세요.

상담 가이드라인:
1. 친근하고 전문적인 어조 유지
2. 증상에 대한 일반적인 정보 제공
3. 정확한 진단을 위해 병원 내원 권장
4. 연수김안과의원의 전문 분야 소개
5. 예약 안내 제공

병원 정보:
- 위치: 인천시 연수구 컨벤시아대로 165 포스코타워송도 5층
- 전화: 대표 1544-7260, 직통 032)817-3487
- 전문 분야: 백내장, 시력교정술, 망막질환, 녹내장
`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 입력 데이터 검증
    const validationResult = GPTConsultationSchema.safeParse(body)
    
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

    const { messages, patientInfo } = validationResult.data

    // OpenAI API 호출
    const systemMessage = {
      role: 'system' as const,
      content: MEDICAL_SYSTEM_PROMPT
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const assistantResponse = completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.'

    // 응급상황 감지
    const emergencyKeywords = [
      '갑작스러운 시야', '심한 통증', '복시', '번개 같은', 
      '외상', '화학물질', '응급', '즉시', '긴급'
    ]
    
    const isEmergency = emergencyKeywords.some(keyword => 
      assistantResponse.includes(keyword) || 
      messages.some(msg => msg.content.includes(keyword))
    )

    // 리드 데이터 추출 (환자 정보가 있는 경우)
    let leadCaptured = false
    let leadData = null

    if (patientInfo && (patientInfo.name || patientInfo.phone || patientInfo.email)) {
      // 간단한 리드 정보만 저장 (상세한 처리는 별도 API에서)
      leadData = {
        source: 'gpt_consultation',
        urgency: isEmergency ? 'urgent' : 'medium',
        ...patientInfo,
        symptoms: messages.filter(m => m.role === 'user').map(m => m.content).join(' '),
        consultedAt: new Date().toISOString()
      }
      leadCaptured = true
    }

    return NextResponse.json({
      success: true,
      response: assistantResponse,
      isEmergency,
      leadCaptured,
      leadData: leadCaptured ? leadData : null,
      usage: completion.usage,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('GPT 상담 API 오류:', error)

    // OpenAI API 에러 처리
    if (error.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error: 'API 사용량 한도 초과',
          message: '잠시 후 다시 시도해주세요.',
          retryAfter: 60
        },
        { status: 429 }
      )
    }

    if (error.status === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'API 인증 실패',
          message: '서비스 설정에 문제가 있습니다.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'AI 상담 처리 중 오류가 발생했습니다',
        message: '죄송합니다. 잠시 후 다시 시도해주시거나 직접 연락해주세요.',
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
    message: 'YSK 연수김안과의원 AI 상담 서비스',
    version: '1.0.0',
    features: [
      'GPT-4 기반 의료 상담',
      '응급상황 자동 감지',
      '의료법 준수 응답',
      '리드 데이터 수집',
      '다국어 지원 (한국어, 영어, 중국어)'
    ],
    usage: {
      endpoint: 'POST /api/gpt/consultation',
      required_fields: ['messages'],
      optional_fields: ['patientInfo'],
      rate_limit: '5 requests per minute'
    },
    legal_notice: '본 AI 상담은 의료진의 진료를 대체할 수 없으며, 정확한 진단과 치료를 위해서는 반드시 병원에 내원하시기 바랍니다.',
    emergency_contact: '응급상황 시 119 또는 병원 직통 032)817-3487로 연락하세요.',
    timestamp: new Date().toISOString()
  })
}
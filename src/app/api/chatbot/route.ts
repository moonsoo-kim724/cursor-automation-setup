import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 안과 전문 지식 베이스
interface MedicalKnowledge {
  systemPrompt: string
  specialties: {
    [key: string]: {
      keywords: string[]
      response_template: string
    }
  }
}

const MEDICAL_KNOWLEDGE_BASE: Record<'ko' | 'en' | 'zh', MedicalKnowledge> = {
  ko: {
    systemPrompt: `당신은 연수김안과의원의 AI 상담 어시스턴트입니다. 30년 경력의 안과 전문 지식을 바탕으로 환자들의 질문에 답변합니다.

**중요 지침:**
1. 의료법 준수: 진단이나 처방을 하지 않으며, 내원 상담을 권유합니다.
2. 전문성: 안과 질환에 대한 정확한 정보를 제공합니다.
3. 안전성: 응급 상황 시 즉시 응급실 방문을 권유합니다.
4. 친근함: 환자가 편안하게 느낄 수 있도록 친근한 톤으로 답변합니다.
5. 예약 유도: 적절한 시점에 검사나 상담 예약을 제안합니다.

**전문 분야:**
- 시력교정술 (라식, 라섹, 스마일)
- 백내장 수술
- 노안 교정
- 안구건조증
- 소아 안과
- 망막 질환
- 녹내장

**응답 형식:**
- 이해하기 쉬운 설명
- 단계별 정보 제공
- 관련 검사나 치료 옵션 안내
- 예약 필요 시 안내

**금지 사항:**
- 구체적인 진단 제공
- 약물 처방
- 수술 권유 (정보 제공만)
- 타 병원 비교`,
    
    specialties: {
      vision_correction: {
        keywords: ['라식', '라섹', '스마일', '시력교정', '근시', '원시', '난시'],
        response_template: `**시력교정술 정보:**

🔹 **적합성 검사 필요 항목:**
• 각막 두께 및 형태
• 시력 안정성 (최근 1년)
• 안구 건조증 여부
• 각막 질환 여부

🔹 **수술 방법별 특징:**
• 라식: 빠른 회복, 각막 두께 충분 시
• 라섹: 각막 얇은 경우, 운동선수 추천
• 스마일: 최소 절개, 건조증 위험 낮음

정확한 적합성 판단을 위해 정밀 검사를 받아보시기 바랍니다.`
      },
      cataract: {
        keywords: ['백내장', '수정체', '뿌옇게', '흐릿하게', '눈부심'],
        response_template: `**백내장 정보:**

🔹 **증상 확인:**
• 시야가 뿌옇거나 흐림
• 밝은 빛에 눈부심
• 색상 인식 변화
• 야간 시력 저하

🔹 **수술 시기:**
• 일상생활 불편 시작
• 시력 0.5 이하
• 안전한 활동 제한

🔹 **인공수정체 옵션:**
• 단초점: 기본 보험 적용
• 다초점: 원거리/근거리 동시
• 난시교정: 기존 난시 개선

정확한 진단과 수술 계획을 위해 안과 검진을 받으시기 바랍니다.`
      }
    }
  },
  en: {
    systemPrompt: `You are an AI consultation assistant for Yeonsu Kim Eye Clinic. Based on 30 years of ophthalmology expertise, you help patients with their eye care questions.

**Important Guidelines:**
1. Medical Law Compliance: No diagnosis or prescription, recommend in-person consultation
2. Expertise: Provide accurate information about eye conditions
3. Safety: Recommend immediate ER visit for emergencies
4. Friendly: Maintain a warm, approachable tone
5. Appointment Guidance: Suggest examinations or consultations when appropriate

**Specialties:**
- Vision Correction (LASIK, LASEK, SMILE)
- Cataract Surgery
- Presbyopia Correction
- Dry Eye Treatment
- Pediatric Ophthalmology
- Retinal Diseases
- Glaucoma

**Response Format:**
- Easy-to-understand explanations
- Step-by-step information
- Related examination or treatment options
- Appointment guidance when needed

**Prohibited:**
- Specific diagnosis
- Medication prescription
- Surgery recommendation (information only)
- Comparison with other clinics`,
    
    specialties: {
      vision_correction: {
        keywords: ['lasik', 'lasek', 'smile', 'vision correction', 'myopia', 'hyperopia', 'astigmatism'],
        response_template: `**Vision Correction Information:**

🔹 **Pre-surgery Requirements:**
• Corneal thickness and shape
• Vision stability (past year)
• Dry eye condition
• Corneal disease status

🔹 **Surgery Types:**
• LASIK: Fast recovery, adequate corneal thickness
• LASEK: Thin corneas, recommended for athletes
• SMILE: Minimal incision, lower dry eye risk

Please schedule a comprehensive examination for accurate suitability assessment.`
      },
      cataract: {
        keywords: ['cataract', 'cloudy', 'blurry', 'lens', 'glare'],
        response_template: `**Cataract Information:**

🔹 **Symptoms:**
• Cloudy or blurred vision
• Light sensitivity and glare
• Color perception changes
• Night vision difficulties

🔹 **Surgery Timing:**
• When daily activities are affected
• Vision below 0.5
• Safety concerns

🔹 **Lens Options:**
• Monofocal: Basic insurance coverage
• Multifocal: Distance/near vision
• Toric: Astigmatism correction

Please visit for accurate diagnosis and surgery planning.`
      }
    }
  },
  zh: {
    systemPrompt: `您是延秀金眼科医院的AI咨询助手。基于30年的眼科专业知识，为患者的眼部护理问题提供帮助。

**重要指导原则:**
1. 医疗法规遵守：不提供诊断或处方，建议亲自咨询
2. 专业性：提供准确的眼部疾病信息
3. 安全性：紧急情况下建议立即就医
4. 友好性：保持温暖、亲切的语调
5. 预约指导：适时建议检查或咨询

**专业领域:**
- 视力矫正术（LASIK、LASEK、SMILE）
- 白内障手术
- 老花眼矫正
- 干眼症治疗
- 小儿眼科
- 视网膜疾病
- 青光眼

**回答格式:**
- 易于理解的说明
- 分步骤信息提供
- 相关检查或治疗选项指导
- 需要时提供预约指导

**禁止事项:**
- 具体诊断
- 药物处方
- 手术建议（仅提供信息）
- 与其他医院比较`,
    
    specialties: {
      vision_correction: {
        keywords: ['激光', '近视', '远视', '散光', '手术', '矫正'],
        response_template: `**视力矫正信息:**

🔹 **术前检查要求:**
• 角膜厚度和形状
• 视力稳定性（过去一年）
• 干眼症状况
• 角膜疾病状态

🔹 **手术类型:**
• LASIK：快速恢复，适合角膜厚度充足者
• LASEK：角膜较薄者，推荐运动员
• SMILE：微创切口，干眼风险低

请预约全面检查以准确评估适合性。`
      },
      cataract: {
        keywords: ['白内障', '模糊', '混浊', '晶状体', '眩光'],
        response_template: `**白内障信息:**

🔹 **症状:**
• 视力模糊或混浊
• 光敏感和眩光
• 色彩感知变化
• 夜视困难

🔹 **手术时机:**
• 日常活动受影响时
• 视力低于0.5
• 安全考虑

🔹 **晶状体选择:**
• 单焦点：基本保险覆盖
• 多焦点：远近视力
• 散光矫正：散光校正

请就诊进行准确诊断和手术规划。`
      }
    }
  }
}

// 언어 감지 함수
function detectLanguage(text: string): 'ko' | 'en' | 'zh' {
  const koreanPattern = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
  const chinesePattern = /[\u4e00-\u9fff]/
  
  if (koreanPattern.test(text)) return 'ko'
  if (chinesePattern.test(text)) return 'zh'
  return 'en'
}

// 안과 전문 컨텍스트 생성
function createMedicalContext(message: string, language: 'ko' | 'en' | 'zh') {
  const knowledge = MEDICAL_KNOWLEDGE_BASE[language]
  let context = knowledge.systemPrompt
  
  // 키워드 기반 전문 응답 추가
  const lowerMessage = message.toLowerCase()
  
  for (const [specialty, info] of Object.entries(knowledge.specialties)) {
    const keywords = info.keywords
    if (keywords.some((keyword: string) => lowerMessage.includes(keyword))) {
      context += `\n\n**${specialty} 전문 정보:**\n${info.response_template}`
      break
    }
  }
  
  return context
}

// 응답 후처리 (예약 정보 추출)
function processResponse(response: string, originalMessage: string) {
  const bookingKeywords = ['예약', '검사', '상담', '진료', 'appointment', 'examination', 'consultation']
  const urgentKeywords = ['응급', '급한', '아파', '심한', 'emergency', 'urgent', 'severe']
  
  let bookingInfo = null
  const hasBookingIntent = bookingKeywords.some(keyword => 
    originalMessage.toLowerCase().includes(keyword) || 
    response.toLowerCase().includes(keyword)
  )
  
  if (hasBookingIntent) {
    const urgency = urgentKeywords.some(keyword => 
      originalMessage.toLowerCase().includes(keyword)
    ) ? 'high' : 'medium'
    
    bookingInfo = {
      type: 'consultation',
      urgency,
      department: '안과',
      suggestedActions: ['전화상담', '온라인예약', '카카오상담']
    }
  }
  
  return {
    content: response,
    bookingInfo,
    suggestions: extractSuggestions(response)
  }
}

// 제안 키워드 추출
function extractSuggestions(response: string) {
  const suggestions = []
  
  if (response.includes('라식') || response.includes('LASIK')) {
    suggestions.push('라식 비용 문의', '라식 부작용', '라식 회복기간')
  }
  if (response.includes('백내장') || response.includes('cataract')) {
    suggestions.push('백내장 수술시기', '인공수정체 종류', '백내장 보험')
  }
  if (response.includes('검사') || response.includes('examination')) {
    suggestions.push('검사 예약', '검사 비용', '검사 시간')
  }
  
  return suggestions.slice(0, 4) // 최대 4개
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [], language = 'ko' } = await req.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 언어 자동 감지
    const detectedLanguage = language || detectLanguage(message)
    
    // 의료 컨텍스트 생성
    const medicalContext = createMedicalContext(message, detectedLanguage)
    
    // 대화 히스토리 구성
    const messages = [
      { role: 'system', content: medicalContext },
      ...conversationHistory.slice(-10), // 최근 10개 대화만 유지
      { role: 'user', content: message }
    ]
    
    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })
    
    const response = completion.choices[0]?.message?.content || '죄송합니다. 다시 시도해주세요.'
    
    // 응답 후처리
    const processedResponse = processResponse(response, message)
    
    return NextResponse.json({
      response: processedResponse.content,
      bookingInfo: processedResponse.bookingInfo,
      suggestions: processedResponse.suggestions,
      language: detectedLanguage,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Chatbot API Error:', error)
    
    // OpenAI API 오류 처리
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'API 키 설정이 필요합니다.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        fallbackResponse: '죄송합니다. 현재 시스템 점검 중입니다. 전화 상담(032-123-4567)을 이용해주세요.'
      },
      { status: 500 }
    )
  }
}

// 건강 체크 엔드포인트
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'YSK EyeCare AI Chatbot',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
} 
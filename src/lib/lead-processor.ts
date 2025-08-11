/**
 * YSK 연수김안과의원 - 리드 데이터 처리 시스템
 */

import { z } from 'zod'

export const LeadDataSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  phone: z.string().regex(/^010-?\d{4}-?\d{4}$|^02-?\d{3,4}-?\d{4}$|^0\d{1,2}-?\d{3,4}-?\d{4}$/, '올바른 전화번호를 입력하세요'),
  email: z.string().email('유효한 이메일 주소를 입력하세요').optional(),
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  symptoms: z.string().optional(),
  previousTreatment: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  serviceType: z.enum([
    'consultation',
    'examination', 
    'surgery_consultation',
    'follow_up',
    'emergency'
  ]).default('consultation'),
  source: z.enum([
    'website_form',
    'chatbot',
    'typebot',
    'phone_call',
    'walk_in',
    'referral',
    'advertisement',
    'search',
    'social_media'
  ]).default('website_form'),
  metadata: z.object({
    userAgent: z.string().optional(),
    referer: z.string().optional(),
    ipAddress: z.string().optional(),
    sessionId: z.string().optional(),
    campaign: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional()
  }).optional()
})

export type LeadData = z.infer<typeof LeadDataSchema>

export class LeadScorer {
  static calculateScore(leadData: LeadData): {
    score: number
    factors: Record<string, number>
    priority: 'low' | 'medium' | 'high' | 'urgent'
    recommendations: string[]
  } {
    const factors: Record<string, number> = {}
    let totalScore = 0
    const recommendations: string[] = []

    // 긴급도 점수 (40점)
    const urgencyScores = {
      urgent: 40,
      high: 30,
      medium: 20,
      low: 10
    }
    factors.urgency = urgencyScores[leadData.urgency]
    totalScore += factors.urgency

    if (leadData.urgency === 'urgent') {
      recommendations.push('즉시 연락 필요')
    }

    // 증상 심각도 점수 (25점)
    if (leadData.symptoms) {
      const criticalSymptoms = [
        '갑작스러운', '급성', '심한 통증', '시야 손실', '복시', 
        '눈부심', '빛 번짐', '출혈', '외상', '화학물질'
      ]
      const moderateSymptoms = [
        '흐림', '건조', '피로', '충혈', '가려움', 
        '이물감', '눈물', '부종'
      ]
      
      const symptomsLower = leadData.symptoms.toLowerCase()
      
      if (criticalSymptoms.some(symptom => symptomsLower.includes(symptom))) {
        factors.symptoms = 25
        recommendations.push('응급 진료 고려')
      } else if (moderateSymptoms.some(symptom => symptomsLower.includes(symptom))) {
        factors.symptoms = 15
        recommendations.push('빠른 진료 권장')
      } else {
        factors.symptoms = 10
      }
    } else {
      factors.symptoms = 5
      recommendations.push('증상 정보 추가 수집 필요')
    }
    totalScore += factors.symptoms

    // 연락 가능성 점수 (20점)
    let contactScore = 0
    if (leadData.phone) contactScore += 10
    if (leadData.email) contactScore += 7
    if (leadData.preferredTime) contactScore += 3
    
    factors.contact = contactScore
    totalScore += contactScore

    // 완성도 점수 (10점)
    let completenessScore = 0
    const fields = ['name', 'phone', 'email', 'symptoms', 'preferredDate', 'age']
    const filledFields = fields.filter(field => leadData[field as keyof LeadData])
    completenessScore = Math.round((filledFields.length / fields.length) * 10)
    
    factors.completeness = completenessScore
    totalScore += completenessScore

    // 소스 신뢰도 점수 (5점)
    const sourceScores = {
      referral: 5,
      phone_call: 4,
      website_form: 4,
      chatbot: 3,
      typebot: 3,
      walk_in: 5,
      search: 2,
      advertisement: 2,
      social_media: 1
    }
    factors.source = sourceScores[leadData.source] || 2
    totalScore += factors.source

    // 우선순위 결정
    let priority: 'low' | 'medium' | 'high' | 'urgent'
    if (totalScore >= 80 || leadData.urgency === 'urgent') {
      priority = 'urgent'
      recommendations.push('30분 내 연락')
    } else if (totalScore >= 60) {
      priority = 'high'
      recommendations.push('2시간 내 연락')
    } else if (totalScore >= 40) {
      priority = 'medium'
      recommendations.push('당일 연락')
    } else {
      priority = 'low'
      recommendations.push('48시간 내 연락')
    }

    return {
      score: totalScore,
      factors,
      priority,
      recommendations: Array.from(new Set(recommendations))
    }
  }
}

// 리드 처리 파이프라인
export class LeadProcessor {
  static async processLead(leadData: LeadData): Promise<{
    success: boolean
    leadId?: string
    score?: ReturnType<typeof LeadScorer.calculateScore>
    actions?: string[]
    errors?: string[]
  }> {
    try {
      const errors: string[] = []
      const actions: string[] = []

      // 1. 데이터 검증
      const validationResult = LeadDataSchema.safeParse(leadData)
      if (!validationResult.success) {
        return {
          success: false,
          errors: validationResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        }
      }

      const validatedData = validationResult.data
      
      // 2. 리드 점수 계산
      const score = LeadScorer.calculateScore(validatedData)
      
      // 3. 데이터베이스 저장 (TODO: Supabase 구현)
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      actions.push(`리드 저장 완료: ${leadId}`)
      
      console.log('💾 리드 저장:', {
        leadId,
        ...validatedData,
        score: score.score,
        priority: score.priority,
        createdAt: new Date().toISOString()
      })

      return {
        success: true,
        leadId,
        score,
        actions,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error: any) {
      console.error('리드 처리 오류:', error)
      return {
        success: false,
        errors: [`처리 중 오류 발생: ${error.message}`]
      }
    }
  }
}
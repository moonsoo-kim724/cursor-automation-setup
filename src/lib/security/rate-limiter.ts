/**
 * YSK 연수김안과의원 - API Rate Limiter
 */

import { NextRequest } from 'next/server'

// Rate Limit 설정
interface RateLimit {
  windowMs: number // 시간 윈도우 (밀리초)
  maxRequests: number // 최대 요청 수
  message: string // 제한 시 메시지
}

// API별 Rate Limit 설정
const API_RATE_LIMITS: Record<string, RateLimit> = {
  '/api/chatbot': {
    windowMs: 60 * 1000, // 1분
    maxRequests: 10,
    message: '챗봇 사용이 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요.'
  },
  '/api/gpt/consultation': {
    windowMs: 60 * 1000, // 1분
    maxRequests: 5,
    message: 'GPT 상담 사용이 일시적으로 제한되었습니다. 1분 후 다시 시도해주세요.'
  },
  '/api/leads': {
    windowMs: 5 * 60 * 1000, // 5분
    maxRequests: 3,
    message: '리드 제출이 일시적으로 제한되었습니다. 5분 후 다시 시도해주세요.'
  },
  '/api/newsletter/subscribe': {
    windowMs: 10 * 60 * 1000, // 10분
    maxRequests: 2,
    message: '뉴스레터 구독 요청이 일시적으로 제한되었습니다. 10분 후 다시 시도해주세요.'
  },
  '/api/typebot/webhook': {
    windowMs: 60 * 1000, // 1분
    maxRequests: 20,
    message: 'Typebot 웹훅 요청이 일시적으로 제한되었습니다.'
  }
}

// 메모리 기반 Rate Limit 저장소
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// 클린업 함수 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of Array.from(requestCounts.entries())) {
    if (now > data.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 5 * 60 * 1000) // 5분마다 클린업

export class RateLimiter {
  static check(request: NextRequest, apiPath: string): {
    allowed: boolean
    remaining?: number
    resetTime?: number
    message?: string
  } {
    const limits = API_RATE_LIMITS[apiPath]
    if (!limits) {
      return { allowed: true }
    }

    const clientId = this.getClientId(request)
    const key = `${clientId}:${apiPath}`

    const now = Date.now()
    const data = requestCounts.get(key)

    if (!data || now > data.resetTime) {
      const resetTime = now + limits.windowMs
      requestCounts.set(key, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: limits.maxRequests - 1,
        resetTime
      }
    }

    if (data.count >= limits.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: data.resetTime,
        message: limits.message
      }
    }

    data.count++
    requestCounts.set(key, data)

    return {
      allowed: true,
      remaining: limits.maxRequests - data.count,
      resetTime: data.resetTime
    }
  }

  private static getClientId(request: NextRequest): string {
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'
    const userAgentHash = this.simpleHash(userAgent)

    return `${ip}:${userAgentHash}`
  }

  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }
}

export class SecurityValidator {
  static isWhitelistedIP(ip: string): boolean {
    if (!ip) return false
    
    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return true
    }

    if (ip.startsWith('192.168.') || 
        ip.startsWith('10.') || 
        ip.startsWith('172.')) {
      return true
    }

    return false
  }
}
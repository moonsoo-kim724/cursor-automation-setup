/**
 * YSK 연수김안과의원 - Next.js 미들웨어
 * 보안, Rate Limiting, 로깅 등을 처리
 */

import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter, SecurityValidator } from '@/lib/security/rate-limiter'

// 보안 헤더 설정
function addSecurityHeaders(response: NextResponse) {
  // CSP (Content Security Policy)
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
      style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
      img-src 'self' data: https: blob:;
      font-src 'self' https://cdn.jsdelivr.net;
      connect-src 'self' https://api.openai.com https://*.supabase.co;
      frame-src 'self' https://typebot.io;
      media-src 'self' data: blob:;
    `.replace(/\s+/g, ' ').trim()
  )

  // 기타 보안 헤더
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  
  // HSTS (HTTPS Only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

// API 경로별 보안 검사
function validateApiRequest(request: NextRequest): {
  valid: boolean
  error?: string
  status?: number
} {
  const { pathname } = request.nextUrl

  // GET 요청은 기본적으로 허용
  if (request.method === 'GET') {
    return { valid: true }
  }

  // POST 요청 보안 검사
  if (request.method === 'POST') {
    // Content-Type 검사
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return {
        valid: false,
        error: 'Invalid Content-Type. Expected application/json',
        status: 400
      }
    }

    // Origin 검사 (CSRF 방지)
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        'https://ysk-eye.ai',
        'https://www.ysk-eye.ai',
        `https://${host}`
      ]
      
      if (!origin || !allowedOrigins.includes(origin)) {
        return {
          valid: false,
          error: 'Invalid origin',
          status: 403
        }
      }
    }
  }

  // Webhook 검증 (Typebot)
  if (pathname === '/api/typebot/webhook') {
    const signature = request.headers.get('x-typebot-signature')
    const webhookSecret = process.env.TYPEBOT_WEBHOOK_SECRET
    
    if (webhookSecret && !signature) {
      return {
        valid: false,
        error: 'Missing webhook signature',
        status: 401
      }
    }
  }

  return { valid: true }
}

// 요청 로깅
function logRequest(request: NextRequest, rateLimitResult?: any, securityCheck?: any) {
  const { pathname, search } = request.nextUrl
  const method = request.method
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}${search}`, {
    ip,
    userAgent: userAgent.substring(0, 100),
    rateLimited: !rateLimitResult?.allowed,
    securityIssue: securityCheck?.isMalicious,
    remaining: rateLimitResult?.remaining
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  try {
    // 1. API 경로에만 미들웨어 적용
    if (pathname.startsWith('/api/')) {
      // IP 화이트리스트 체크 (내부 요청)
      const clientIp = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
      const isWhitelisted = SecurityValidator.isWhitelistedIP(clientIp)

      // Rate Limiting (화이트리스트 IP는 제외)
      let rateLimitResult = { allowed: true }
      if (!isWhitelisted) {
        // API 경로별로 다른 Rate Limit 적용
        const apiPath = pathname.replace(/\/\w+$/, '') // 동적 경로 정규화
        rateLimitResult = RateLimiter.check(request, apiPath)
      }

      // 보안 검증
      const securityValidation = validateApiRequest(request)

      // 로깅
      logRequest(request, rateLimitResult, undefined)

      // Rate Limit 초과 시 차단
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too Many Requests',
            message: (rateLimitResult as any).message || 'API 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: Math.ceil(((rateLimitResult as any).resetTime! - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(((rateLimitResult as any).resetTime! - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': (rateLimitResult as any).remaining?.toString() || '0',
              'X-RateLimit-Reset': (rateLimitResult as any).resetTime?.toString() || '0'
            }
          }
        )
      }

      // 보안 검증 실패 시 차단
      if (!securityValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Security Validation Failed',
            message: '보안 검증에 실패했습니다.'
          },
          { status: securityValidation.status || 400 }
        )
      }

      // Rate Limit 헤더 추가
      const response = NextResponse.next()
      if ((rateLimitResult as any).remaining !== undefined) {
        response.headers.set('X-RateLimit-Remaining', (rateLimitResult as any).remaining.toString())
      }
      if ((rateLimitResult as any).resetTime) {
        response.headers.set('X-RateLimit-Reset', (rateLimitResult as any).resetTime.toString())
      }

      return addSecurityHeaders(response)
    }

    // 2. 정적 자원 및 일반 페이지는 보안 헤더만 추가
    const response = NextResponse.next()
    return addSecurityHeaders(response)

  } catch (error) {
    console.error('미들웨어 오류:', error)
    
    // 에러가 발생해도 요청은 계속 처리
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
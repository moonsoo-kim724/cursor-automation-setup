import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Twilio 설정 (SMS 전송용)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

interface NavigationRequest {
  phoneNumber: string
  hospitalName: string
  address: string
  navLink: string
  navApp: 'kakao' | 'naver' | 'google' | 'apple'
}

export async function POST(request: NextRequest) {
  try {
    const body: NavigationRequest = await request.json()
    const { phoneNumber, hospitalName, address, navLink, navApp } = body

    // 요청 데이터 검증
    if (!phoneNumber || !hospitalName || !address || !navLink) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]{8,9}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient()

    // 지도 앱별 메시지 템플릿
    const appNames = {
      kakao: '카카오맵',
      naver: '네이버맵',
      google: '구글맵',
      apple: '애플맵'
    }

    const message = `
🏥 ${hospitalName} 길찾기

📍 주소: ${address}

🗺️ ${appNames[navApp]} 길찾기:
${navLink}

💡 링크를 터치하면 ${appNames[navApp]} 앱이 자동으로 실행됩니다.

연락처: 02-1234-5678
진료시간: 평일 9:00-18:00, 토요일 9:00-14:00
`.trim()

    // 개발 환경에서는 실제 SMS 전송 대신 로그만 출력
    if (process.env.NODE_ENV === 'development' || !TWILIO_ACCOUNT_SID) {
      console.log('📱 SMS 전송 시뮬레이션:')
      console.log(`수신번호: ${phoneNumber}`)
      console.log(`메시지 내용:\n${message}`)

      // 네비게이션 요청 로그를 Supabase에 저장
      await supabase.from('navigation_requests').insert({
        phone_number: phoneNumber,
        nav_app: navApp,
        nav_link: navLink,
        message_content: message,
        status: 'sent_simulation',
        created_at: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: '길찾기 링크가 전송되었습니다! (개발 모드)',
        simulation: true
      })
    }

    // 프로덕션 환경에서 실제 Twilio SMS 전송
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER!,
        To: `+82${phoneNumber.substring(1)}`, // 한국 국가번호 추가
        Body: message
      })
    })

    const twilioResult = await response.json()

    if (!response.ok) {
      console.error('Twilio SMS 전송 실패:', twilioResult)

      // 실패 로그 저장
      await supabase.from('navigation_requests').insert({
        phone_number: phoneNumber,
        nav_app: navApp,
        nav_link: navLink,
        message_content: message,
        status: 'failed',
        error_message: twilioResult.message || 'Unknown error',
        created_at: new Date().toISOString()
      })

      return NextResponse.json(
        { error: 'SMS 전송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      )
    }

    // 성공 로그 저장
    await supabase.from('navigation_requests').insert({
      phone_number: phoneNumber,
      nav_app: navApp,
      nav_link: navLink,
      message_content: message,
      status: 'sent',
      twilio_sid: twilioResult.sid,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: '길찾기 링크가 전송되었습니다!',
      messageSid: twilioResult.sid
    })

  } catch (error) {
    console.error('Navigation API 오류:', error)

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// GET 요청으로 전송 내역 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('navigation_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('네비게이션 요청 조회 오류:', error)
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    })

  } catch (error) {
    console.error('Navigation GET API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

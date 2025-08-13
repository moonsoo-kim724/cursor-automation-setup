import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

interface TypebotWebhookData {
  name?: string
  phone?: string
  date?: string
  branch?: string
  subIntent?: string
  freeText?: string
  source?: string
  timestamp?: string
}

export async function POST(request: NextRequest) {
  try {
    // CORS 헤더 설정
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    }

    // 요청 데이터 파싱
    const body = await request.json()
    console.log('Typebot webhook received:', body)

    const webhookData: TypebotWebhookData = {
      name: body.name || '',
      phone: body.phone || '',
      date: body.date || '',
      branch: body.branch || '',
      subIntent: body.subIntent || '',
      freeText: body.freeText || '',
      source: body.source || 'typebot',
      timestamp: body.timestamp || new Date().toISOString()
    }

    // 필수 데이터 검증
    if (!webhookData.name && !webhookData.freeText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name or free text is required',
          received: body
        },
        { status: 400, headers }
      )
    }

    // Supabase 클라이언트 확인
    if (!supabase) {
      console.log('Supabase not configured, using mock response')
      return NextResponse.json(
        {
          success: true,
          message: 'Lead data received (mock mode)',
          mock: true,
          data: webhookData
        },
        { status: 200, headers }
      )
    }

    // 리드 데이터 저장
    const leadData = {
      name: webhookData.name || '익명',
      phone: webhookData.phone || '',
      email: '', // 타입봇에서는 이메일 수집하지 않음
      service_type: webhookData.branch || 'general',
      preferred_date: webhookData.date || null,
      preferred_time: '', // 타입봇에서는 시간 수집하지 않음
      symptoms: webhookData.freeText || `${webhookData.branch} 관련 상담 (${webhookData.subIntent})`,
      source: webhookData.source,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save lead data',
          details: error.message
        },
        { status: 500, headers }
      )
    }

    console.log('Lead saved successfully:', data)

    // 성공 시 이메일 알림 발송 (선택적)
    try {
      await sendNotificationEmail(leadData)
    } catch (emailError) {
      console.error('Email notification failed:', emailError)
      // 이메일 실패는 전체 프로세스를 중단시키지 않음
    }

    // Slack 알림 발송 (선택적)
    try {
      await sendSlackNotification(leadData)
    } catch (slackError) {
      console.error('Slack notification failed:', slackError)
      // Slack 실패는 전체 프로세스를 중단시키지 않음
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead data received and processed successfully',
        leadId: data[0]?.id,
        data: {
          name: leadData.name,
          serviceType: leadData.service_type,
          timestamp: leadData.created_at
        }
      },
      { status: 200, headers }
    )

  } catch (error) {
    console.error('Typebot webhook error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// 이메일 알림 발송 함수
async function sendNotificationEmail(leadData: any) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email notification')
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YSK Eye Clinic <noreply@ysk-eye.ai>',
        to: ['admin@ysk-eye.clinic'], // 병원 관리자 이메일
        subject: `[연수김안과] 새로운 타입봇 상담 신청 - ${leadData.name}님`,
        html: `
          <h2>새로운 타입봇 상담 신청이 접수되었습니다</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>상담자 정보</h3>
            <p><strong>성함:</strong> ${leadData.name}</p>
            <p><strong>연락처:</strong> ${leadData.phone || '미제공'}</p>
            <p><strong>상담 분야:</strong> ${leadData.service_type}</p>
            <p><strong>희망 날짜:</strong> ${leadData.preferred_date || '미지정'}</p>
            <p><strong>증상/문의:</strong> ${leadData.symptoms}</p>
            <p><strong>접수 시간:</strong> ${new Date(leadData.created_at).toLocaleString('ko-KR')}</p>
            <p><strong>출처:</strong> 타입봇 눈콩이</p>
          </div>
          <p>관리자 대시보드에서 자세한 내용을 확인하고 고객에게 연락해 주세요.</p>
        `
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status}`)
    }

    console.log('Notification email sent successfully')
  } catch (error) {
    console.error('Failed to send notification email:', error)
    throw error
  }
}

// Slack 알림 발송 함수
async function sendSlackNotification(leadData: any) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.log('Slack webhook URL not configured, skipping Slack notification')
    return
  }

  try {
    const slackMessage = {
      text: `🏥 연수김안과 - 새로운 타입봇 상담 신청`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🤖 타입봇 눈콩이 상담 신청"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*성함:*\n${leadData.name}`
            },
            {
              type: "mrkdwn",
              text: `*연락처:*\n${leadData.phone || '미제공'}`
            },
            {
              type: "mrkdwn",
              text: `*상담 분야:*\n${leadData.service_type}`
            },
            {
              type: "mrkdwn",
              text: `*희망 날짜:*\n${leadData.preferred_date || '미지정'}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*증상/문의:*\n${leadData.symptoms}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `접수 시간: ${new Date(leadData.created_at).toLocaleString('ko-KR')} | 출처: 타입봇`
            }
          ]
        }
      ]
    }

    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`)
    }

    console.log('Slack notification sent successfully')
  } catch (error) {
    console.error('Failed to send Slack notification:', error)
    throw error
  }
}

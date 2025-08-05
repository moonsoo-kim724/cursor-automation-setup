'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Calendar, Mic, MicOff, Phone, Send, User, Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from './badge'
import { Button } from './button'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  typing?: boolean
  suggestions?: string[]
  bookingInfo?: {
    type: 'consultation' | 'examination' | 'surgery'
    urgency: 'low' | 'medium' | 'high'
    department: string
    customGPTs?: boolean // 고급 AI 상담사 연결 옵션
  }
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  onBookingRequest?: (info: any) => void
  language?: 'ko' | 'en' | 'zh'
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'system',
    content: '🏥 연수김안과의원 AI 상담 시스템에 오신 것을 환영합니다.\n\n⚠️ 의료법 준수 안내:\n• 본 상담은 의료진의 직접 진료를 대체하지 않습니다\n• 정확한 진단과 처방은 내원 후 전문의와 상담하시기 바랍니다\n• 응급상황 시에는 즉시 응급실로 내원하시기 바랍니다\n\n어떤 안과 관련 궁금증이 있으신가요?',
    timestamp: new Date()
  },
  {
    id: '2',
    role: 'assistant',
    content: '안녕하세요! 저는 YSK-EyeCare AI Agent입니다. 30년 경력의 연수김안과 전문 지식을 바탕으로 도움을 드리겠습니다.\n\n🤖 더 전문적인 상담이 필요하시면 "고급 AI 상담사"와 연결할 수 있습니다.\n\n다음 중 어떤 것이 궁금하신가요?',
    timestamp: new Date(),
    suggestions: [
      '고급 AI 상담사 연결',
      '시력교정술 (라식/라섹/스마일)',
      '백내장 수술',
      '노안 교정',
      '안구건조증 치료',
      '소아 안과 진료'
    ]
  }
]

const EXPERT_RESPONSES = {
  ko: {
    lasik: {
      title: '시력교정술 (라식/라섹/스마일)',
      content: '**시력교정술 종류별 특징:**\n\n🔹 **라식 (LASIK)**\n• 빠른 회복 (1-2일)\n• 통증 최소화\n• 각막 두께 충분한 경우 적합\n\n🔹 **라섹 (LASEK)**\n• 각막 두께 얇은 경우 적합\n• 충격에 강함\n• 회복 기간 3-5일\n\n🔹 **스마일 (SMILE)**\n• 최소 절개 (2-3mm)\n• 안구건조증 위험 낮음\n• 최신 기술\n\n**수술 전 검사 항목:**\n• 각막 두께 측정\n• 각막 지형도 검사\n• 안압 측정\n• 동공 크기 검사',
      bookingInfo: {
        type: 'examination' as const,
        urgency: 'medium' as const,
        department: '시력교정센터'
      }
    },
    cataract: {
      title: '백내장 수술',
      content: '**백내장 수술 정보:**\n\n🔹 **수술 시기**\n• 일상생활 불편함 시작\n• 시력 0.5 이하로 저하\n• 운전, 독서 등 활동 제한\n\n🔹 **인공수정체 종류**\n• 단초점: 기본 보험 적용\n• 다초점: 원거리/근거리 동시 교정\n• 난시교정: 기존 난시 함께 교정\n\n🔹 **수술 과정**\n• 국소마취 (점안마취)\n• 소절개 (2.2mm)\n• 초음파 유화술\n• 당일 귀가 가능',
      bookingInfo: {
        type: 'consultation' as const,
        urgency: 'medium' as const,
        department: '백내장센터'
      }
    },
    presbyopia: {
      title: '노안 교정',
      content: '**노안 교정 방법:**\n\n🔹 **수술적 치료**\n• 다초점 인공수정체\n• 모노비전 라식\n• 각막 인레이\n\n🔹 **비수술적 치료**\n• 다초점 콘택트렌즈\n• 누진 다초점 안경\n• 독서용 돋보기\n\n🔹 **수술 적합성**\n• 연령: 40세 이상\n• 백내장 동반 여부\n• 각막 상태 검사 필요',
      bookingInfo: {
        type: 'consultation' as const,
        urgency: 'low' as const,
        department: '노안교정센터'
      }
    }
  },
  en: {
    lasik: {
      title: 'Vision Correction Surgery (LASIK/LASEK/SMILE)',
      content: '**Types of Vision Correction:**\n\n🔹 **LASIK**\n• Fast recovery (1-2 days)\n• Minimal pain\n• Suitable for sufficient corneal thickness\n\n🔹 **LASEK**\n• Suitable for thin corneas\n• Impact resistant\n• Recovery period 3-5 days\n\n🔹 **SMILE**\n• Minimal incision (2-3mm)\n• Lower dry eye risk\n• Latest technology\n\n**Pre-surgery examination:**\n• Corneal thickness measurement\n• Corneal topography\n• Intraocular pressure\n• Pupil size assessment',
      bookingInfo: {
        type: 'examination' as const,
        urgency: 'medium' as const,
        department: 'Vision Correction Center'
      }
    },
    cataract: {
      title: 'Cataract Surgery',
      content: '**Cataract Surgery Information:**\n\n🔹 **Surgery Timing**\n• When daily activities are affected\n• Vision drops below 0.5\n• Driving, reading limitations\n\n🔹 **Intraocular Lens Types**\n• Monofocal: Basic insurance coverage\n• Multifocal: Distance/near vision correction\n• Toric: Astigmatism correction\n\n🔹 **Surgery Process**\n• Local anesthesia (eye drops)\n• Small incision (2.2mm)\n• Phacoemulsification\n• Same-day discharge',
      bookingInfo: {
        type: 'consultation' as const,
        urgency: 'medium' as const,
        department: 'Cataract Center'
      }
    },
    presbyopia: {
      title: 'Presbyopia Correction',
      content: '**Presbyopia Correction Methods:**\n\n🔹 **Surgical Treatment**\n• Multifocal intraocular lens\n• Monovision LASIK\n• Corneal inlay\n\n🔹 **Non-surgical Treatment**\n• Multifocal contact lenses\n• Progressive glasses\n• Reading glasses\n\n🔹 **Surgery Suitability**\n• Age: 40 years and above\n• Cataract assessment\n• Corneal condition evaluation',
      bookingInfo: {
        type: 'consultation' as const,
        urgency: 'low' as const,
        department: 'Presbyopia Correction Center'
      }
    }
  },
  zh: {
    lasik: {
      title: '视力矫正手术 (LASIK/LASEK/SMILE)',
      content: '**视力矫正手术类型:**\n\n🔹 **LASIK 激光手术**\n• 恢复快 (1-2天)\n• 疼痛最小\n• 适合角膜厚度充足者\n\n🔹 **LASEK 激光手术**\n• 适合角膜较薄者\n• 抗冲击力强\n• 恢复期 3-5天\n\n🔹 **SMILE 微笑手术**\n• 微创切口 (2-3mm)\n• 干眼症风险低\n• 最新技术\n\n**术前检查项目:**\n• 角膜厚度测量\n• 角膜地形图检查\n• 眼压测量\n• 瞳孔大小检查',
      bookingInfo: {
        type: 'examination' as const,
        urgency: 'medium' as const,
        department: '视力矫正中心'
      }
    },
    cataract: {
      title: '白内障手术',
      content: '**白内障手术信息:**\n\n🔹 **手术时机**\n• 日常生活受影响时\n• 视力低于0.5\n• 驾驶、阅读受限\n\n🔹 **人工晶状体类型**\n• 单焦点：基本保险覆盖\n• 多焦点：远近视力矫正\n• 散光矫正：散光校正\n\n🔹 **手术过程**\n• 局部麻醉（滴眼液）\n• 小切口（2.2mm）\n• 超声乳化术\n• 当日出院',
      bookingInfo: {
        type: 'consultation' as const,
        urgency: 'medium' as const,
        department: '白内障中心'
      }
    },
    presbyopia: {
      title: '老花眼矫正',
      content: '**老花眼矫正方法:**\n\n🔹 **手术治疗**\n• 多焦点人工晶状体\n• 单视激光手术\n• 角膜植入物\n\n🔹 **非手术治疗**\n• 多焦点隐形眼镜\n• 渐进多焦点眼镜\n• 老花镜\n\n🔹 **手术适应性**\n• 年龄：40岁以上\n• 白内障评估\n• 角膜状态检查',
      bookingInfo: {
        type: 'consultation' as const,
        urgency: 'low' as const,
        department: '老花眼矫正中心'
      }
    }
  }
}

const LANGUAGE_CONTENT = {
  ko: {
    placeholder: '안과 관련 궁금한 점을 물어보세요...',
    send: '전송',
    booking: '예약하기',
    call: '전화상담',
    typing: 'AI가 답변 중입니다...',
    disclaimer: '⚠️ 본 상담은 의료진 진료를 대체하지 않습니다',
    emergencyNotice: '응급상황 시 즉시 응급실 방문',
    aiAgent: 'YSK-EyeCare AI Agent'
  },
  en: {
    placeholder: 'Ask about eye care...',
    send: 'Send',
    booking: 'Book Appointment',
    call: 'Phone Consultation',
    typing: 'AI is responding...',
    disclaimer: '⚠️ This consultation does not replace medical examination',
    emergencyNotice: 'For emergencies, visit ER immediately',
    aiAgent: 'YSK-EyeCare AI Agent'
  },
  zh: {
    placeholder: '询问眼科相关问题...',
    send: '发送',
    booking: '预约',
    call: '电话咨询',
    typing: 'AI正在回复...',
    disclaimer: '⚠️ 本咨询不能替代医生诊疗',
    emergencyNotice: '紧急情况请立即就医',
    aiAgent: 'YSK-EyeCare AI Agent'
  }
}

export function Chatbot({ isOpen, onClose, onBookingRequest, language = 'ko' }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = LANGUAGE_CONTENT[language]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSuggestionClick = (suggestion: string) => {
    // Custom GPTs 연결 처리
    if (suggestion === '고급 AI 상담사 연결') {
      const customGPTsUrl = process.env.NEXT_PUBLIC_CUSTOM_GPTS_URL || 'https://chat.openai.com/g/g-your_custom_gpts_id'
      window.open(customGPTsUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')

      const gptMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '🚀 고급 AI 상담사와 연결되었습니다! 새 창에서 전문적인 안과 상담을 받으세요.',
        timestamp: new Date(),
        suggestions: ['상담 완료 후 예약', '전화 상담', '돌아가기']
      }
      setMessages(prev => [...prev, gptMessage])
      return
    }

    // 기존 제안 처리
    setInputValue(suggestion)
    handleSend(suggestion)
  }

  const handleSend = async (message?: string) => {
    const messageText = message || inputValue.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // 실제 API 호출
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          language
        })
      })

      if (!response.ok) {
        throw new Error('API 호출 실패')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || '죄송합니다. 다시 시도해주세요.',
        timestamp: new Date(),
        suggestions: data.suggestions || [],
        bookingInfo: data.bookingInfo
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chatbot Error:', error)

      // 폴백: Custom GPTs 연결 제안
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `현재 AI 시스템에 문제가 있습니다. 더 전문적인 상담을 위해 고급 AI 상담사와 연결하시겠습니까?`,
        timestamp: new Date(),
        suggestions: ['고급 AI 상담사 연결', '전화 상담', '예약하기'],
        bookingInfo: {
          type: 'consultation',
          urgency: 'medium',
          department: '안과',
          customGPTs: true
        }
      }

      setMessages(prev => [...prev, fallbackMessage])
    }

    setIsTyping(false)
  }

  const generateResponse = (message: string, lang: 'ko' | 'en' | 'zh') => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('라식') || lowerMessage.includes('라섹') || lowerMessage.includes('스마일') ||
        lowerMessage.includes('lasik') || lowerMessage.includes('lasek') || lowerMessage.includes('smile') ||
        lowerMessage.includes('시력교정') || lowerMessage.includes('vision correction')) {
      return {
        content: EXPERT_RESPONSES[lang]?.lasik?.content || EXPERT_RESPONSES.ko.lasik.content,
        suggestions: ['예약 문의', '비용 문의', '회복 기간', '부작용'],
        bookingInfo: EXPERT_RESPONSES[lang]?.lasik?.bookingInfo || EXPERT_RESPONSES.ko.lasik.bookingInfo
      }
    }

    if (lowerMessage.includes('백내장') || lowerMessage.includes('cataract') || lowerMessage.includes('白内障')) {
      return {
        content: EXPERT_RESPONSES[lang]?.cataract?.content || EXPERT_RESPONSES.ko.cataract.content,
        suggestions: ['수술 시기', '인공수정체 종류', '보험 적용', '수술 과정'],
        bookingInfo: EXPERT_RESPONSES[lang]?.cataract?.bookingInfo || EXPERT_RESPONSES.ko.cataract.bookingInfo
      }
    }

    if (lowerMessage.includes('노안') || lowerMessage.includes('presbyopia') || lowerMessage.includes('老花')) {
      return {
        content: EXPERT_RESPONSES[lang]?.presbyopia?.content || EXPERT_RESPONSES.ko.presbyopia.content,
        suggestions: ['수술 방법', '적합성 검사', '비용 문의', '회복 기간'],
        bookingInfo: EXPERT_RESPONSES[lang]?.presbyopia?.bookingInfo || EXPERT_RESPONSES.ko.presbyopia.bookingInfo
      }
    }

    // 기본 응답
    return {
      content: lang === 'ko'
        ? '안과 관련 궁금한 점을 더 구체적으로 말씀해 주시면 정확한 정보를 제공해드리겠습니다. 시력교정술, 백내장, 노안 등 어떤 부분이 궁금하신가요?'
        : lang === 'en'
        ? 'Please provide more specific details about your eye care concerns. I can help with vision correction, cataracts, presbyopia, and other eye conditions.'
        : '请提供更具体的眼科问题，我可以帮助您了解视力矫正、白内障、老花眼等眼科疾病信息。',
      suggestions: lang === 'ko'
        ? ['시력교정술', '백내장', '노안', '안구건조증', '소아안과', '응급상황']
        : lang === 'en'
        ? ['Vision Correction', 'Cataract', 'Presbyopia', 'Dry Eyes', 'Pediatric', 'Emergency']
        : ['视力矫正', '白内障', '老花眼', '干眼症', '小儿眼科', '急诊']
    }
  }

  const handleBooking = (bookingInfo: any) => {
    if (bookingInfo?.customGPTs) {
      // Custom GPTs 연결
      const customGPTsUrl = process.env.NEXT_PUBLIC_CUSTOM_GPTS_URL || 'https://chat.openai.com/g/g-your_custom_gpts_id'

      // 새 창으로 GPTs 열기
      const gptWindow = window.open(customGPTsUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')

      if (gptWindow) {
        // GPTs 창이 열렸다는 메시지 추가
        const gptMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '🚀 고급 AI 상담사와 연결되었습니다! 새 창에서 더 전문적인 상담을 받으실 수 있습니다.',
          timestamp: new Date(),
          suggestions: ['상담 계속하기', '예약하기', '전화 상담']
        }
        setMessages(prev => [...prev, gptMessage])
      } else {
        // 팝업 차단된 경우
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용하거나 아래 링크를 클릭해주세요.',
          timestamp: new Date(),
          suggestions: [`고급 AI 상담사 링크: ${customGPTsUrl}`, '전화 상담', '예약하기']
        }
        setMessages(prev => [...prev, errorMessage])
      }
      return
    }

    // 기존 예약 처리
    if (onBookingRequest) {
      onBookingRequest(bookingInfo)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-8 w-8" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{t.aiAgent}</h3>
              <p className="text-sm text-white/80">연수김안과의원 AI 상담</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('tel:032-123-4567')}
              className="text-white hover:bg-white/20"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-brand-primary-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-brand-primary-600" />
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-brand-secondary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-brand-secondary-600" />
                      </div>
                    )}
                  </div>

                  <div className={`rounded-2xl p-3 ${
                    message.role === 'user'
                      ? 'bg-brand-secondary-600 text-white'
                      : message.role === 'system'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>

                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {message.bookingInfo && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleBooking(message.bookingInfo)}
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-3 w-3" />
                          {t.booking}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('tel:032-123-4567')}
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-3 w-3" />
                          {t.call}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
                <Bot className="h-4 w-4 text-brand-primary-600" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-brand-primary-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-primary-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-brand-primary-600 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-sm text-gray-600">{t.typing}</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {t.disclaimer}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleListening}
                  className={`h-8 w-8 p-0 ${isListening ? 'text-red-500' : 'text-gray-500'}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSpeech}
                  className={`h-8 w-8 p-0 ${isSpeaking ? 'text-blue-500' : 'text-gray-500'}`}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="h-12 w-12 rounded-2xl p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Chatbot

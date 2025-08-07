'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Send, X } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './button'
import { Input } from './input'

interface LeadData {
  name: string
  phone: string
  email?: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  symptoms?: string
  source: 'leadbot' | 'typebot'
}

interface Message {
  id: string
  type: 'bot' | 'user' | 'system'
  content: string
  timestamp: Date
  options?: Array<{
    id: string
    label: string
    value: string
  }>
  inputType?: 'text' | 'tel' | 'email' | 'date' | 'time' | 'textarea'
  validation?: (value: string) => string | null
}

interface LeadbotProps {
  isOpen: boolean
  onClose: () => void
  onLeadSubmit?: (leadData: LeadData) => void
  className?: string
}

const SERVICE_TYPES = [
  { id: 'consultation', label: '🩺 일반 진료 상담', value: 'consultation' },
  { id: 'lasik', label: '👁️ 시력교정술 (라식/라섹/스마일)', value: 'lasik' },
  { id: 'cataract', label: '🔍 백내장 수술 상담', value: 'cataract' },
  { id: 'presbyopia', label: '📖 노안 교정 상담', value: 'presbyopia' },
  { id: 'dry-eye', label: '💧 안구건조증 치료', value: 'dry-eye' },
  { id: 'exam', label: '🔬 정밀 검사 예약', value: 'exam' },
]

const TIME_SLOTS = [
  { id: 'morning', label: '🌅 오전 (09:00-12:00)', value: 'morning' },
  { id: 'afternoon', label: '☀️ 오후 (14:00-17:00)', value: 'afternoon' },
  { id: 'evening', label: '🌆 저녁 (17:00-18:00)', value: 'evening' },
]

export function Leadbot({ isOpen, onClose, onLeadSubmit, className }: LeadbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [leadData, setLeadData] = useState<Partial<LeadData>>({ source: 'leadbot' })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 대화 플로우 정의 - Enhanced UX (useMemo로 최적화)
  const conversationFlow = React.useMemo(() => [
    {
      id: 'welcome',
      botMessage: '안녕하세요! 연수김안과의원입니다 👋\n\n30년 전문 경력의 안과 전문의와 함께하는 빠른 예약 상담을 시작하겠습니다.\n\n먼저 성함을 알려주시겠어요?',
      field: 'name',
      inputType: 'text' as const,
      validation: (value: string) => {
        if (!value.trim()) return '성함을 입력해주세요.'
        if (value.trim().length < 2) return '성함은 2자 이상 입력해주세요.'
        if (value.trim().length > 20) return '성함은 20자 이하로 입력해주세요.'
        return null
      }
    },
    {
      id: 'phone',
      botMessage: (name: string) => `${name}님, 반갑습니다! 🤝\n\n예약 확인과 진료 안내를 위해 연락처를 알려주세요.\n휴대폰 번호를 입력해 주시면 됩니다.\n\n📱 예시: 010-1234-5678`,
      field: 'phone',
      inputType: 'tel' as const,
      validation: (value: string) => {
        const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
        if (!value.trim()) return '연락처를 입력해주세요.'
        const cleanPhone = value.replace(/-/g, '')
        if (!phoneRegex.test(cleanPhone)) return '올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)'
        return null
      }
    },
    {
      id: 'service',
      botMessage: '어떤 진료를 원하시나요? 👁️\n\n연수김안과의원의 전문 진료 분야 중에서 선택해주세요:',
      field: 'serviceType',
      inputType: 'options' as const,
      options: SERVICE_TYPES
    },
    {
      id: 'date',
      botMessage: '언제 방문을 희망하시나요? 📅\n\n진료 일정 조율을 위해 희망하시는 날짜를 선택해주세요.\n토요일도 진료 가능합니다!',
      field: 'preferredDate',
      inputType: 'date' as const,
      validation: (value: string) => {
        if (!value) return '희망 날짜를 선택해주세요.'
        const selectedDate = new Date(value)
        const today = new Date()
        const maxDate = new Date()
        maxDate.setDate(today.getDate() + 90) // 3개월 후까지
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) return '오늘 이후 날짜를 선택해주세요.'
        if (selectedDate > maxDate) return '3개월 이내 날짜를 선택해주세요.'
        return null
      }
    },
    {
      id: 'time',
      botMessage: '희망 시간대를 알려주세요 ⏰\n\n진료 시간에 맞춰 최적의 예약 시간을 안내해드리겠습니다:',
      field: 'preferredTime',
      inputType: 'options' as const,
      options: TIME_SLOTS
    },
    {
      id: 'symptoms',
      botMessage: '마지막으로, 궁금한 점이나 증상이 있으시면 자유롭게 말씀해주세요 ✍️\n\n전문의가 미리 파악하여 더 정확한 진료를 도와드릴게요.\n(없으시면 "없음"이라고 입력해주세요)',
      field: 'symptoms',
      inputType: 'textarea' as const,
      validation: () => null // 선택사항이므로 검증 없음
    }
  ], [])

  // 메시지 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 초기 메시지 설정
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeStep = conversationFlow[0]
      const botMessage = typeof welcomeStep.botMessage === 'function'
        ? welcomeStep.botMessage(leadData.name || '')
        : welcomeStep.botMessage
      addBotMessage(botMessage)
    }
  }, [isOpen, messages.length, conversationFlow, leadData.name])

  // 봇 메시지 추가
  const addBotMessage = (content: string, options?: Message['options']) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      options
    }
    setMessages(prev => [...prev, message])
  }

  // 사용자 메시지 추가
  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
  }

  // 시스템 메시지 추가
  const addSystemMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
    
    // 스크린 리더를 위한 실시간 알림
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'assertive')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = content.replace(/[⚠️❌✅🎉📋📞💡]/g, '') // 이모지 제거
    document.body.appendChild(announcement)
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement)
      }
    }, 1000)
  }

  // 다음 단계로 진행
  const proceedToNextStep = async (value: string) => {
    const currentStepData = conversationFlow[currentStep]

    // 데이터 저장
    setLeadData(prev => ({
      ...prev,
      [currentStepData.field]: value
    }))

    // 사용자 입력 메시지 추가
    addUserMessage(value)

    // 로딩 표시
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 실제 봇처럼 대기
    setIsLoading(false)

    // 다음 단계로
    const nextStep = currentStep + 1

    if (nextStep < conversationFlow.length) {
      setCurrentStep(nextStep)
      const nextStepData = conversationFlow[nextStep]

      let botMessage = typeof nextStepData.botMessage === 'function'
        ? nextStepData.botMessage(leadData.name || '')
        : nextStepData.botMessage

      if (nextStepData.inputType === 'options') {
        addBotMessage(botMessage, nextStepData.options)
      } else {
        addBotMessage(botMessage)
      }
    } else {
      // 모든 단계 완료 - 데이터 제출
      await handleSubmitLead()
    }

    setInputValue('')
  }

  // 리드 데이터 제출
  const handleSubmitLead = async () => {
    setIsSubmitting(true)

    try {
      const completedLeadData: LeadData = {
        name: leadData.name || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        serviceType: leadData.serviceType || '',
        preferredDate: leadData.preferredDate || '',
        preferredTime: leadData.preferredTime || '',
        symptoms: leadData.symptoms && leadData.symptoms !== '없음' && leadData.symptoms !== '완료' ? leadData.symptoms : '',
        source: 'leadbot'
      }

      // API 호출
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completedLeadData),
      })

      const result = await response.json()

      if (response.ok) {
        addSystemMessage('✅ 예약 신청이 완료되었습니다!')
        addBotMessage(`🎉 ${leadData.name}님, 예약 신청이 성공적으로 접수되었습니다!

📋 **예약 정보 요약**
• 진료 분야: ${leadData.serviceType}
• 희망 날짜: ${leadData.preferredDate}
• 희망 시간: ${leadData.preferredTime}

📞 **다음 단계**
담당자가 1시간 내에 연락드려 정확한 예약 시간을 확정하겠습니다.

🏥 **연락처**
• 대표전화: 032-817-3487
• 카카오톡: 연수김안과
• 주소: 인천 연수구 송도국제대로 123

30년 전문 경력으로 최고의 진료를 약속드립니다! 👨‍⚕️`)

        // 부모 컴포넌트에 알림
        onLeadSubmit?.(completedLeadData)

        // 7초 후 자동 닫기
        setTimeout(() => {
          onClose()
          resetChat()
        }, 7000)

      } else {
        addSystemMessage('❌ 예약 신청 중 오류가 발생했습니다.')
        addBotMessage('죄송합니다. 일시적인 오류가 발생했습니다.\n직접 전화(032-817-3487)로 연락주시거나 잠시 후 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('Lead submission error:', error)
      addSystemMessage('❌ 네트워크 오류가 발생했습니다.')
      addBotMessage('네트워크 연결을 확인하고 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 입력 처리 - Enhanced Error Handling
  const handleInputSubmit = () => {
    if (!inputValue.trim() || isLoading || isSubmitting) return

    const currentStepData = conversationFlow[currentStep]

    // 유효성 검사 및 향상된 에러 처리
    if (currentStepData.validation) {
      const error = currentStepData.validation(inputValue.trim())
      if (error) {
        // 에러 메시지와 함께 도움말 제공
        const helpMessage = getValidationHelpMessage(currentStepData.field, error)
        addSystemMessage(`⚠️ ${error}${helpMessage ? '\n💡 ' + helpMessage : ''}`)
        
        // 입력 필드 포커스 유지를 위한 작은 딜레이
        setTimeout(() => {
          const inputElement = document.querySelector('input') as HTMLInputElement
          inputElement?.focus()
        }, 100)
        return
      }
    }

    proceedToNextStep(inputValue.trim())
  }

  // 유효성 검사 도움말 메시지
  const getValidationHelpMessage = (field: string, error: string): string => {
    switch (field) {
      case 'name':
        return '한글 또는 영문으로 실명을 입력해주세요.'
      case 'phone':
        return '010, 011, 016, 017, 018, 019로 시작하는 번호를 입력해주세요.'
      case 'preferredDate':
        if (error.includes('오늘 이후')) {
          return '진료는 내일부터 예약 가능합니다.'
        }
        if (error.includes('3개월')) {
          return '장기 예약은 전화 상담을 통해 도와드리겠습니다.'
        }
        break
      default:
        return ''
    }
    return ''
  }

  // 옵션 선택 처리
  const handleOptionSelect = (option: { id: string; label: string; value: string }) => {
    if (isLoading || isSubmitting) return
    proceedToNextStep(option.label)
  }

  // 채팅 리셋
  const resetChat = () => {
    setMessages([])
    setCurrentStep(0)
    setLeadData({ source: 'leadbot' })
    setInputValue('')
    setIsLoading(false)
    setIsSubmitting(false)
  }

  // 키보드 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleInputSubmit()
    }
  }

  if (!isOpen) return null

  const currentStepData = conversationFlow[currentStep]
  const showOptions = currentStepData?.inputType === 'options' && currentStep < conversationFlow.length
  const showInput = currentStepData?.inputType !== 'options' && currentStep < conversationFlow.length && !isSubmitting

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-4 p-2", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-2xl md:rounded-2xl rounded-xl shadow-xl border border-gray-200 w-full max-w-lg md:max-h-[85vh] h-[calc(100vh-1rem)] md:h-auto flex flex-col overflow-hidden"
      >
        {/* 헤더 - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-secondary-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-3 w-3 md:h-4 md:w-4 bg-green-500 rounded-full border-2 border-white"
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">빠른 예약 상담</h3>
                <p className="text-xs md:text-sm text-gray-600">연수김안과의원 • AI 상담 봇</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg h-8 w-8 md:h-auto md:w-auto md:px-3"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
          
          {/* 진행률 표시 - Mobile Optimized */}
          <div className="mt-3 md:mt-4">
            <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-2">
              <span className="font-medium">예약 진행률</span>
              <span className="font-semibold">{Math.round((currentStep / conversationFlow.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
              <motion.div
                className="bg-gradient-to-r from-brand-secondary-600 to-brand-accent-500 h-1.5 md:h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / conversationFlow.length) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / conversationFlow.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 메시지 영역 - Mobile Optimized */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50/30 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "flex",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type !== 'user' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-brand-secondary-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-600">AI 상담</span>
                    </div>
                  )}

                  <div className={cn(
                    "rounded-2xl p-4 shadow-sm border whitespace-pre-wrap",
                    message.type === 'bot' && "bg-white text-gray-800 border-gray-200",
                    message.type === 'user' && "bg-black text-white border-black ml-6",
                    message.type === 'system' && "bg-blue-50 text-blue-800 border-blue-200 text-sm"
                  )}>
                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>

                    {/* 옵션 버튼들 - Enhanced */}
                    {message.options && (
                      <div className="mt-4 space-y-2" role="listbox" aria-label="선택 가능한 옵션들">
                        {message.options.map((option, index) => (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleOptionSelect(option)}
                            disabled={isLoading || isSubmitting}
                            role="option"
                            aria-selected="false"
                            aria-describedby={`option-${option.id}-description`}
                            aria-label={`옵션 선택: ${option.label}`}
                            className="w-full px-4 py-3 text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand-secondary-300 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:ring-offset-2"
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 로딩 표시 - Enhanced */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="w-6 h-6 bg-brand-secondary-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-3 w-3 text-white" />
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-brand-secondary-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-secondary-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-brand-secondary-600 rounded-full animate-bounce delay-200" />
                </div>
                <span className="text-sm text-gray-600 font-medium">상담사가 답변 중...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 - Mobile Optimized */}
        {showInput && (
          <div className="border-t border-gray-200 p-4 md:p-6 bg-white">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex-1 relative">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentStepData?.inputType === 'tel' ? '010-1234-5678' :
                    currentStepData?.inputType === 'date' ? '날짜 선택' :
                    currentStepData?.inputType === 'textarea' ? '자유롭게 입력해주세요...' :
                    '입력해주세요...'
                  }
                  type={currentStepData?.inputType === 'date' ? 'date' :
                        currentStepData?.inputType === 'tel' ? 'tel' : 'text'}
                  disabled={isLoading || isSubmitting}
                  aria-label={
                    currentStepData?.inputType === 'tel' ? '전화번호 입력' :
                    currentStepData?.field === 'name' ? '성함 입력' :
                    currentStepData?.inputType === 'date' ? '희망 날짜 선택' :
                    currentStepData?.inputType === 'textarea' ? '증상 및 문의사항 입력' :
                    '정보 입력'
                  }
                  aria-describedby="input-description"
                  aria-required="true"
                  aria-invalid="false"
                  autoComplete={
                    currentStepData?.inputType === 'tel' ? 'tel' :
                    currentStepData?.field === 'name' ? 'name' : 'off'
                  }
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 rounded-lg md:rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 focus:border-brand-secondary-500 transition-colors placeholder-gray-500 text-sm md:text-base"
                />
                {/* 스크린 리더용 입력 안내 */}
                <div id="input-description" className="sr-only">
                  {currentStepData?.inputType === 'tel' ? '휴대폰 번호는 010으로 시작하는 11자리를 입력하세요.' :
                   currentStepData?.field === 'name' ? '성함은 한글 또는 영문 2~20자로 입력하세요.' :
                   currentStepData?.inputType === 'date' ? '진료를 원하는 날짜를 선택하세요.' :
                   currentStepData?.inputType === 'textarea' ? '궁금한 점이나 증상을 자유롭게 입력하세요. 선택사항입니다.' :
                   '필수 정보를 입력해주세요.'}
                </div>
              </div>
              <Button
                onClick={handleInputSubmit}
                disabled={!inputValue.trim() || isLoading || isSubmitting}
                variant="default"
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl p-0 bg-black hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

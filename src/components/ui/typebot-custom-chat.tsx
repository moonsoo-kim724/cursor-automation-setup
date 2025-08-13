"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Phone, Calendar, MessageCircle } from 'lucide-react'
import { Button } from './button'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  isChoice?: boolean
  choices?: Array<{
    id: string
    label: string
    value: string
  }>
}

interface TypebotSession {
  sessionId: string
  isActive: boolean
}

export function TypebotCustomChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<TypebotSession | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const TYPEBOT_ID = 'nunkongi-blueprint-json-y7v385v'
  const BASE_URL = 'https://typebot.io/api/v1'

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 타입봇 세션 시작
  const startTypebotSession = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${BASE_URL}/typebots/${TYPEBOT_ID}/startChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('타입봇 세션 시작 실패')
      }

      const data = await response.json()
      
      setSession({
        sessionId: data.sessionId,
        isActive: true
      })

      // 첫 번째 메시지 처리
      if (data.messages && data.messages.length > 0) {
        const botMessages: Message[] = data.messages.map((msg: any, index: number) => ({
          id: `bot-${Date.now()}-${index}`,
          type: 'bot' as const,
          content: msg.content?.richText?.[0]?.children?.[0]?.text || msg.content || '안녕하세요! 눈콩이입니다! 👋',
          timestamp: new Date(),
          isChoice: msg.type === 'choice',
          choices: msg.items?.map((item: any) => ({
            id: item.id,
            label: item.content,
            value: item.content
          }))
        }))
        
        setMessages(botMessages)
      }

    } catch (error) {
      console.error('타입봇 세션 시작 오류:', error)
      // 폴백 메시지
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: '안녕하세요! 눈콩이와 함께 눈 건강 상담을 시작해볼까요? 😊\n\n다음 중 궁금한 것을 선택해주세요:',
        timestamp: new Date(),
        isChoice: true,
        choices: [
          { id: 'vision', label: '시력교정술 (매일 쓰던 안경, 이젠 안녕!)', value: '시력교정술' },
          { id: 'cataract', label: '노안·백내장 수술 (침침한 눈, 다시 선명하게)', value: '노안백내장' },
          { id: 'child', label: '소아안과·드림렌즈 (우리 아이 첫 눈 건강)', value: '소아안과' },
          { id: 'dry', label: '안구건조증·기타질환 (눈의 불편함, 시원하게 해결)', value: '안구건조증' },
          { id: 'urgent', label: '급해요! 바로 예약/상담', value: '예약상담' }
        ]
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 메시지 전송
  const sendMessage = async (messageText: string, isChoice = false) => {
    if (!messageText.trim() && !isChoice) return

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      if (session?.sessionId) {
        // 세션이 있으면 기존 대화 계속
        const response = await fetch(`${BASE_URL}/sessions/${session.sessionId}/continueChat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText
          })
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.messages && data.messages.length > 0) {
            const botMessages: Message[] = data.messages.map((msg: any, index: number) => ({
              id: `bot-${Date.now()}-${index}`,
              type: 'bot' as const,
              content: msg.content?.richText?.[0]?.children?.[0]?.text || msg.content || '답변을 처리 중입니다...',
              timestamp: new Date(),
              isChoice: msg.type === 'choice',
              choices: msg.items?.map((item: any) => ({
                id: item.id,
                label: item.content,
                value: item.content
              }))
            }))
            
            setMessages(prev => [...prev, ...botMessages])
          }
        } else {
          throw new Error('메시지 전송 실패')
        }
      } else {
        // 세션이 없으면 GPT API 사용 (폴백)
        const response = await fetch('/api/gpt/consultation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: messageText }
            ]
          })
        })

        if (response.ok) {
          const data = await response.json()
          const botMessage: Message = {
            id: `bot-${Date.now()}`,
            type: 'bot',
            content: data.response || '죄송합니다. 다시 시도해주세요.',
            timestamp: new Date()
          }
          
          setMessages(prev => [...prev, botMessage])
        }
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        type: 'bot',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요. 😅',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 선택지 클릭 처리
  const handleChoiceClick = (choice: { id: string; label: string; value: string }) => {
    sendMessage(choice.value, true)
  }

  // 챗봇 열기/닫기
  const toggleChat = () => {
    if (!isOpen && messages.length === 0) {
      startTypebotSession()
    }
    setIsOpen(!isOpen)
  }

  // 입력 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 챗봇 버튼 */}
      <Button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600 hover:from-brand-primary-700 hover:to-brand-secondary-700 shadow-lg transition-all duration-300 ${
          isOpen ? 'scale-110' : 'hover:scale-105'
        }`}
        size="icon"
      >
        {isOpen ? <MessageCircle className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </Button>

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[32rem] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">눈콩이</h3>
                <p className="text-xs opacity-90">연수김안과의원 AI 상담</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm" 
              onClick={toggleChat}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-brand-primary-600 text-white'
                    : 'bg-gradient-to-br from-brand-secondary-500 to-brand-accent-500 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[70%] ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-lg p-3 text-sm ${
                    message.type === 'user'
                      ? 'bg-brand-primary-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* 선택지 버튼들 */}
                  {message.isChoice && message.choices && (
                    <div className="mt-3 space-y-2">
                      {message.choices.map((choice) => (
                        <Button
                          key={choice.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleChoiceClick(choice)}
                          className="w-full text-left justify-start text-xs p-2 h-auto hover:bg-brand-primary-50 hover:border-brand-primary-300 transition-colors"
                        >
                          {choice.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-secondary-500 to-brand-accent-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="메시지를 입력하세요..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="px-3 bg-brand-primary-600 hover:bg-brand-primary-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendMessage('진료 예약하고 싶어요')}
                className="text-xs flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" />
                예약
              </Button>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => sendMessage('전화 상담 원해요')}
                className="text-xs flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                전화상담
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
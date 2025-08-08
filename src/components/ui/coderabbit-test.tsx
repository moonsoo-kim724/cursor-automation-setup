/**
 * CodeRabbit 테스트 컴포넌트
 * 이 컴포넌트는 CodeRabbit AI 리뷰 시스템의 동작을 테스트하기 위해 생성되었습니다.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface CodeRabbitTestProps {
  title?: string
  description?: string
  onTest?: () => void
}

export const CodeRabbitTest: React.FC<CodeRabbitTestProps> = ({
  title = 'CodeRabbit AI 테스트',
  description = 'AI 코드 리뷰 시스템 동작 확인',
  onTest
}) => {
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    // 컴포넌트 마운트 시 초기화
    console.log('CodeRabbit 테스트 컴포넌트가 마운트되었습니다.')
  }, [])

  const handleRunTest = async () => {
    setIsTestRunning(true)
    setTestResults([])

    try {
      // 테스트 항목들
      const testItems = [
        '🔒 보안 규칙 검증',
        '⚡ 성능 최적화 체크',
        '🎯 접근성 WCAG 2.1 AA 준수',
        '🧩 TypeScript 타입 안전성',
        '📱 반응형 디자인 확인',
        '🎨 YSK 브랜드 가이드라인',
        '🚀 Next.js 14 App Router 패턴',
        '🤖 의료법 준수 검증'
      ]

      for (let i = 0; i < testItems.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setTestResults(prev => [...prev, testItems[i]])
      }

      onTest?.()
    } catch (error) {
      console.error('테스트 실행 중 오류:', error)
    } finally {
      setIsTestRunning(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleRunTest} 
          disabled={isTestRunning}
          className="w-full"
          variant="default"
        >
          {isTestRunning ? '테스트 실행 중...' : 'CodeRabbit 테스트 시작'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">검증된 항목:</h3>
            <ul className="space-y-1">
              {testResults.map((result, index) => (
                <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isTestRunning && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">AI 코드 분석 진행중...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CodeRabbitTest
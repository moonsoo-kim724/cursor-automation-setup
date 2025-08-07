'use client'

import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StructuredData } from '../seo/structured-data'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { Badge } from './badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  order_index: number
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

const categoryLabels = {
  general: '일반',
  surgery: '수술',
  checkup: '검진',
  insurance: '보험'
} as const

const categoryColors = {
  general: 'bg-blue-100 text-blue-800',
  surgery: 'bg-red-100 text-red-800',
  checkup: 'bg-green-100 text-green-800',
  insurance: 'bg-yellow-100 text-yellow-800'
} as const

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  // FAQ 데이터 조회
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        if (!supabase) {
          console.warn('Supabase client not available')
          return
        }
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_published', true)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false })

        if (error) throw error
        setFaqs(data || [])
      } catch (error) {
        console.error('FAQ 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [supabase])

  // 조회수 증가
  const incrementViewCount = async (faqId: string) => {
    try {
      if (!supabase) {
        console.warn('Supabase client not available')
        return
      }
      await supabase
        .from('faqs')
        .update({
          view_count: (faqs.find(f => f.id === faqId)?.view_count || 0) + 1
        })
        .eq('id', faqId)
    } catch (error) {
      console.error('조회수 업데이트 오류:', error)
    }
  }

  // 필터링된 FAQ 목록
  const filteredFAQs = faqs.filter(faq =>
    selectedCategory === 'all' || faq.category === selectedCategory
  )

  // 카테고리별 그룹핑
  const faqsByCategory = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-brand-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          전체 ({faqs.length})
        </motion.button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = faqs.filter(faq => faq.category === key).length
          if (count === 0) return null

          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-brand-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {label} ({count})
            </motion.button>
          )
        })}
      </div>

      {/* FAQ 목록 */}
      {filteredFAQs.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">해당 카테고리에 FAQ가 없습니다.</p>
        </div>
      ) : selectedCategory === 'all' ? (
        // 카테고리별 그룹으로 표시
        <div className="space-y-8">
          {Object.entries(faqsByCategory).map(([category, categoryFAQs]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </Badge>
                    <span className="text-lg">{categoryLabels[category as keyof typeof categoryLabels]} 관련 질문</span>
                  </CardTitle>
                  <CardDescription>
                    {category === 'general' && '일반적인 병원 이용과 진료에 관한 질문입니다.'}
                    {category === 'surgery' && '수술 과정과 회복에 관한 질문입니다.'}
                    {category === 'checkup' && '검진과 진단에 관한 질문입니다.'}
                    {category === 'insurance' && '보험과 비용에 관한 질문입니다.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {categoryFAQs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger
                          onClick={() => incrementViewCount(faq.id)}
                          className="text-left hover:no-underline"
                        >
                          <div className="flex items-start justify-between w-full pr-4">
                            <span className="text-neutral-900 font-medium">
                              Q. {faq.question}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <span className="text-brand-secondary-600 font-bold text-sm mt-0.5">A.</span>
                              <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                                {faq.answer}
                              </div>
                            </div>
                            {faq.view_count > 0 && (
                              <div className="text-xs text-neutral-400 border-t border-neutral-100 pt-2">
                                조회수 {faq.view_count}회
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        // 선택된 카테고리의 FAQ만 표시
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={categoryColors[selectedCategory as keyof typeof categoryColors]}>
                  {categoryLabels[selectedCategory as keyof typeof categoryLabels]}
                </Badge>
                <span className="text-lg">
                  {categoryLabels[selectedCategory as keyof typeof categoryLabels]} 관련 질문
                </span>
              </CardTitle>
              <CardDescription>
                총 {filteredFAQs.length}개의 질문이 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger
                      onClick={() => incrementViewCount(faq.id)}
                      className="text-left hover:no-underline"
                    >
                      <div className="flex items-start justify-between w-full pr-4">
                        <span className="text-neutral-900 font-medium">
                          Q. {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-brand-secondary-600 font-bold text-sm mt-0.5">A.</span>
                          <div className="text-neutral-700 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </div>
                        {faq.view_count > 0 && (
                          <div className="text-xs text-neutral-400 border-t border-neutral-100 pt-2">
                            조회수 {faq.view_count}회
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 추가 도움말 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center p-6 bg-brand-secondary-50 rounded-lg"
      >
        <MessageCircle className="h-8 w-8 text-brand-secondary-600 mx-auto mb-3" />
        <h3 className="font-medium text-neutral-900 mb-2">
          원하는 답변을 찾지 못하셨나요?
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          AI 챗봇이나 전화 상담을 통해 더 자세한 정보를 받아보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button className="px-4 py-2 bg-brand-secondary-600 text-white rounded-lg hover:bg-brand-secondary-700 transition-colors text-sm">
            AI 상담하기
          </button>
          <button className="px-4 py-2 bg-white border border-brand-secondary-600 text-brand-secondary-600 rounded-lg hover:bg-brand-secondary-50 transition-colors text-sm">
            전화 상담: 1544-7260
          </button>
        </div>
      </motion.div>

      {/* FAQ 구조화된 데이터 */}
      <StructuredData type="faq" data={{ faqs }} />
    </div>
  )
}

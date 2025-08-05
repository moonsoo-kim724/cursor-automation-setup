'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal, useModal } from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit2, Eye, EyeOff, Filter, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// FAQ 타입 정의
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

// FAQ 폼 스키마
const faqSchema = z.object({
  category: z.string().min(1, '카테고리를 선택해주세요'),
  question: z.string().min(5, '질문은 최소 5자 이상 입력해주세요'),
  answer: z.string().min(10, '답변은 최소 10자 이상 입력해주세요'),
  order_index: z.number().min(0, '순서는 0 이상이어야 합니다'),
  is_published: z.boolean()
})

type FAQFormData = z.infer<typeof faqSchema>

const categories = [
  { value: 'general', label: '일반', color: 'bg-blue-100 text-blue-800' },
  { value: 'surgery', label: '수술', color: 'bg-red-100 text-red-800' },
  { value: 'checkup', label: '검진', color: 'bg-green-100 text-green-800' },
  { value: 'insurance', label: '보험', color: 'bg-yellow-100 text-yellow-800' }
]

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)

  const createModal = useModal()
  const editModal = useModal()
  const deleteModal = useModal()

  const supabase = createClient()

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      category: 'general',
      question: '',
      answer: '',
      order_index: 0,
      is_published: true
    }
  })

  // FAQ 목록 조회
  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error('FAQ 조회 오류:', error)
      alert('FAQ 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // FAQ 생성
  const createFAQ = async (data: FAQFormData) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .insert([data])

      if (error) throw error

      alert('FAQ가 성공적으로 생성되었습니다.')
      reset()
      createModal.close()
      fetchFAQs()
    } catch (error) {
      console.error('FAQ 생성 오류:', error)
      alert('FAQ 생성 중 오류가 발생했습니다.')
    }
  }

  // FAQ 수정
  const updateFAQ = async (data: FAQFormData) => {
    if (!selectedFAQ) return

    try {
      const { error } = await supabase
        .from('faqs')
        .update(data)
        .eq('id', selectedFAQ.id)

      if (error) throw error

      alert('FAQ가 성공적으로 수정되었습니다.')
      reset()
      editModal.close()
      setSelectedFAQ(null)
      fetchFAQs()
    } catch (error) {
      console.error('FAQ 수정 오류:', error)
      alert('FAQ 수정 중 오류가 발생했습니다.')
    }
  }

  // FAQ 삭제
  const deleteFAQ = async () => {
    if (!selectedFAQ) return

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', selectedFAQ.id)

      if (error) throw error

      alert('FAQ가 성공적으로 삭제되었습니다.')
      deleteModal.close()
      setSelectedFAQ(null)
      fetchFAQs()
    } catch (error) {
      console.error('FAQ 삭제 오류:', error)
      alert('FAQ 삭제 중 오류가 발생했습니다.')
    }
  }

  // FAQ 발행 상태 토글
  const togglePublished = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_published: !faq.is_published })
        .eq('id', faq.id)

      if (error) throw error
      fetchFAQs()
    } catch (error) {
      console.error('발행 상태 변경 오류:', error)
      alert('발행 상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 수정 모달 열기
  const openEditModal = (faq: FAQ) => {
    setSelectedFAQ(faq)
    reset({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index,
      is_published: faq.is_published
    })
    editModal.open()
  }

  // 삭제 모달 열기
  const openDeleteModal = (faq: FAQ) => {
    setSelectedFAQ(faq)
    deleteModal.open()
  }

  // 필터링된 FAQ 목록
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // 카테고리별 통계
  const categoryStats = categories.map(cat => ({
    ...cat,
    count: faqs.filter(faq => faq.category === cat.value).length
  }))

  useEffect(() => {
    fetchFAQs()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">FAQ 관리</h1>
            <p className="text-neutral-600 mt-1">자주 묻는 질문을 관리하고 편집할 수 있습니다.</p>
          </div>
          <Button onClick={createModal.open} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            새 FAQ 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-neutral-900">{faqs.length}</div>
              <div className="text-sm text-neutral-600">전체 FAQ</div>
            </CardContent>
          </Card>
          {categoryStats.map(stat => (
            <Card key={stat.value}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-neutral-900">{stat.count}</div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 검색 및 필터 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="FAQ 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                >
                  <option value="all">전체 카테고리</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ 목록 ({filteredFAQs.length})</CardTitle>
            <CardDescription>
              등록된 FAQ를 확인하고 관리할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600"></div>
              </div>
            ) : filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500">등록된 FAQ가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="border-l-4 border-l-brand-primary-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={categories.find(c => c.value === faq.category)?.color}>
                                  {categories.find(c => c.value === faq.category)?.label}
                                </Badge>
                                <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                                  {faq.is_published ? '발행' : '비공개'}
                                </Badge>
                                <span className="text-sm text-neutral-500">순서: {faq.order_index}</span>
                                <span className="text-sm text-neutral-500">조회: {faq.view_count}</span>
                              </div>
                              <h3 className="font-semibold text-neutral-900">{faq.question}</h3>
                              <p className="text-neutral-600 text-sm line-clamp-2">{faq.answer}</p>
                              <div className="text-xs text-neutral-400">
                                생성: {new Date(faq.created_at).toLocaleDateString('ko-KR')} |
                                수정: {new Date(faq.updated_at).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePublished(faq)}
                                className="text-neutral-600 hover:text-neutral-900"
                              >
                                {faq.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(faq)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteModal(faq)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ 생성 모달 */}
        <Modal {...createModal.modalProps}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">새 FAQ 추가</h2>
            <form onSubmit={handleSubmit(createFAQ)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">질문</label>
                <Input
                  {...register('question')}
                  placeholder="자주 묻는 질문을 입력하세요"
                />
                {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">답변</label>
                <textarea
                  {...register('answer')}
                  placeholder="질문에 대한 답변을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg resize-none"
                />
                {errors.answer && <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">순서</label>
                  <Input
                    type="number"
                    {...register('order_index', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.order_index && <p className="text-red-500 text-sm mt-1">{errors.order_index.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">발행 상태</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      {...register('is_published')}
                      className="rounded"
                    />
                    <span className="text-sm">발행하기</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={createModal.close}>
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '생성 중...' : '생성'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* FAQ 수정 모달 */}
        <Modal {...editModal.modalProps}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">FAQ 수정</h2>
            <form onSubmit={handleSubmit(updateFAQ)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">질문</label>
                <Input
                  {...register('question')}
                  placeholder="자주 묻는 질문을 입력하세요"
                />
                {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">답변</label>
                <textarea
                  {...register('answer')}
                  placeholder="질문에 대한 답변을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg resize-none"
                />
                {errors.answer && <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">순서</label>
                  <Input
                    type="number"
                    {...register('order_index', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.order_index && <p className="text-red-500 text-sm mt-1">{errors.order_index.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">발행 상태</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      {...register('is_published')}
                      className="rounded"
                    />
                    <span className="text-sm">발행하기</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={editModal.close}>
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '수정 중...' : '수정'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* FAQ 삭제 확인 모달 */}
        <Modal {...deleteModal.modalProps}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">FAQ 삭제</h2>
            <p className="text-neutral-600 mb-6">
              정말로 이 FAQ를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            {selectedFAQ && (
              <div className="bg-neutral-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-neutral-900">{selectedFAQ.question}</h3>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{selectedFAQ.answer}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={deleteModal.close}>
                취소
              </Button>
              <Button variant="destructive" onClick={deleteFAQ}>
                삭제
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chatbot } from '@/components/ui/chatbot'
import { Input } from '@/components/ui/input'
import { Modal, useModal } from '@/components/ui/modal'
import { motion } from 'framer-motion'
import { Award, Calendar, CheckCircle, Clock, Eye, MapPin, MessageCircle, Phone, Shield, Star, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const consultModal = useModal()
  const appointmentModal = useModal()

  // AI 챗봇 상태
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  // 실시간 통계 애니메이션
  const [todayBookings, setTodayBookings] = useState(0)
  const [totalPatients, setTotalPatients] = useState(0)

  useEffect(() => {
    // 실시간 예약 현황 시뮬레이션
    const bookingInterval = setInterval(() => {
      setTodayBookings(prev => Math.min(prev + 1, 47))
    }, 3000)

    // 총 환자 수 카운트 애니메이션
    const patientInterval = setInterval(() => {
      setTotalPatients(prev => Math.min(prev + 50, 15400))
    }, 100)

    setTimeout(() => {
      clearInterval(patientInterval)
    }, 3080)

    return () => {
      clearInterval(bookingInterval)
      clearInterval(patientInterval)
    }
  }, [])

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary-50 via-white to-brand-secondary-50">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%,transparent_100%)] opacity-20" />

        {/* Trust Badges - Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="medical" size="sm" icon={<Award className="h-3 w-3" />}>
              개원 30주년
            </Badge>
            <Badge variant="certification" size="sm" icon={<Shield className="h-3 w-3" />}>
              의료진 인증
            </Badge>
            <Badge variant="award" size="sm" icon={<Star className="h-3 w-3" />}>
              송도 1위 안과
            </Badge>
          </div>
        </motion.div>

        <div className="container relative py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo & Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <div className="relative">
                <Eye className="h-20 w-20 text-brand-primary-600 mx-auto mb-4" />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 h-20 w-20 mx-auto mb-4 rounded-full bg-brand-primary-200 blur-xl"
                />
              </div>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600 bg-clip-text text-transparent"
              >
                연수김안과의원
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl lg:text-3xl text-neutral-600 mb-4 font-medium"
            >
              30년의 신뢰, AI로 미래를 열다
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg text-neutral-500 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              인천 송도 소재 30년 전문 경력의 안과 수술 전문 병원입니다.
              AI 기반 디지털 헬스케어와 다국어 진료로 프리미엄 안과 서비스를 제공합니다.
            </motion.p>

            {/* Real-time Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-6 justify-center mb-8"
            >
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <TrendingUp className="h-4 w-4 text-brand-secondary-600" />
                <span>오늘 예약 완료</span>
                <span className="font-bold text-brand-secondary-600">{todayBookings}건</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Users className="h-4 w-4 text-brand-primary-600" />
                <span>총 진료 환자</span>
                <span className="font-bold text-brand-primary-600">{totalPatients.toLocaleString()}명+</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle className="h-4 w-4 text-brand-secondary-600" />
                <span>수술 성공률</span>
                <span className="font-bold text-brand-secondary-600">99.8%</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Button
                size="xl"
                variant="success"
                onClick={() => setIsChatbotOpen(true)}
                leftIcon={<MessageCircle className="h-5 w-5" />}
                className="w-full sm:w-auto group"
              >
                무료 AI 상담
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  →
                </motion.span>
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={appointmentModal.openModal}
                leftIcon={<Calendar className="h-5 w-5" />}
                className="w-full sm:w-auto"
              >
                바로 예약하기
              </Button>
              <Button
                size="xl"
                variant="ghost"
                leftIcon={<Phone className="h-5 w-5" />}
                className="w-full sm:w-auto"
                onClick={() => window.open('tel:032-123-4567')}
              >
                전화 상담
              </Button>
            </motion.div>

            {/* Trust Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center text-sm text-neutral-500"
            >
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-brand-secondary-600" />
                <span>24시간 상담 가능</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-brand-secondary-600" />
                <span>다국어 진료</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-brand-secondary-600" />
                <span>당일 예약 가능</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-brand-secondary-600" />
                <span>인천대입구역 도보 5분</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Action Button for Mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <Button
            size="lg"
            variant="success"
            onClick={() => setIsChatbotOpen(true)}
            className="rounded-full shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              왜 연수김안과의원인가요?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              30년 전문 경력과 최신 AI 기술의 완벽한 조화
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="h-8 w-8" />,
                title: "30년 전문 경력",
                description: "풍부한 임상 경험과 수술 노하우로 안전하고 정확한 진료를 제공합니다.",
                color: "brand"
              },
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "AI 기반 상담",
                description: "24시간 AI 챗봇을 통한 다국어 의료 상담 서비스를 제공합니다.",
                color: "success"
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: "송도 최적 위치",
                description: "인천 송도 신도시 중심가에 위치하여 접근성이 뛰어납니다.",
                color: "default"
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "프리미엄 서비스",
                description: "개인 맞춤형 진료와 사후 관리로 최상의 의료 서비스를 제공합니다.",
                color: "default"
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "빠른 예약 시스템",
                description: "스마트 예약 시스템으로 대기시간 없는 편리한 진료를 받으세요.",
                color: "success"
              },
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "다국어 지원",
                description: "한국어, 영어, 중국어 진료로 외국인 환자도 편안하게 이용 가능합니다.",
                color: "brand"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card hover variant={feature.color as any} className="h-full">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg ${
                      feature.color === 'brand' ? 'bg-brand-primary-100 text-brand-primary-600' :
                      feature.color === 'success' ? 'bg-brand-secondary-100 text-brand-secondary-600' :
                      'bg-neutral-100 text-neutral-600'
                    } w-fit mb-2`}>
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Services Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              전문 진료 분야
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              30년 축적된 전문 경험으로 안전하고 정확한 안과 수술을 제공합니다
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Eye className="h-10 w-10" />,
                title: "시력교정술",
                subtitle: "라식 • 라섹 • 스마일라식",
                description: "최첨단 장비로 안전하고 정확한 시력교정 수술을 제공합니다.",
                features: ["무도수 정밀검사", "개인맞춤형 수술", "당일 수술 가능", "빠른 회복"],
                color: "brand-primary"
              },
              {
                icon: <Eye className="h-10 w-10" />,
                title: "백내장 수술",
                subtitle: "일반 • 다초점 • 난시교정",
                description: "개인별 맞춤 인공수정체로 선명한 시력을 회복하세요.",
                features: ["다초점 렌즈", "난시교정", "무봉합 수술", "당일 귀가"],
                color: "brand-secondary"
              },
              {
                icon: <Eye className="h-10 w-10" />,
                title: "망막질환",
                subtitle: "당뇨망막병증 • 황반변성",
                description: "전문적인 망막 진단 및 치료로 시력 손상을 예방합니다.",
                features: ["정밀 검사", "레이저 치료", "주사 치료", "수술적 치료"],
                color: "neutral"
              },
              {
                icon: <Eye className="h-10 w-10" />,
                title: "녹내장",
                subtitle: "조기진단 • 레이저 • 수술",
                description: "조기 발견과 체계적인 관리로 시신경 손상을 예방합니다.",
                features: ["정기 검진", "안압 관리", "레이저 치료", "수술적 치료"],
                color: "brand-primary"
              },
              {
                icon: <Eye className="h-10 w-10" />,
                title: "소아안과",
                subtitle: "약시 • 사시 • 굴절이상",
                description: "아이들의 건강한 시력 발달을 위한 전문적인 진료를 제공합니다.",
                features: ["시력발달 검사", "약시 치료", "사시 교정", "굴절이상 관리"],
                color: "brand-secondary"
              },
              {
                icon: <Eye className="h-10 w-10" />,
                title: "안성형/안구건조증",
                subtitle: "눈꺼풀 • 눈물샘 • 건조증",
                description: "기능과 미용을 모두 고려한 안성형 및 건조증 치료를 제공합니다.",
                features: ["눈꺼풀 수술", "눈물샘 치료", "건조증 관리", "미용 성형"],
                color: "neutral"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full group">
                  <CardHeader>
                    <div className={`inline-flex p-4 rounded-xl ${
                      service.color === 'brand-primary' ? 'bg-brand-primary-100 text-brand-primary-600' :
                      service.color === 'brand-secondary' ? 'bg-brand-secondary-100 text-brand-secondary-600' :
                      'bg-neutral-100 text-neutral-600'
                    } w-fit mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <p className="text-sm text-neutral-500 font-medium">{service.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed mb-4">
                      {service.description}
                    </CardDescription>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                          <CheckCircle className="h-4 w-4 text-brand-secondary-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Medical Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-brand-primary-50 to-brand-secondary-50 rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                의료진 소개
              </h3>
              <p className="text-lg text-neutral-600">
                30년 경력의 안과 전문의와 숙련된 의료진이 함께합니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-brand-primary-100 rounded-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-brand-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900">김학철 대표표원장</h4>
                    <p className="text-brand-primary-600 font-medium">안과전문의 • 노안 라식 백내장</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-neutral-600">
                  <p>• 중앙대, 인하대, 가천대 외래교수</p>
                  <p>• 대한안과학회 정회원</p>
                  <p>• 한국백내장굴절수술학회(KSCRS) 정회원</p>
                  <p>• 미국백내장굴절수술학회(ASCRS) 정회원</p>
                  <p>• 유럽백내장굴절수술학회(ESCRS) 정회원</p>
                  <p>• 외안부학회, 콘택트렌즈학회 정회원</p>
                  <p>• AT LISA 국제공인</p>
                  <p>• Restor, Technis 국제공인</p>
                  <p>• STAAR ICL 국제공인, ICL Global Expert 선정</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-brand-secondary-100 rounded-full flex items-center justify-center">
                    <Award className="h-8 w-8 text-brand-secondary-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900">전문 의료진</h4>
                    <p className="text-brand-secondary-600 font-medium">숙련된 안과 의료진</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-neutral-600">
                  <p>• 안과 전문의 4명</p>
                  <p>• 안과 전문간호사 27명</p>
                  <p>• 검안사 11명</p>
                  <p>• 시력교정 전문 코디네이터 6명</p>
                  <p>• 정기 교육 및 세미나 참여</p>
                  <p>• 최신 의료 기술 지속 업데이트</p>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              환자분들이 가장 궁금해하시는 질문들을 모았습니다
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                question: "라식 수술 후 회복 기간은 얼마나 걸리나요?",
                answer: "라식 수술 후 대부분의 환자는 1-2일 내 일상생활이 가능합니다. 시력 안정화는 1-3개월 정도 소요되며, 개인차가 있을 수 있습니다. 수술 후 정기 검진을 통해 회복 상태를 점검합니다."
              },
              {
                question: "백내장 수술 시 입원이 필요한가요?",
                answer: "백내장 수술은 당일 수술로 진행되며 입원이 필요하지 않습니다. 수술 시간은 약 20-30분 정도이며, 수술 후 2-3시간 안정을 취한 후 귀가 가능합니다."
              },
              {
                question: "수술 비용은 어떻게 되나요?",
                answer: "수술 비용은 개인의 눈 상태와 선택하는 수술 방법에 따라 차이가 있습니다. 정확한 비용은 정밀 검사 후 상담을 통해 안내해드립니다. 건강보험 적용 여부도 함께 확인해드립니다."
              },
              {
                question: "외국인도 진료 받을 수 있나요?",
                answer: "네, 연수김안과의원은 영어와 중국어 진료가 가능합니다. 외국인 환자를 위한 전담 코디네이터가 있어 예약부터 수술, 사후 관리까지 원활한 소통을 도와드립니다."
              },
              {
                question: "예약은 어떻게 하나요?",
                answer: "온라인 예약, 전화 예약(032-123-4567), 또는 AI 챗봇을 통한 예약이 가능합니다. 급한 경우 당일 예약도 가능하며, 대기시간을 최소화하기 위해 사전 예약을 권장합니다."
              },
              {
                question: "수술 후 관리는 어떻게 이루어지나요?",
                answer: "수술 후 정기 검진 일정을 안내해드리며, 카카오톡과 SMS를 통해 자동 리마인드 서비스를 제공합니다. 응급상황 시 24시간 상담 가능한 핫라인도 운영하고 있습니다."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-4"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-start gap-2">
                    <span className="text-brand-primary-600 font-bold">Q.</span>
                    {faq.question}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed pl-6">
                    <span className="text-brand-secondary-600 font-bold">A.</span> {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic Information Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              오시는 길 & 병원 정보
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              인천 송도 신도시 중심가(포스스코타워송도,센트럴파크)에 위치한 연수김안과의원으로 오세요
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* 지도 및 주소 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-brand-primary-600" />
                    병원 위치
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Google Maps Embed */}
                  <div className="relative w-full h-64 bg-neutral-100">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3171.8442358152966!2d126.6352!3d37.3859!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b7af78b8eff65%3A0x9f7e4eaa7d1b8ab2!2z7J247LKc6YqR642C!5e0!3m2!1sko!2skr!4v1635123456789!5m2!1sko!2skr"
                      width="100%"
                      height="256"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-b-lg"
                    />
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-brand-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-neutral-900">연수김안과의원</p>
                          <p className="text-neutral-600">인천광역시 연수구 컨벤시아대로 165</p>
                          <p className="text-neutral-600">포스코타워송도 5층</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-brand-secondary-600" />
                        <div>
                          <p className="font-medium text-neutral-900">대표전화</p>
                          <p className="text-brand-secondary-600 font-medium">1544-7260,032-817-3487</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('https://map.naver.com/v5/search/연수김안과의원', '_blank')}
                        >
                          네이버 지도
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('https://map.kakao.com/link/search/연수김안과의원', '_blank')}
                        >
                          카카오맵
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('tel:032-123-4567')}
                        >
                          전화걸기
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 진료시간 및 교통편 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* 진료시간 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-5 w-5 text-brand-secondary-600" />
                    진료시간
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="font-medium">월 ~ 금</span>
                      <span className="text-neutral-600">09:00 ~ 18:00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="font-medium">토요일</span>
                      <span className="text-neutral-600">09:00 ~ 13:00</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="font-medium">점심시간</span>
                      <span className="text-neutral-600">12:30 ~ 13:30</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">일요일/공휴일</span>
                      <span className="text-red-500">휴진</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-brand-primary-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-brand-primary-600" />
                      <span className="font-medium text-brand-primary-800">진료 안내</span>
                    </div>
                    <ul className="text-sm text-brand-primary-700 space-y-1">
                      <li>• 수술 전 검사 예약제</li>
                      <li>• 수술 예약제</li>
                      <li>• 수술 후 검사 예약제</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* 교통편 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-brand-primary-600" />
                    교통편 & 주차
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">🚇 지하철</h4>
                      <p className="text-neutral-600 text-sm">
                        • 인천지하철 1호선 인천대입구역 4번 출구 도보 5분, 롯데마트 옆 포스코타워송도 5층<br/>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">🚌 버스</h4>
                      <p className="text-neutral-600 text-sm">
                        * 간선버스: 6, 8 : 송도컨벤시아
                         6-1, 9 : 컨벤시아, 송도더샵퍼스트월드(서문)
                         16, 58 : 롯데마트송도점, 포스코타워앤쉐라톤호텔, 센트럴공원
                         16-1 : 송도컨벤시아남문
                        * 지선버스: 순환41 : 롯데마트송도점, 포스코타워앤쉐라톤호텔, 센트럴공원
                         순환43, 순환47 : 컨벤시아, 송도더샵퍼스트월드(서문)
                        * 좌석버스: 303-1 : 컨벤시아, 송도더샵퍼스트월드(서문)
                        * 광역버스: 1301, M6724 : 컨벤시아, 송도더샵퍼스트월드(서문)
                          3002 : 포스코타워앤쉐라톤호텔, 센트럴공원
                        * 공항버스: 6777, 6777-1 : 포스코타워앤쉐라톤호텔, 센트럴공원<br/>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">🚗 주차</h4>
                      <p className="text-neutral-600 text-sm">
                        • 건물 지하 주차장 (3시간 무료), 입원환자 24시간 무료<br/>
                        • 장애인 전용 주차구역 완비
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <CheckCircle className="h-4 w-4 text-brand-secondary-600" />
                      <span>송도 국제업무단지 중심가, 접근성 최고의 위치</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl mb-8 opacity-90">
              AI 상담을 통해 맞춤형 진료 계획을 받아보세요
            </p>
            <Button
              size="xl"
              variant="secondary"
              onClick={() => setIsChatbotOpen(true)}
              leftIcon={<MessageCircle className="h-5 w-5" />}
            >
              무료 AI 상담 받기
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <Modal
        isOpen={consultModal.isOpen}
        onClose={consultModal.closeModal}
        title="AI 상담 시작"
        description="연수김안과의원의 AI 상담 서비스를 시작합니다."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="성함"
            placeholder="성함을 입력해주세요"
            leftIcon={<Eye className="h-4 w-4" />}
          />
          <Input
            label="연락처"
            placeholder="연락처를 입력해주세요"
            type="tel"
          />
          <div className="pt-4 flex gap-2">
            <Button onClick={consultModal.closeModal} variant="secondary" className="flex-1">
              취소
            </Button>
            <Button variant="success" className="flex-1">
              상담 시작
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={appointmentModal.isOpen}
        onClose={appointmentModal.closeModal}
        title="진료 예약"
        description="편리한 온라인 예약 서비스를 이용해보세요."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="성함"
            placeholder="성함을 입력해주세요"
          />
          <Input
            label="연락처"
            placeholder="연락처를 입력해주세요"
            type="tel"
          />
          <Input
            label="희망 날짜"
            type="date"
          />
          <div className="pt-4 flex gap-2">
            <Button onClick={appointmentModal.closeModal} variant="secondary" className="flex-1">
              취소
            </Button>
            <Button variant="default" className="flex-1">
              예약하기
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Chatbot */}
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onBookingRequest={(bookingInfo) => {
          // 예약 정보 처리
          console.log('Booking request:', bookingInfo)
          setIsChatbotOpen(false)
          appointmentModal.openModal()
        }}
        language="ko"
      />

      {/* 부스터 대시보드 접속 버튼 - 관리자용 */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="border-brand-primary-300 bg-white/90 backdrop-blur-sm text-brand-primary-700 hover:bg-brand-primary-50 shadow-lg"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            2RU4 대시보드
          </Button>
        </Link>
      </div>
    </main>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal, useModal } from '@/components/ui/modal'
import { motion } from 'framer-motion'
import { Award, BarChart3, Calendar, CheckCircle, Clock, Eye, MapPin, MessageCircle, Phone, Shield, Star, TrendingUp, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'

// 동적 임포트로 번들 크기 최적화 - Critical 컴포넌트 우선 로드
const Chatbot = dynamic(() => import('@/components/ui/chatbot').then(mod => ({ default: mod.Chatbot })), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>,
  ssr: false
})

const Leadbot = dynamic(() => import('@/components/ui/leadbot').then(mod => ({ default: mod.Leadbot })), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>,
  ssr: false
})

// Below-the-fold 컴포넌트들은 Intersection Observer와 함께 지연 로드
const FAQSection = dynamic(() => import('@/components/ui/faq-section').then(mod => ({ default: mod.FAQSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse rounded-lg"></div>,
  ssr: true
})

const MapLocation = dynamic(() => import('@/components/ui/map-location').then(mod => ({ default: mod.MapLocation })), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
})

const MobileMenu = dynamic(() => import('@/components/mobile/mobile-menu').then(mod => ({ default: mod.MobileMenu })), {
  ssr: false
})

const QuickActions = dynamic(() => import('@/components/mobile/quick-actions').then(mod => ({ default: mod.QuickActions })), {
  ssr: false
})

const StructuredData = dynamic(() => import('@/components/seo/structured-data').then(mod => ({ default: mod.StructuredData })), {
  ssr: true
})

export default function Home() {
  const consultModal = useModal()
  const appointmentModal = useModal()

  // AI 챗봇 상태
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  // 리드봇 상태
  const [isLeadbotOpen, setIsLeadbotOpen] = useState(false)

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
      {/* Hero Section - Enhanced Vercel Style */}
      <section className="relative overflow-hidden bg-black">
        {/* Vercel-style gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_40%)]" />
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        {/* Trust Badges - Enhanced Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">개원 30주년</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">의료진 인증</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">송도 1위 안과</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="container relative py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo & Icon - Enhanced Vercel Style */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-16"
            >
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  {/* Main Logo */}
                  <div className="relative w-20 h-20 mx-auto">
                    <Eye className="h-20 w-20 text-white mx-auto drop-shadow-2xl" aria-label="연수김안과의원 로고" />

                    {/* Animated Glow Ring */}
                    <motion.div
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute inset-0 rounded-full"
                    >
                      <div className="w-full h-full rounded-full border-2 border-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black" />
                      </div>
                    </motion.div>

                    {/* Inner Pulse */}
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl"
                    />

                    {/* Outer Glow */}
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                      className="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 blur-2xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Title - Enhanced Vercel Style */}
            <div className="mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-4"
              >
                <span className="block bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  연수김안과의원
                </span>
              </motion.h1>

              {/* Animated Underline */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 1.2, ease: "easeOut" }}
                className="w-48 md:w-72 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mx-auto rounded-full"
              />
            </div>

            {/* Subtitle - Enhanced Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-12"
            >
              <div className="relative">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    30년의 신뢰, AI로 미래를 열다
                  </span>
                </h2>
                {/* 배경 글로우 효과 */}
                <motion.div
                  animate={{
                    opacity: [0.1, 0.4, 0.1],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/20 to-cyan-500/10 blur-3xl -z-10 rounded-3xl"
                />
              </div>

              {/* 30주년 특별 뱃지 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex justify-center mt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="relative">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-yellow-400/30 blur-sm"
                    />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">개원 30주년 기념</span>
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Star className="h-5 w-5 text-yellow-400" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              <span className="text-white font-medium">인천 송도 소재 30년 전문 경력</span>의 안과 수술 전문 병원입니다.
              <br className="hidden md:block" />
              <span className="text-blue-300 font-medium">AI 기반 디지털 헬스케어</span>와 <span className="text-cyan-300 font-medium">다국어 진료</span>로 프리미엄 안과 서비스를 제공합니다.
            </motion.p>

            {/* Real-time Stats - Enhanced Vercel Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 shadow-2xl"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <TrendingUp className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">오늘 예약</span>
                </div>
                <div className="relative">
                  <span className="text-3xl font-bold text-white">{todayBookings}</span>
                  <span className="text-lg text-gray-400 ml-1">건</span>
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-2 bg-blue-500/10 rounded-lg blur-lg"
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 shadow-2xl"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <Users className="h-5 w-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">총 진료</span>
                </div>
                <div className="relative">
                  <span className="text-3xl font-bold text-white">{totalPatients.toLocaleString()}</span>
                  <span className="text-lg text-gray-400 ml-1">명+</span>
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-2 bg-purple-500/10 rounded-lg blur-lg"
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 shadow-2xl"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                    <CheckCircle className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">성공률</span>
                </div>
                <div className="relative">
                  <span className="text-3xl font-bold text-white">99.8</span>
                  <span className="text-lg text-gray-400 ml-1">%</span>
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-2 bg-cyan-500/10 rounded-lg blur-lg"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* CTAs - Enhanced Vercel Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Button
                  size="xl"
                  onClick={() => setIsChatbotOpen(true)}
                  className="relative w-full sm:w-auto bg-white text-black hover:bg-gray-50 font-semibold px-8 py-4 text-lg shadow-2xl border-0 transition-all duration-300"
                >
                  <MessageCircle className="h-6 w-6 mr-3" />
                  <span>무료 AI 상담</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="ml-3 text-xl"
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="xl"
                  onClick={() => setIsLeadbotOpen(true)}
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 font-semibold px-8 py-4 text-lg transition-all duration-300 shadow-2xl"
                >
                  <Calendar className="h-6 w-6 mr-3" />
                  <span>바로 예약하기</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="xl"
                  onClick={() => window.open('tel:1544-7260')}
                  className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium px-8 py-4 text-lg transition-all duration-300"
                >
                  <Phone className="h-6 w-6 mr-3" />
                  <span>전화 상담</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Elements - Enhanced Vercel Style Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { icon: <Clock className="h-5 w-5" />, text: "24시간 상담", color: "blue" },
                { icon: <MessageCircle className="h-5 w-5" />, text: "다국어 진료", color: "purple" },
                { icon: <Calendar className="h-5 w-5" />, text: "당일 예약", color: "cyan" },
                { icon: <MapPin className="h-5 w-5" />, text: "역세권 위치", color: "green" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-2xl"
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${item.color}-500/20 text-${item.color}-400 group-hover:bg-${item.color}-500/30 group-hover:scale-110 transition-all duration-300`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-white text-center">{item.text}</span>
                  <motion.div
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute -inset-1 bg-${item.color}-500/10 rounded-2xl blur-lg`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Floating Action Button for Mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 4px 20px rgba(2, 132, 199, 0.3)",
                "0 8px 30px rgba(2, 132, 199, 0.4)",
                "0 4px 20px rgba(2, 132, 199, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setIsChatbotOpen(true)}
              className="rounded-full shadow-xl bg-brand-secondary-600 hover:bg-brand-secondary-700 border-2 border-white"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>

            {/* Pulse Animation */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-brand-secondary-400 -z-10"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Enhanced Vercel Style */}
      <section className="py-32 bg-gradient-to-b from-black via-gray-950 to-black" aria-labelledby="features-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="features-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                왜 연수김안과의원인가요?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              <span className="text-white font-semibold">30년 전문 경력</span>과 <span className="text-blue-300 font-semibold">최신 AI 기술</span>의 완벽한 조화
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="h-10 w-10" />,
                title: "30년 전문 경력",
                description: "풍부한 임상 경험과 수술 노하우로 안전하고 정확한 진료를 제공합니다.",
                color: "blue",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                icon: <MessageCircle className="h-10 w-10" />,
                title: "AI 기반 상담",
                description: "24시간 AI 챗봇을 통한 다국어 의료 상담 서비스를 제공합니다.",
                color: "purple",
                gradient: "from-purple-500 to-pink-600"
              },
              {
                icon: <MapPin className="h-10 w-10" />,
                title: "송도 최적 위치",
                description: "인천 송도 신도시 중심가에 위치하여 접근성이 뛰어납니다.",
                color: "cyan",
                gradient: "from-cyan-500 to-blue-600"
              },
              {
                icon: <Star className="h-10 w-10" />,
                title: "프리미엄 서비스",
                description: "개인 맞춤형 진료와 사후 관리로 최상의 의료 서비스를 제공합니다.",
                color: "emerald",
                gradient: "from-emerald-500 to-cyan-600"
              },
              {
                icon: <Clock className="h-10 w-10" />,
                title: "빠른 예약 시스템",
                description: "스마트 예약 시스템으로 대기시간 없는 편리한 진료를 받으세요.",
                color: "violet",
                gradient: "from-violet-500 to-purple-600"
              },
              {
                icon: <MessageCircle className="h-10 w-10" />,
                title: "다국어 지원",
                description: "한국어, 영어, 중국어 진료로 외국인 환자도 편안하게 이용 가능합니다.",
                color: "pink",
                gradient: "from-pink-500 to-rose-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative h-full">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Border Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500`} />

                  <div className="relative bg-gray-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full group-hover:border-white/20 group-hover:bg-gray-900/50 transition-all duration-500 shadow-2xl">
                    <div className="flex flex-col h-full">
                      <div className="mb-6">
                        <div className={`inline-flex p-4 rounded-xl bg-${feature.color}-500/10 text-${feature.color}-400 group-hover:bg-${feature.color}-500/20 group-hover:scale-110 transition-all duration-300 mb-4`}>
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed flex-grow group-hover:text-gray-200 transition-colors">
                        {feature.description}
                      </p>

                      {/* Bottom Accent Line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                        className={`mt-6 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Services Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white" aria-labelledby="services-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 id="services-heading" className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
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
      <section id="faq" className="py-20 bg-white">
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
              환자분들이 가장 궁금해하시는 질문들을 카테고리별로 정리했습니다
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg"></div>}>
              <FAQSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Map & Location Section */}
      <section id="location" className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <MapLocation />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Vercel Style */}
      <section className="py-20 bg-black relative overflow-hidden">
        {/* Vercel-style background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-brand-secondary-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-brand-accent-600/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
              AI 상담과 빠른 예약으로 맞춤형 진료 계획을 받아보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="xl"
                variant="secondary"
                onClick={() => setIsChatbotOpen(true)}
                leftIcon={<MessageCircle className="h-5 w-5" />}
                className="bg-white text-black hover:bg-gray-100"
              >
                무료 AI 상담 받기
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => setIsLeadbotOpen(true)}
                leftIcon={<Calendar className="h-5 w-5" />}
                className="border-white/30 text-white hover:bg-white/10"
              >
                빠른 예약 신청
              </Button>
            </div>
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
            <Button 
              variant="success" 
              className="flex-1"
              onClick={() => {
                consultModal.closeModal()
                setIsChatbotOpen(true)
              }}
            >
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
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => {
                appointmentModal.closeModal()
                setIsLeadbotOpen(true)
              }}
            >
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

      {/* Lead Bot */}
      <Leadbot
        isOpen={isLeadbotOpen}
        onClose={() => setIsLeadbotOpen(false)}
        onLeadSubmit={(leadData) => {
          console.log('Lead submitted:', leadData)
          // 리드 제출 후 추가 처리 (예: 감사 메시지, 추적 이벤트 등)
        }}
      />

      {/* 플로팅 AI 챗봇 버튼 */}
      {!isChatbotOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              onClick={() => setIsChatbotOpen(true)}
              size="lg"
              className="w-14 h-14 rounded-full bg-brand-secondary-600 hover:bg-brand-secondary-700 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white"
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
            {/* 펄스 애니메이션 */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-brand-secondary-400"
            />
            {/* 알림 배지 */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white"
            >
              <span className="text-xs font-bold text-white">AI</span>
            </motion.div>
          </motion.div>
          {/* 툴팁 */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            무료 AI 상담 시작하기
          </div>
        </motion.div>
      )}

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

      {/* 모바일 메뉴 */}
      <Suspense fallback={null}>
        <MobileMenu
          onChatbotOpen={() => setIsChatbotOpen(true)}
          onLeadbotOpen={() => setIsLeadbotOpen(true)}
        />
      </Suspense>

      {/* 모바일 빠른 액션 버튼 */}
      <Suspense fallback={null}>
        <QuickActions
          onChatbotOpen={() => setIsChatbotOpen(true)}
          onLeadbotOpen={() => setIsLeadbotOpen(true)}
        />
      </Suspense>

      {/* SEO 구조화된 데이터 */}
      <Suspense fallback={null}>
        <StructuredData type="organization" />
        <StructuredData type="localBusiness" />
      </Suspense>
    </main>
  )
}

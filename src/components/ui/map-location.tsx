'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, MapPin, MessageCircle, Navigation, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Modal, useModal } from './modal'

// 병원 위치 정보 (환경변수로 관리 예정)
const HOSPITAL_INFO = {
  name: '연수김안과의원',
  address: '서울시 강남구 테헤란로 123 ABC빌딩 5층',
  phone: '02-1234-5678',
  coordinates: {
    lat: 37.5012743, // 강남역 근처 예시 좌표
    lng: 127.0396597
  },
  // 네비게이션 딥링크
  deepLinks: {
    kakaoMap: `kakaomap://route?ep=${127.0396597},${37.5012743}&by=CAR`,
    naverMap: `nmap://route/car?dlat=${37.5012743}&dlng=${127.0396597}&dname=${encodeURIComponent('연수김안과의원')}`,
    googleMaps: `https://maps.google.com/?q=${37.5012743},${127.0396597}`,
    appleMaps: `maps://?q=${37.5012743},${127.0396597}&ll=${37.5012743},${127.0396597}`
  }
}

interface MapLocationProps {
  className?: string
  showTitle?: boolean
  compactMode?: boolean
}

export function MapLocation({ className, showTitle = true, compactMode = false }: MapLocationProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [selectedNavApp, setSelectedNavApp] = useState<'kakao' | 'naver' | 'google' | 'apple'>('kakao')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const navigationModal = useModal()

  // 카카오맵 초기화
  useEffect(() => {
    const loadKakaoMap = () => {
      if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
        const container = mapRef.current
        if (!container) return

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(HOSPITAL_INFO.coordinates.lat, HOSPITAL_INFO.coordinates.lng),
          level: 3
        })

        // 마커 추가
        const markerPosition = new window.kakao.maps.LatLng(HOSPITAL_INFO.coordinates.lat, HOSPITAL_INFO.coordinates.lng)
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        })
        marker.setMap(map)

        // 인포윈도우 추가
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding:10px; min-width:200px;">
              <h3 style="margin:0 0 5px 0; font-size:14px; font-weight:bold;">${HOSPITAL_INFO.name}</h3>
              <p style="margin:0; font-size:12px; color:#666;">${HOSPITAL_INFO.address}</p>
              <p style="margin:5px 0 0 0; font-size:12px; color:#0066cc;">${HOSPITAL_INFO.phone}</p>
            </div>
          `
        })
        infoWindow.open(map, marker)

        setIsMapLoaded(true)
      }
    }

    // 카카오맵 API 로드
    if (typeof window !== 'undefined' && !window.kakao) {
      const script = document.createElement('script')
      script.async = true
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'YOUR_KAKAO_MAP_API_KEY'}&autoload=false`
      script.onload = () => {
        window.kakao.maps.load(loadKakaoMap)
      }
      document.head.appendChild(script)
    } else {
      loadKakaoMap()
    }
  }, [])

  // 길찾기 링크 전송
  const handleSendNavigation = async () => {
    if (!phoneNumber.trim()) {
      setMessage('전화번호를 입력해주세요.')
      return
    }

    // 전화번호 유효성 검사
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
    if (!phoneRegex.test(phoneNumber.replace(/-/g, ''))) {
      setMessage('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const navLink = HOSPITAL_INFO.deepLinks[selectedNavApp === 'google' ? 'googleMaps' :
                     selectedNavApp === 'apple' ? 'appleMaps' :
                     selectedNavApp === 'naver' ? 'naverMap' : 'kakaoMap']

      const response = await fetch('/api/send-navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/-/g, ''),
          hospitalName: HOSPITAL_INFO.name,
          address: HOSPITAL_INFO.address,
          navLink,
          navApp: selectedNavApp
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('길찾기 링크가 전송되었습니다! 📱')
        setTimeout(() => {
          navigationModal.closeModal()
          setPhoneNumber('')
          setMessage('')
        }, 2000)
      } else {
        setMessage(result.error || '전송에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('Navigation send error:', error)
      setMessage('전송 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 주소 복사
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(HOSPITAL_INFO.address)
      setMessage('주소가 복사되었습니다! 📋')
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // 바로 길찾기 (새 창)
  const openDirectNavigation = (app: 'kakao' | 'naver' | 'google') => {
    const links = {
      kakao: `https://map.kakao.com/link/to/${encodeURIComponent(HOSPITAL_INFO.name)},${HOSPITAL_INFO.coordinates.lat},${HOSPITAL_INFO.coordinates.lng}`,
      naver: `https://map.naver.com/v5/directions/-/-/${HOSPITAL_INFO.coordinates.lat},${HOSPITAL_INFO.coordinates.lng},,${encodeURIComponent(HOSPITAL_INFO.name)}/`,
      google: HOSPITAL_INFO.deepLinks.googleMaps
    }

    window.open(links[app], '_blank')
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 제목 */}
      {showTitle && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-primary-700">
            병원 위치 & 찾아오는 길
          </h2>
          <p className="text-neutral-600">
            정확한 위치와 다양한 길찾기 옵션을 제공합니다
          </p>
        </div>
      )}

      <div className={`grid ${compactMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
        {/* 지도 영역 */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-primary-600" />
              병원 위치
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              ref={mapRef}
              className="w-full h-[300px] bg-neutral-100 relative"
            >
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="animate-spin w-8 h-8 border-2 border-brand-primary-600 border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-neutral-500">지도 로딩 중...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 정보 및 길찾기 영역 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-brand-secondary-600" />
              길찾기 & 연락처
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 병원 정보 */}
            <div className="space-y-3 p-4 bg-brand-primary-50 rounded-lg">
              <h3 className="font-semibold text-brand-primary-700">{HOSPITAL_INFO.name}</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-neutral-700 leading-relaxed">{HOSPITAL_INFO.address}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="p-1 h-auto hover:bg-brand-primary-100"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">{HOSPITAL_INFO.phone}</span>
              </div>
            </div>

            {/* 길찾기 옵션 */}
            <div className="space-y-3">
              <h4 className="font-medium text-neutral-800">길찾기 옵션</h4>

              {/* 바로 길찾기 버튼들 */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDirectNavigation('kakao')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  카카오맵
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDirectNavigation('naver')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  네이버맵
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDirectNavigation('google')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  구글맵
                </Button>
              </div>

              {/* 모바일 전송 버튼 */}
              <Button
                onClick={navigationModal.openModal}
                className="w-full"
                variant="default"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                모바일로 길찾기 전송
              </Button>
            </div>

            {/* 메시지 표시 */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-sm ${
                  message.includes('실패') || message.includes('오류')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {message}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 길찾기 전송 모달 */}
      <Modal
        isOpen={navigationModal.isOpen}
        onClose={navigationModal.closeModal}
        title="모바일로 길찾기 전송"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            휴대폰 번호를 입력하시면 선택한 지도 앱의 길찾기 링크를 문자로 전송해드립니다.
          </p>

          {/* 지도 앱 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">지도 앱 선택</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'kakao', name: '카카오맵', icon: '🗺️' },
                { id: 'naver', name: '네이버맵', icon: '🧭' },
                { id: 'google', name: '구글맵', icon: '🌍' },
                { id: 'apple', name: '애플맵', icon: '🍎' }
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedNavApp(app.id as any)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedNavApp === app.id
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{app.icon}</span>
                    <span className="text-sm font-medium">{app.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 전화번호 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">전화번호</label>
            <Input
              type="tel"
              placeholder="010-1234-5678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
          </div>

          {/* 메시지 */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm ${
                message.includes('실패') || message.includes('오류')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={navigationModal.closeModal}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              onClick={handleSendNavigation}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />}
              {isLoading ? '전송 중...' : '길찾기 전송'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// 카카오맵 API 타입 확장
declare global {
  interface Window {
    kakao: any
  }
}

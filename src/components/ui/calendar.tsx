'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface TimeSlot {
  id: string
  time: string
  available: boolean
  doctorId: string
  appointmentType?: string
}

interface CalendarProps {
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  onTimeSelect: (timeSlot: TimeSlot) => void
  selectedTimeSlot?: TimeSlot
  doctorId?: string
  appointmentType?: 'consultation' | 'surgery' | 'checkup'
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
]

// 샘플 타임슬롯 데이터 (실제로는 Supabase에서 가져옴)
const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  if (isWeekend && date.getDay() === 0) {
    // 일요일은 휴진
    return []
  }
  
  const startHour = 9
  const endHour = isWeekend ? 13 : 18 // 토요일은 13시까지
  const lunchStart = 12.5 // 12:30
  const lunchEnd = 13.5 // 13:30
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = hour + minute / 60
      
      // 점심시간 제외 (평일만)
      if (!isWeekend && timeValue >= lunchStart && timeValue < lunchEnd) {
        continue
      }
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const isAvailable = Math.random() > 0.3 // 70% 확률로 예약 가능
      
      slots.push({
        id: `${date.toISOString().split('T')[0]}-${timeString}`,
        time: timeString,
        available: isAvailable,
        doctorId: 'dr-kim',
        appointmentType: 'consultation'
      })
    }
  }
  
  return slots
}

export function Calendar({ 
  selectedDate = new Date(), 
  onDateSelect, 
  onTimeSelect, 
  selectedTimeSlot,
  doctorId = 'dr-kim',
  appointmentType = 'consultation'
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  // 현재 달의 캘린더 날짜들 생성
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.getTime() === today.getTime()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
      const isPast = date < today
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isSunday = date.getDay() === 0
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isPast,
        isWeekend,
        isSunday,
        isSelectable: isCurrentMonth && !isPast && !isSunday
      })
    }
    
    return days
  }

  // 선택된 날짜의 타임슬롯 로드
  useEffect(() => {
    if (selectedDate) {
      setLoading(true)
      // 실제로는 Supabase에서 데이터를 가져옴
      setTimeout(() => {
        const slots = generateTimeSlots(selectedDate)
        setTimeSlots(slots)
        setLoading(false)
      }, 500)
    }
  }, [selectedDate, doctorId, appointmentType])

  const handleDateClick = (day: any) => {
    if (day.isSelectable) {
      onDateSelect(day.date)
    }
  }

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      onTimeSelect(slot)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const calendarDays = generateCalendarDays()
  const selectedDayInfo = selectedDate ? {
    dayName: DAYS_OF_WEEK[selectedDate.getDay()],
    dateString: `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`
  } : null

  return (
    <div className="space-y-6">
      {/* 캘린더 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-brand-primary-600" />
              날짜 선택
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[80px] text-center">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={day}
                className={cn(
                  "p-2 text-center text-sm font-medium",
                  index === 0 ? "text-red-500" : "text-neutral-600"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <motion.button
                key={index}
                whileHover={day.isSelectable ? { scale: 1.05 } : {}}
                whileTap={day.isSelectable ? { scale: 0.95 } : {}}
                onClick={() => handleDateClick(day)}
                disabled={!day.isSelectable}
                className={cn(
                  "relative p-2 text-sm rounded-lg transition-all duration-200",
                  "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-primary-500",
                  {
                    // 기본 스타일
                    "text-neutral-900": day.isCurrentMonth && day.isSelectable,
                    "text-neutral-400": !day.isCurrentMonth || day.isPast,
                    "text-red-500": day.isSunday,
                    
                    // 선택된 날짜
                    "bg-brand-primary-600 text-white hover:bg-brand-primary-700": day.isSelected,
                    
                    // 오늘 날짜
                    "bg-brand-secondary-100 text-brand-secondary-700 font-semibold": day.isToday && !day.isSelected,
                    
                    // 비활성화된 날짜
                    "cursor-not-allowed opacity-50": !day.isSelectable,
                    "cursor-pointer": day.isSelectable
                  }
                )}
              >
                {day.date.getDate()}
                
                {/* 오늘 표시 */}
                {day.isToday && !day.isSelected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-secondary-600 rounded-full" />
                )}
              </motion.button>
            ))}
          </div>

          {/* 캘린더 범례 */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-brand-primary-600 rounded-sm" />
              <span>선택된 날짜</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-brand-secondary-100 rounded-sm" />
              <span>오늘</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded-sm" />
              <span>휴진일</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시간 선택 */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-secondary-600" />
              시간 선택
              {selectedDayInfo && (
                <span className="text-base font-normal text-neutral-600">
                  - {selectedDayInfo.dateString} ({selectedDayInfo.dayName})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">예약 가능한 시간을 불러오는 중...</p>
                </div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 mb-1">선택하신 날짜에 예약 가능한 시간이 없습니다.</p>
                <p className="text-sm text-neutral-400">다른 날짜를 선택해주세요.</p>
              </div>
            ) : (
              <div>
                {/* 시간대별 그룹핑 */}
                <div className="space-y-4">
                  {/* 오전 */}
                  {timeSlots.filter(slot => parseInt(slot.time) < 12).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">오전</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots
                          .filter(slot => parseInt(slot.time) < 12)
                          .map((slot) => (
                            <motion.button
                              key={slot.id}
                              whileHover={slot.available ? { scale: 1.02 } : {}}
                              whileTap={slot.available ? { scale: 0.98 } : {}}
                              onClick={() => handleTimeSlotClick(slot)}
                              disabled={!slot.available}
                              className={cn(
                                "p-2 text-sm rounded-lg border transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-brand-primary-500",
                                {
                                  // 예약 가능한 시간
                                  "border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary-300 hover:bg-brand-primary-50": 
                                    slot.available && selectedTimeSlot?.id !== slot.id,
                                  
                                  // 선택된 시간
                                  "border-brand-primary-600 bg-brand-primary-600 text-white": 
                                    selectedTimeSlot?.id === slot.id,
                                  
                                  // 예약 불가능한 시간
                                  "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed": 
                                    !slot.available
                                }
                              )}
                            >
                              {slot.time}
                            </motion.button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 오후 */}
                  {timeSlots.filter(slot => parseInt(slot.time) >= 12).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">오후</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots
                          .filter(slot => parseInt(slot.time) >= 12)
                          .map((slot) => (
                            <motion.button
                              key={slot.id}
                              whileHover={slot.available ? { scale: 1.02 } : {}}
                              whileTap={slot.available ? { scale: 0.98 } : {}}
                              onClick={() => handleTimeSlotClick(slot)}
                              disabled={!slot.available}
                              className={cn(
                                "p-2 text-sm rounded-lg border transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-brand-primary-500",
                                {
                                  "border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary-300 hover:bg-brand-primary-50": 
                                    slot.available && selectedTimeSlot?.id !== slot.id,
                                  "border-brand-primary-600 bg-brand-primary-600 text-white": 
                                    selectedTimeSlot?.id === slot.id,
                                  "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed": 
                                    !slot.available
                                }
                              )}
                            >
                              {slot.time}
                            </motion.button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 예약 안내 */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">예약 안내</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 진료 예약은 당일부터 30일 후까지 가능합니다</li>
                        <li>• 수술 예약은 별도 상담 후 진행됩니다</li>
                        <li>• 예약 변경/취소는 예약일 1일 전까지 가능합니다</li>
                        <li>• 응급상황 시 1544-7260으로 연락 주세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
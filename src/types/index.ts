// 공통 타입 정의

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  userId: string
  doctorId: string
  type: 'consultation' | 'surgery' | 'checkup'
  date: Date
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
} 
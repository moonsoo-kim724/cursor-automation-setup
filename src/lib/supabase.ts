/**
 * Supabase 클라이언트 설정
 * YSK 연수김안과의원 - 2RU4 프로젝트
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 개발 환경에서는 더미 클라이언트 생성 (빌드 오류 방지)
export const supabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-url') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string | null
          email: string | null
          phone: string | null
          inquiry_type: string
          message: string | null
          source: string
          status: string
          score: number
          priority: string
          metadata: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          inquiry_type: string
          message?: string | null
          source: string
          status?: string
          score?: number
          priority?: string
          metadata?: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          inquiry_type?: string
          message?: string | null
          source?: string
          status?: string
          score?: number
          priority?: string
          metadata?: any
        }
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string | null
          source: string
          status: string
          confirmed_at: string | null
          unsubscribed_at: string | null
          metadata: any
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name?: string | null
          source: string
          status?: string
          confirmed_at?: string | null
          unsubscribed_at?: string | null
          metadata?: any
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string | null
          source?: string
          status?: string
          confirmed_at?: string | null
          unsubscribed_at?: string | null
          metadata?: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  // URL 유효성 검사
  try {
    new URL(supabaseUrl)
  } catch (error) {
    console.warn('Invalid Supabase URL, using placeholder')
    return null
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

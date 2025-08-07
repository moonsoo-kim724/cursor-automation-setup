/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Mayo Clinic / Philips Healthcare 스타일 브랜드 컬러 (Medical Excellence)
        brand: {
          // Primary - Professional Blue (#0054A6)
          primary: {
            50: '#f0f7ff',
            100: '#e0efff',
            200: '#c7e2ff',
            300: '#a5d0ff',
            400: '#7fb4ff',
            500: '#5a98ff',
            600: '#2f7cff',
            700: '#0054a6',
            800: '#004085',
            900: '#003366',
          },
          // Secondary - Light Medical Blue (#F0F7FF)
          secondary: {
            50: '#f0f7ff',
            100: '#e0efff',
            200: '#c7e2ff',
            300: '#a5d0ff',
            400: '#7fb4ff',
            500: '#5a98ff',
            600: '#2f7cff',
            700: '#1e5eff',
            800: '#0054a6',
            900: '#003366',
          },
          // Accent - Healthcare Teal (#00A8CC)
          accent: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#00a8cc',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
          },
          // Success - Medical Green (예약 완료, 성공 상태)
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          // Trust - Deep Navy (신뢰성과 전문성)
          trust: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        },
        // 시스템 컬러
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // 중성 컬러 (한글 가독성 최적화)
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        // Vercel 스타일 폰트 스택 (Pretendard 기반)
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
        heading: [
          'Pretendard',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'monospace',
        ],
      },
      fontSize: {
        // Vercel 스타일 타이포그래피 스케일 (디자인 가이드 준수)
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '400' }],
        'base': ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '400' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.01em', fontWeight: '400' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '500' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Medical 스타일 그림자 시스템 (Mayo Clinic 스타일)
        'soft': '0 1px 3px rgba(0, 84, 166, 0.05)',
        'medium': '0 4px 6px rgba(0, 84, 166, 0.08)',
        'large': '0 10px 15px rgba(0, 84, 166, 0.12)',
        'xl': '0 20px 25px rgba(0, 84, 166, 0.15)',
        'brand': '0 4px 14px rgba(0, 84, 166, 0.2)',
        'accent': '0 4px 14px rgba(0, 168, 204, 0.15)',
        'trust': '0 8px 25px rgba(15, 23, 42, 0.1)',
        'glow': '0 0 20px rgba(0, 84, 166, 0.3)',
        'medical': '0 2px 8px rgba(0, 84, 166, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

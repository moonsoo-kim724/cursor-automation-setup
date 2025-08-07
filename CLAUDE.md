# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 AI-powered landing page for YSK Eye Clinic (연수김안과의원), featuring AI chatbot consultation, appointment booking, and multilingual support. The project uses modern web technologies with a focus on Korean market medical regulations and accessibility standards.

## Common Development Commands

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Type checking
npm run type-check

# Clean build artifacts
npm run clean

# Bundle analysis
npm run analyze
```

### Project-Specific Scripts
- `npm run dev` - Starts development server on http://localhost:3000
- `npm run build` - Creates optimized production build
- `npm run lint:fix` - Auto-fixes ESLint issues
- `npm run format` - Formats code with Prettier
- `npm run type-check` - TypeScript type checking without emit

## Architecture & Code Structure

### Next.js 14 App Router Architecture
The project uses Next.js 14 with App Router (not Pages Router):
- `/src/app/` - App Router structure with layout.tsx and page.tsx
- `/src/components/` - Reusable UI components with shadcn/ui system
- `/src/lib/` - Utility functions and configurations
- `/src/types/` - TypeScript type definitions

### Key Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4 with custom brand colors
- **UI Library**: shadcn/ui components + Radix UI primitives
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: OpenAI API for chatbot functionality

### Brand Color System
The project uses a medical-focused brand color palette:
```css
/* Primary - Trust-inspiring navy blue */
brand-primary-50 to brand-primary-900

/* Secondary - Life-representing green */
brand-secondary-50 to brand-secondary-900

/* Accent - Technology-representing violet */
brand-accent-50 to brand-accent-900
```

### Component Structure
- `/src/components/ui/` - shadcn/ui base components (button, card, input, etc.)
- Main components include advanced AI chatbot with multilingual support
- Components follow Korean accessibility standards (KWCAG 2.1)

### AI Chatbot Implementation
The chatbot component (`/src/components/ui/chatbot.tsx`) features:
- Multilingual support (Korean, English, Chinese)
- Medical compliance with legal disclaimers
- Structured expert responses for common eye conditions
- Appointment booking integration
- Voice interaction capabilities (planned)

### Key Features
1. **SEO/AEO Optimization**: Comprehensive metadata in layout.tsx with structured data
2. **Multilingual Support**: Korean-first with English/Chinese translations
3. **Medical Compliance**: Adheres to Korean medical advertising regulations
4. **Accessibility**: KWCAG 2.1 AA compliance with semantic markup
5. **Performance**: Optimized for Core Web Vitals and mobile-first design

### API Integration
- `/src/app/api/chatbot/route.ts` - AI chatbot API endpoint
- OpenAI GPT integration for intelligent medical consultations
- Respects medical law restrictions on diagnostic claims

## Development Guidelines

### Korean Market Considerations
- All primary content should be in Korean with proper font optimization (Noto Sans KR)
- Medical advertising compliance is critical - avoid absolute claims
- Include proper medical disclaimers in AI responses
- Follow Korean accessibility standards (KWCAG 2.1)

### File Naming & Structure
- Use kebab-case for file names
- TypeScript files should have explicit type definitions
- Components should be in PascalCase
- Utility functions in camelCase

### Styling Conventions
- Use Tailwind CSS with custom brand colors
- Prefer component-level styling over global CSS
- Use CSS custom properties for dynamic theming
- Implement proper responsive design (mobile-first)

### TypeScript Usage
- All components should have proper TypeScript interfaces
- Use strict mode type checking
- Define types in `/src/types/` for reusability
- Prefer explicit return types for functions

### Medical Content Guidelines
- Always include medical disclaimers
- Never make absolute treatment claims
- Encourage professional consultation
- Respect patient privacy and data protection

## Environment Variables Required

Create `.env.local` with:
```env
# OpenAI API for chatbot
OPENAI_API_KEY=your_openai_api_key

# Additional integrations (if implemented)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KAKAO_API_KEY=your_kakao_api_key
COOLSMS_API_KEY=your_coolsms_api_key
COOLSMS_API_SECRET=your_coolsms_secret
```

## Deployment Notes

- Primary deployment: Vercel (optimized for Next.js)
- Uses Vercel Edge Functions for API routes
- Static assets served through Vercel CDN
- Environment variables configured in Vercel dashboard

## Medical & Legal Compliance

This project operates under Korean medical advertising regulations:
- No exaggerated treatment claims
- Proper medical disclaimers required
- Patient data protection (GDPR + Korean privacy laws)
- Professional medical consultation encouraged
- Emergency situations directed to proper medical facilities

When modifying medical content or AI responses, ensure compliance with Korean medical advertising standards and never provide direct medical diagnoses or treatment recommendations.

# 🚀 YSK 랜딩페이지 배포 가이드

연수김안과의원 AI 랜딩페이지의 CI/CD 파이프라인 설정 및 배포 가이드입니다.

## 📋 목차

1. [환경 설정](#환경-설정)
2. [GitHub Actions 설정](#github-actions-설정)
3. [Vercel 배포 설정](#vercel-배포-설정)
4. [Supabase 연동](#supabase-연동)
5. [환경 변수 관리](#환경-변수-관리)
6. [배포 프로세스](#배포-프로세스)
7. [CodeRabbit AI 리뷰 시스템](#coderabbit-ai-리뷰-시스템)

---

## 🔧 환경 설정

### 1. 필수 계정
- **GitHub**: 소스 코드 관리
- **Vercel**: 프론트엔드 배포
- **Supabase**: 백엔드 데이터베이스

### 2. 로컬 개발 환경
```bash
# Node.js 20 이상 필요
node --version  # v20.x.x

# 프로젝트 클론 및 설치
git clone https://github.com/moonsoo-kim724/YSK-LandingPage.git
cd YSK-LandingPage
npm install
```

---

## 🤖 GitHub Actions 설정

### Secrets 설정
GitHub 리포지토리의 `Settings > Secrets and variables > Actions`에서 다음 secrets을 추가하세요:

```bash
# Supabase 관련
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx
SUPABASE_PROJECT_REF=xxxxxxxxxxxxxx
SUPABASE_DB_PASSWORD=your_db_password

# API Keys (선택사항)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### 워크플로우 설명

#### 1. 프로덕션 배포 (`deploy.yml`)
- **트리거**: `main` 또는 `master` 브랜치에 푸시
- **작업**:
  - 린팅 및 타입 체크
  - 빌드 테스트
  - Supabase 마이그레이션 배포
  - 보안 스캔
  - 배포 결과 알림

#### 2. 프리뷰 배포 (`preview.yml`)
- **트리거**: Pull Request 생성/업데이트
- **작업**:
  - 프리뷰 빌드
  - 보안 체크
  - 성능 테스트
  - PR 코멘트 자동 생성

---

## ⚡ Vercel 배포 설정

### 1. 프로젝트 연결
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 리포지토리 선택: `YSK-LandingPage`
4. 프로젝트 설정:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

### 2. 환경 변수 설정
Vercel Dashboard > 프로젝트 > Settings > Environment Variables:

```bash
# Production 환경
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
NODE_ENV=production

# Preview 환경
NEXT_PUBLIC_APP_URL=https://preview-ysk.vercel.app
```

### 3. 도메인 설정
1. Vercel Dashboard > 프로젝트 > Settings > Domains
2. 커스텀 도메인 추가: `ysk-eye.ai`
3. DNS 설정 완료

---

## 🗄️ Supabase 연동

### 1. 프로젝트 연결
```bash
# Supabase CLI 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref your-project-ref

# 초기 마이그레이션 적용
npx supabase db push
```

### 2. 로컬 개발 환경
```bash
# 로컬 Supabase 시작
npm run supabase:start

# 상태 확인
npm run supabase:status

# 스키마 리셋 (개발용)
npm run db:reset
```

### 3. 마이그레이션 관리
```bash
# 새 마이그레이션 생성
npx supabase migration new add_new_table

# 마이그레이션 적용
npm run db:migrate

# 스키마 차이 확인
npm run supabase:diff
```

---

## 🔐 환경 변수 관리

### 로컬 개발 (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# 기타
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 프로덕션 환경 변수 체크리스트
- [ ] Supabase URL 및 키 설정
- [ ] OpenAI API 키 설정
- [ ] 도메인 URL 설정
- [ ] 보안 관련 환경 변수 확인

---

## 🚀 배포 프로세스

### 1. 개발 → 프리뷰
```bash
# 새 기능 브랜치 생성
git checkout -b feature/new-feature

# 개발 및 커밋
git add .
git commit -m "feat: add new feature"

# Push (자동으로 프리뷰 배포 트리거)
git push origin feature/new-feature

# Pull Request 생성 (GitHub UI에서)
```

### 2. 프리뷰 → 프로덕션
```bash
# PR 검토 및 승인 후 main으로 머지
git checkout main
git pull origin main

# 자동으로 프로덕션 배포 시작
# GitHub Actions에서 진행 상황 확인
```

### 3. 핫픽스 배포
```bash
# 긴급 수정사항
git checkout -b hotfix/urgent-fix
# ... 수정 작업
git commit -m "fix: urgent security patch"

# 직접 main으로 푸시 (비상시에만)
git checkout main
git merge hotfix/urgent-fix
git push origin main
```

---

## 📊 모니터링 및 로그

### 1. Vercel 대시보드
- 배포 상태 확인
- 빌드 로그 모니터링
- 성능 메트릭 추적
- 에러 로그 확인

### 2. GitHub Actions
- 워크플로우 실행 상태
- 빌드/테스트 결과
- 보안 스캔 리포트
- 알림 설정

### 3. Supabase 대시보드
- 데이터베이스 상태
- API 사용량
- 실시간 로그
- 성능 모니터링

---

## 🆘 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 에러 확인
npm run type-check

# 린트 에러 확인
npm run lint
```

### Supabase 연결 오류
```bash
# 연결 상태 확인
npx supabase status

# 프로젝트 재연결
npx supabase link --project-ref your-project-ref

# 마이그레이션 상태 확인
npx supabase migration list
```

### 환경 변수 문제
1. `.env.local` 파일 존재 확인
2. Vercel 환경 변수 설정 확인
3. GitHub Secrets 설정 확인
4. 변수명 오타 확인

---

## 🤖 CodeRabbit AI 리뷰 시스템

### 1. 자동 코드 리뷰 활성화

PR 생성 시 자동으로 CodeRabbit AI가 코드를 분석하고 리뷰합니다:

- **보안 검사**: SQL 인젝션, XSS, 개인정보 노출 검사
- **성능 분석**: Bundle 크기, Core Web Vitals 최적화
- **접근성 검증**: WCAG 2.1 AA 준수 확인
- **코드 품질**: TypeScript 안전성, 컴포넌트 재사용성
- **의료 규정**: 과장 광고 방지, 개인정보보호법 준수

### 2. 사용 방법

```bash
# 1. 기능 브랜치 생성
git checkout -b feature/new-feature

# 2. 코드 작성 후 푸시
git push origin feature/new-feature

# 3. GitHub에서 PR 생성
# → CodeRabbit이 1-2분 내 자동 리뷰 시작 🤖
```

### 3. 리뷰 결과 확인

PR 페이지에서 다음을 확인할 수 있습니다:

- **📊 리뷰 요약**: 변경사항 개요 및 주요 포인트
- **🔍 상세 분석**: 각 파일별 구체적 피드백
- **⚠️ 주의사항**: 잠재적 문제점 및 보안 위험
- **🎯 권장사항**: 성능, 접근성, 코드 품질 개선 방안

### 4. 대화형 리뷰

CodeRabbit과 직접 대화 가능:

```markdown
@coderabbitai 이 컴포넌트의 성능을 더 최적화할 방법이 있을까요?
@coderabbitai 접근성 관점에서 추가로 개선할 점은?
@coderabbitai 이 API 호출의 보안 위험은 없나요?
```

### 5. 품질 체크리스트

각 PR마다 자동 생성되는 체크리스트:

- [ ] 🔒 개인정보 보호 규정 준수
- [ ] ⚡ Core Web Vitals 최적화
- [ ] 🎯 WCAG 2.1 AA 접근성 준수
- [ ] 🧩 TypeScript 타입 안전성
- [ ] 📱 모바일 반응형 디자인
- [ ] 🎨 YSK 브랜드 가이드라인 준수
- [ ] 🔐 Supabase RLS 정책 적용
- [ ] 🚀 Next.js 14 App Router 활용
- [ ] 🤖 AI 챗봇 의료법 준수
- [ ] 📊 SEO/AEO 최적화

자세한 사용법은 [CODERABBIT.md](./CODERABBIT.md) 문서를 참고하세요.

---

## 📞 지원

배포 관련 문제가 발생하면:
1. GitHub Issues에 문제 상황 리포트
2. 로그 스크린샷 첨부
3. 단계별 재현 방법 명시

---

**🎉 배포 완료 후 확인사항**
- [ ] 웹사이트 정상 접속 (https://ysk-eye.ai)
- [ ] AI 챗봇 기능 테스트
- [ ] 예약 시스템 테스트
- [ ] 관리자 페이지 접속 (/admin/faq)
- [ ] 모바일 반응형 확인
- [ ] 성능 점수 확인 (Lighthouse 95+)

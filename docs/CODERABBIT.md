# 🤖 CodeRabbit AI 코드 리뷰 가이드

연수김안과 AI 랜딩페이지 프로젝트의 CodeRabbit AI 자동 코드 리뷰 시스템 사용 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [설정 방법](#설정-방법)
3. [사용 방법](#사용-방법)
4. [리뷰 기준](#리뷰-기준)
5. [고급 기능](#고급-기능)
6. [트러블슈팅](#트러블슈팅)

---

## 🎯 개요

CodeRabbit AI는 PR(Pull Request)에 대해 자동으로 코드 리뷰를 수행하는 AI 도구입니다. 

### 주요 기능
- 🔍 **자동 코드 분석**: TypeScript, React, Next.js 패턴 검증
- 🔒 **보안 스캔**: 취약점 및 개인정보 노출 검사
- ⚡ **성능 최적화**: Bundle 크기, 렌더링 성능 분석
- 🎯 **접근성 검사**: WCAG 2.1 AA 준수 확인
- 🧩 **코드 품질**: 재사용성, 유지보수성 평가
- 📱 **반응형 검증**: 모바일 우선 디자인 확인

---

## ⚙️ 설정 방법

### 1. GitHub Secrets 설정

GitHub 리포지토리의 `Settings > Secrets and variables > Actions`에서 다음을 설정:

```bash
# OpenAI API Key (CodeRabbit 사용용)
OPENAI_API_KEY=sk-your_openai_key_here

# CodeRabbit API Key (선택사항)
CODERABBIT_API_KEY=cr-your_coderabbit_key_here
```

### 2. 자동 활성화

설정이 완료되면 다음 이벤트 시 자동으로 실행됩니다:
- PR 생성 시 (`pull_request: opened`)
- PR 업데이트 시 (`pull_request: synchronize`)
- PR 재오픈 시 (`pull_request: reopened`)
- 리뷰 코멘트 작성 시 (`pull_request_review_comment: created`)

---

## 🚀 사용 방법

### 1. 기본 워크플로우

```bash
# 1. 새 기능 브랜치 생성
git checkout -b feature/new-feature

# 2. 코드 작성 및 커밋
git add .
git commit -m "feat: add new feature"

# 3. 브랜치 푸시
git push origin feature/new-feature

# 4. GitHub에서 PR 생성
# → CodeRabbit이 자동으로 리뷰 시작 🤖
```

### 2. PR에서 확인할 내용

PR 생성 후 1-2분 내에 다음을 확인할 수 있습니다:

#### ✅ **자동 생성되는 내용**
- **📊 리뷰 요약**: 변경사항 개요 및 주요 포인트
- **🔍 상세 리뷰**: 각 파일별 구체적 피드백
- **⚠️ 이슈 지적**: 잠재적 문제점 및 개선 제안
- **🎯 권장사항**: 성능, 보안, 접근성 개선 방안

#### 📝 **리뷰 예시**
```markdown
## 🔍 CodeRabbit AI 리뷰 요약

### 📊 변경사항 개요
- 수정된 파일: 3개
- 추가된 줄: +127
- 삭제된 줄: -23

### ⭐ 주요 개선사항
- TypeScript strict 모드 활용 우수
- 컴포넌트 재사용성 높음
- Tailwind CSS 일관성 유지

### ⚠️ 주의사항
- API 키 하드코딩 위험
- 이미지 alt 속성 누락
- 번들 크기 증가 가능성

### 🎯 권장사항
- React.memo 활용한 성능 최적화
- 에러 바운더리 추가 고려
- SEO 메타 태그 보완
```

---

## 📏 리뷰 기준

### 🔒 보안 (최우선)
- ✅ 환경변수 사용 확인
- ✅ SQL 인젝션 방지
- ✅ XSS 취약점 검사
- ✅ 개인정보 암호화
- ✅ CORS 설정 검증

### ⚡ 성능
- ✅ Core Web Vitals 최적화
- ✅ 번들 크기 모니터링
- ✅ 이미지 최적화 (WebP, AVIF)
- ✅ 코드 스플리팅
- ✅ 캐싱 전략

### 🎯 접근성
- ✅ WCAG 2.1 AA 준수
- ✅ 키보드 내비게이션
- ✅ 스크린 리더 호환성
- ✅ 색상 대비 검사
- ✅ Alt 텍스트 확인

### 🧩 코드 품질
- ✅ TypeScript 타입 안전성
- ✅ 컴포넌트 재사용성
- ✅ 함수 길이 (<50줄)
- ✅ 복잡도 (<10)
- ✅ 네이밍 컨벤션

### 📱 반응형
- ✅ 모바일 우선 디자인
- ✅ Breakpoint 적절성
- ✅ 터치 인터페이스 고려
- ✅ 세로/가로 모드 대응

### 🏥 의료 규정
- ✅ 과장 광고 금지
- ✅ 개인정보보호법 준수
- ✅ 의료법 준수
- ✅ 환자 데이터 보호

---

## 🔧 고급 기능

### 1. 대화형 리뷰

CodeRabbit과 직접 대화할 수 있습니다:

```markdown
@coderabbitai 이 컴포넌트의 성능을 더 최적화할 방법이 있을까요?

@coderabbitai 접근성 관점에서 추가로 개선할 점은?

@coderabbitai 이 API 호출의 보안 위험은 없나요?
```

### 2. 커스텀 체크리스트

PR마다 자동으로 생성되는 체크리스트:

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

### 3. 주간 품질 리포트

매주 자동으로 생성되는 코드 품질 리포트:
- 📈 품질 트렌드 분석
- 🐛 발견된 이슈 통계
- ⚡ 성능 개선 현황
- 🎯 팀 생산성 지표

---

## 🆘 트러블슈팅

### CodeRabbit이 리뷰하지 않는 경우

1. **GitHub Actions 확인**
   ```bash
   # Actions 탭에서 워크플로우 실행 상태 확인
   # 실패 시 로그 확인
   ```

2. **API 키 확인**
   ```bash
   # Settings > Secrets에서 OPENAI_API_KEY 존재 확인
   # 키 유효성 검증
   ```

3. **권한 확인**
   ```yaml
   # .github/workflows/coderabbit-review.yml에서
   permissions:
     contents: read
     pull-requests: write  # 이 권한 필요
   ```

### 리뷰가 너무 많거나 적은 경우

**너무 많은 리뷰**:
```yaml
# .coderabbit.yaml에서 조정
reviews:
  review_simple_changes: false  # 간단한 변경사항 제외
  max_function_length: 100      # 함수 길이 임계값 증가
```

**너무 적은 리뷰**:
```yaml
# .coderabbit.yaml에서 조정
reviews:
  review_simple_changes: true   # 간단한 변경사항도 포함
  max_function_length: 30       # 함수 길이 임계값 감소
```

### 특정 파일 제외

```yaml
# .coderabbit.yaml
ignore:
  - "src/components/legacy/**"  # 레거시 코드 제외
  - "**/*.test.ts"              # 테스트 파일 제외
  - "src/temp/**"               # 임시 파일 제외
```

---

## 🎯 베스트 프랙티스

### 1. PR 크기 관리
- 한 번에 500줄 이하로 변경
- 단일 기능/버그픽스로 범위 제한
- 큰 변경사항은 여러 PR로 분할

### 2. 리뷰 피드백 활용
- CodeRabbit 제안사항 적극 반영
- 의견 불일치 시 팀 토론
- 학습한 내용을 팀과 공유

### 3. 지속적 개선
- 주간 품질 리포트 정기 검토
- 반복되는 이슈 패턴 분석
- 설정 파일 지속적 튜닝

---

## 📞 지원 및 문의

CodeRabbit 관련 문제 발생 시:

1. **GitHub Issues**에 문제 상황 리포트
2. **Actions 로그** 스크린샷 첨부
3. **에러 메시지** 전문 포함
4. **재현 단계** 상세 기록

---

**🎉 CodeRabbit과 함께 더 나은 코드를 작성해보세요!** 🚀
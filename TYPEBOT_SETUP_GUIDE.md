# 🤖 타입봇 "눈콩이" 설정 가이드

## 📋 개요

연수김안과의원 전용 AI 상담 챗봇 "눈콩이"를 타입봇(Typebot.io)에 설정하는 완전한 가이드입니다.

## 🚀 1단계: Typebot.io 계정 생성 및 로그인

### 1-1. 계정 생성
1. **https://app.typebot.io** 접속
2. 구글 계정으로 회원가입/로그인
3. 대시보드 접속 확인

### 1-2. 새 타입봇 생성
1. 대시보드에서 **"+ Create a typebot"** 클릭
2. **"Import from file"** 선택
3. 아래 두 가지 방법 중 선택:

#### 방법 A: 파일 업로드
1. `data/typebot/nunkongi-blueprint.json` 파일 업로드
2. **"Import"** 버튼 클릭

#### 방법 B: JSON 직접 붙여넣기 (권장)
1. **"Paste JSON"** 또는 텍스트 입력 영역 선택
2. 아래 JSON 코드 전체를 복사하여 붙여넣기:

```json
{
  "version": "6",
  "id": "cl1a2b3c4d5e6f7g8h9i0",
  "name": "연수김안과_눈콩이_퍼널",
  "publicId": null,
  "settings": {
    "general": {
      "isBrandingEnabled": false,
      "isInputPrefillEnabled": true
    },
    "typingEmulation": {
      "enabled": true,
      "speed": 300,
      "maxDelay": 1500
    },
    "metadata": {
      "title": "연수김안과 눈콩이",
      "description": "눈 건강 상담 챗봇"
    }
  },
  "theme": {
    "general": {
      "font": "Noto Sans KR"
    },
    "chat": {
      "hostBubbles": {
        "backgroundColor": "#F3F4F6",
        "color": "#1F2937"
      },
      "guestBubbles": {
        "backgroundColor": "#10b981",
        "color": "#ffffff"
      },
      "buttons": {
        "backgroundColor": "#10b981",
        "color": "#ffffff"
      }
    }
  }
}
```

## 🔧 2단계: 웹훅 블록 추가

### 2-1. 웹훅 블록 설정
현재 JSON에는 웹훅 블록이 포함되어 있으므로, 다음 사항만 확인하세요:

1. **예약 정보 입력** 그룹에서 **웹훅 블록** 확인
2. **웹훅 설정** 확인:
   - **Method**: `POST`
   - **URL**: `https://ysk-eye.ai/api/typebot/webhook`
   - **Headers**: `Content-Type: application/json`
   - **Body**:
   ```json
   {
     "name": "{{v3}}",
     "phone": "{{v4}}",
     "date": "{{v5}}",
     "branch": "{{v1}}",
     "subIntent": "{{v2}}",
     "freeText": "{{v7}}",
     "source": "typebot",
     "timestamp": "{{now}}"
   }
   ```

### 2-2. 변수 매핑 확인
- `v1`: branch (상담 분야)
- `v2`: subIntent (세부 의도)
- `v3`: name (성함)
- `v4`: phone (연락처)
- `v5`: date (희망 날짜)
- `v6`: time (희망 시간)
- `v7`: freeText (자유 텍스트)

## 🌐 3단계: 타입봇 게시 및 공유

### 3-1. 타입봇 게시
1. 우측 상단 **"Publish"** 버튼 클릭
2. 게시 설정 확인
3. **"Publish typebot"** 클릭

### 3-2. 공유 설정
1. **"Share"** 탭 클릭
2. **"Link"** 옵션에서 공개 링크 복사
3. **"Embed"** 옵션에서 임베드 코드 확인

### 3-3. 임베드 코드 예시
```html
<script type="module">
  import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0.3/dist/web.js'

  Typebot.initBubble({
    typebot: "연수김안과_눈콩이_퍼널",
    theme: {
      button: { backgroundColor: "#10b981" },
      chatWindow: { backgroundColor: "#ffffff" }
    }
  })
</script>
```

## 💻 4단계: 랜딩페이지 연결

### 4-1. 환경 변수 설정
`.env.local` 파일에 다음 추가:
```bash
# 타입봇 설정
NEXT_PUBLIC_TYPEBOT_ID=연수김안과_눈콩이_퍼널
TYPEBOT_WEBHOOK_SECRET=your_webhook_secret

# 알림 설정
RESEND_API_KEY=your_resend_api_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 4-2. 컴포넌트 사용법
```typescript
import { TypebotEmbed } from '@/components/ui/typebot-embed'

// 기본 사용법
<TypebotEmbed
  typebotId="연수김안과_눈콩이_퍼널"
  theme={{
    button: { backgroundColor: '#10b981' },
    chatWindow: { backgroundColor: '#ffffff' }
  }}
/>
```

## 🔄 5단계: 웹훅 테스트

### 5-1. 로컬 테스트
```bash
# 개발 서버 실행
npm run dev

# 타입봇에서 웹훅 URL 설정
http://localhost:3000/api/typebot/webhook
```

### 5-2. 프로덕션 테스트
```bash
# 프로덕션 배포 후
# 타입봇에서 웹훅 URL 변경
https://ysk-eye.ai/api/typebot/webhook
```

### 5-3. 웹훅 데이터 확인
브라우저 개발자 도구 → Network 탭에서 웹훅 요청/응답 확인:

**요청 예시:**
```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "date": "2024-01-15",
  "branch": "시력교정술",
  "subIntent": "라식",
  "source": "typebot"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Lead data received and processed successfully",
  "leadId": "abc123",
  "data": {
    "name": "홍길동",
    "serviceType": "시력교정술",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 📊 6단계: 데이터 확인

### 6-1. Supabase 데이터베이스 확인
```sql
-- 최근 리드 데이터 확인
SELECT * FROM leads
WHERE source = 'typebot'
ORDER BY created_at DESC
LIMIT 10;
```

### 6-2. 관리자 대시보드 확인
1. `https://ysk-eye.ai/dashboard` 접속
2. **"리드 관리"** 메뉴 확인
3. 타입봇에서 수집된 데이터 확인

## 🚨 7단계: 문제해결

### 7-1. 타입봇이 표시되지 않는 경우
```javascript
// 브라우저 콘솔에서 확인
console.log(window.Typebot) // undefined면 스크립트 로딩 실패

// 해결방법:
// 1. 네트워크 연결 확인
// 2. 타입봇 ID 확인
// 3. 브라우저 캐시 삭제
```

### 7-2. 웹훅이 작동하지 않는 경우
```bash
# 웹훅 URL 확인
curl -X POST https://ysk-eye.ai/api/typebot/webhook \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","phone":"010-1234-5678"}'

# 예상 응답: {"success": true, ...}
```

### 7-3. 데이터가 저장되지 않는 경우
1. **Supabase 연결 확인**:
   ```typescript
   // 환경변수 확인
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
   ```

2. **데이터베이스 스키마 확인**:
   ```sql
   -- leads 테이블 존재 확인
   SELECT table_name FROM information_schema.tables
   WHERE table_name = 'leads';
   ```

### 7-4. 알림이 발송되지 않는 경우
1. **이메일 알림**:
   ```bash
   # Resend API 키 확인
   curl -X GET https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY"
   ```

2. **Slack 알림**:
   ```bash
   # Slack 웹훅 테스트
   curl -X POST $SLACK_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"text":"테스트 메시지"}'
   ```

## 🎯 8단계: 최적화 및 커스터마이징

### 8-1. 대화 플로우 수정
1. 타입봇 편집 모드에서 블록 수정
2. 새로운 질문/답변 추가
3. 조건부 분기 설정
4. 변수 매핑 업데이트

### 8-2. 디자인 커스터마이징
```typescript
// 테마 색상 변경
<TypebotEmbed
  typebotId="연수김안과_눈콩이_퍼널"
  theme={{
    button: { backgroundColor: '#0054A6' }, // 브랜드 컬러
    chatWindow: { backgroundColor: '#F0F7FF' }
  }}
/>
```

### 8-3. 성능 최적화
```typescript
// 지연 로딩 설정
const TypebotEmbed = dynamic(() =>
  import('@/components/ui/typebot-embed'),
  {
    ssr: false,
    loading: () => <div>챗봇 로딩 중...</div>
  }
)
```

## 📈 9단계: 분석 및 모니터링

### 9-1. 타입봇 분석
1. 타입봇 대시보드 → **"Analytics"** 메뉴
2. 대화 완료율, 이탈 지점 분석
3. 사용자 피드백 수집

### 9-2. 웹훅 모니터링
```typescript
// API 로그 모니터링
console.log('Webhook requests:', {
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get('user-agent'),
  ip: request.headers.get('x-forwarded-for'),
  data: webhookData
})
```

### 9-3. 비즈니스 메트릭 추적
- 일일 상담 신청 수
- 상담 분야별 분포
- 예약 전환율
- 응답 시간

## ✅ 최종 체크리스트

- [ ] 타입봇 계정 생성 및 JSON import 완료
- [ ] 웹훅 블록 설정 및 URL 구성 완료
- [ ] 타입봇 게시 및 공유 설정 완료
- [ ] 랜딩페이지 임베드 코드 적용 완료
- [ ] 환경변수 설정 완료
- [ ] 웹훅 API 테스트 완료
- [ ] Supabase 데이터 저장 확인 완료
- [ ] 이메일/Slack 알림 테스트 완료
- [ ] 프로덕션 배포 및 도메인 설정 완료
- [ ] 전체 플로우 end-to-end 테스트 완료

## 🆘 지원 및 문의

- **타입봇 공식 문서**: https://docs.typebot.io
- **Supabase 문서**: https://supabase.com/docs
- **프로젝트 이슈**: GitHub Issues
- **기술 지원**: 개발팀 문의

---

이 가이드를 따라하시면 "눈콩이" 타입봇이 성공적으로 연수김안과의원 랜딩페이지에 통합됩니다! 🎉

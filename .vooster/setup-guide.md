# 🚀 Vooster.ai 대시보드 연동 설정 가이드

## 📋 연동 완료 상태

✅ **Vooster API 클라이언트 구현** → `/src/lib/vooster/client.ts`  
✅ **대시보드 API 연동** → `/src/app/api/dashboard/route.ts`  
✅ **웹훅 엔드포인트** → `/src/app/api/vooster/webhook/route.ts`  
✅ **실시간 대시보드 UI** → `/src/components/ui/dashboard.tsx`  
✅ **프로젝트 상태 동기화** → 로컬 + Vooster 통합

## 🔑 필수 환경변수 설정

### 개발 환경 (.env.local)
```bash
# Vooster.ai API 설정
VOOSTER_API_KEY=your_vooster_api_key_here
VOOSTER_PROJECT_ID=prj_dc9j4s3djswft2oz5a94spsk
VOOSTER_ORG_ID=withwinbiz
VOOSTER_WEBHOOK_SECRET=your_webhook_secret_here

# 기타 필수 설정
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 프로덕션 환경 (Vercel)
Vercel 대시보드 → Settings → Environment Variables에서 설정:

```bash
VOOSTER_API_KEY=your_production_vooster_api_key
VOOSTER_PROJECT_ID=prj_dc9j4s3djswft2oz5a94spsk
VOOSTER_ORG_ID=withwinbiz
VOOSTER_WEBHOOK_SECRET=your_production_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🔄 Vooster 웹훅 설정

### 1. Vooster.ai에서 웹훅 URL 등록
Vooster 프로젝트 설정에서 다음 URL을 웹훅 엔드포인트로 등록:

**개발환경**: `http://localhost:3000/api/vooster/webhook`  
**프로덕션**: `https://your-domain.vercel.app/api/vooster/webhook`

### 2. 웹훅 이벤트 구독
다음 이벤트들을 구독하도록 설정:
- `task.created` - 새 작업 생성
- `task.updated` - 작업 상태 변경  
- `task.completed` - 작업 완료
- `project.updated` - 프로젝트 정보 업데이트

## 📊 대시보드 접속 방법

### 로컬 개발환경
1. `npm run dev` 실행
2. http://localhost:3000 접속
3. 좌측 하단 "2RU4 대시보드" 버튼 클릭
4. http://localhost:3000/dashboard 에서 확인

### 실시간 연동 확인
- 대시보드 상단에 Vooster 연결 상태 표시
- 녹색 점: 연결됨 / 빨간 점: 연결 안됨
- 마지막 동기화 시간 표시
- Vooster 작업 목록 실시간 표시

## 🛠️ API 엔드포인트

### GET /api/dashboard
실시간 프로젝트 상태 조회
```json
{
  "project": { "id": "prj_dc9j4s3djswft2oz5a94spsk", ... },
  "voosterTasks": [...],
  "voosterConnected": true,
  "lastSync": "2025-08-05T10:32:32.293Z",
  ...
}
```

### POST /api/vooster/webhook  
Vooster에서 전송하는 웹훅 처리
```json
{
  "event": "task.completed",
  "project_id": "prj_dc9j4s3djswft2oz5a94spsk",
  "data": { "id": "T-006", "status": "completed", ... }
}
```

### GET /api/vooster/webhook
웹훅 엔드포인트 상태 확인
```json
{
  "message": "Vooster webhook endpoint is active",
  "status": "ready"
}
```

## 🔧 기능 설명

### 실시간 동기화
- Vooster 작업 상태 변경 시 즉시 로컬 대시보드에 반영
- 30초마다 자동 데이터 새로고침
- 연결 실패 시 로컬 데이터로 fallback

### 대시보드 기능
- **프로젝트 진행률**: 완료된 작업 수 기반 계산
- **실시간 메트릭**: 오늘 예약, 활성 채팅 등
- **Vooster 작업 목록**: 우선순위, 진행률 표시
- **빠른 액션**: 사이트 미리보기, Vooster 대시보드 링크

### 웹훅 처리
- 작업 생성/수정/완료 이벤트 처리
- 로컬 프로젝트 파일 자동 업데이트
- 실시간 클라이언트 업데이트 (향후 WebSocket 구현 예정)

## 🚨 문제 해결

### Vooster 연결 실패
1. API 키가 올바른지 확인
2. 프로젝트 ID가 정확한지 확인
3. 네트워크 연결 상태 확인
4. Vooster.ai 서비스 상태 확인

### 웹훅이 작동하지 않는 경우
1. 웹훅 URL이 올바르게 등록되었는지 확인
2. HTTPS 환경에서만 웹훅 수신 가능 (프로덕션)
3. 웹훅 시크릿 키 일치 여부 확인

### 대시보드 데이터가 업데이트되지 않는 경우
1. 브라우저 새로고침 (Ctrl+F5)
2. 개발자 도구에서 네트워크/콘솔 에러 확인
3. API 엔드포인트 직접 호출해서 데이터 확인

## 📈 다음 단계

1. **실시간 업데이트**: WebSocket 구현으로 즉시 반영
2. **알림 시스템**: 작업 완료 시 푸시 알림
3. **상세 분석**: 작업 시간, 효율성 메트릭 추가
4. **모바일 최적화**: 반응형 대시보드 개선

---

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. API 엔드포인트 테스트: `curl http://localhost:3000/api/dashboard`
2. 웹훅 테스트: `curl http://localhost:3000/api/vooster/webhook`
3. 환경변수 설정 확인
4. Vooster.ai 프로젝트 설정 확인

**연동 완료 상태**: ✅ 모든 기능 정상 작동 중
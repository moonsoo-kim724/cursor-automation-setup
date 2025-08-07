-- YSK 연수김안과의원 - 리마인더 추적 컬럼 추가
-- 예약 테이블에 리마인더 발송 상태 추적 컬럼들을 추가합니다

-- 1. reservations 테이블에 리마인더 추적 컬럼 추가
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS today_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS today_reminder_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. reservations 테이블에 알림 관련 컬럼 추가 (선택사항)
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "kakao": true}',
ADD COLUMN IF NOT EXISTS last_notification_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notification_count INTEGER DEFAULT 0;

-- 3. 알림 발송 로그 테이블 생성 (선택사항 - 상세 추적용)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- 'reminder', 'today_reminder', 'followup', 'confirmation', 'cancellation'
    channel TEXT NOT NULL, -- 'email', 'kakao', 'sms', 'slack'
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    message_id TEXT, -- 외부 서비스의 메시지 ID
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. notification_logs 테이블 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_logs_reservation_id ON notification_logs(reservation_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_patient_id ON notification_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);

-- 5. reservations 테이블 인덱스 추가 (리마인더 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_reservations_date_status ON reservations(reservation_date, status);
CREATE INDEX IF NOT EXISTS idx_reservations_reminder_flags ON reservations(reminder_sent, today_reminder_sent, followup_sent);

-- 6. RLS 정책 설정 (notification_logs)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 인증된 사용자만 알림 로그 조회 가능
CREATE POLICY "Allow authenticated users to view notification logs."
ON notification_logs FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS 정책: 시스템에서만 알림 로그 삽입 가능
CREATE POLICY "Allow system to insert notification logs."
ON notification_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- 7. 유용한 뷰 생성 (리마인더 상태 조회용)
CREATE OR REPLACE VIEW reminder_status AS
SELECT
    r.id as reservation_id,
    r.reservation_date,
    r.reservation_time,
    r.status as reservation_status,
    r.type as service_type,
    p.full_name as patient_name,
    p.phone_number,
    p.email,
    r.reminder_sent,
    r.today_reminder_sent,
    r.followup_sent,
    r.reminder_sent_at,
    r.today_reminder_sent_at,
    r.followup_sent_at,
    r.notification_count,
    CASE
        WHEN r.reservation_date = CURRENT_DATE THEN 'today'
        WHEN r.reservation_date = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
        WHEN r.reservation_date < CURRENT_DATE THEN 'past'
        ELSE 'future'
    END as date_category,
    CASE
        WHEN r.reservation_date < CURRENT_DATE AND r.status IN ('pending', 'confirmed') THEN true
        ELSE false
    END as is_potential_noshow
FROM reservations r
JOIN patients p ON r.patient_id = p.id
WHERE r.status IN ('pending', 'confirmed', 'completed')
ORDER BY r.reservation_date, r.reservation_time;

-- 8. 자동 알림 카운트 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_notification_count()
RETURNS TRIGGER AS $$
BEGIN
    -- 리마인더 관련 컬럼이 변경될 때마다 카운트 증가
    IF (OLD.reminder_sent = FALSE AND NEW.reminder_sent = TRUE) OR
       (OLD.today_reminder_sent = FALSE AND NEW.today_reminder_sent = TRUE) OR
       (OLD.followup_sent = FALSE AND NEW.followup_sent = TRUE) THEN

        NEW.notification_count = COALESCE(OLD.notification_count, 0) + 1;
        NEW.last_notification_sent = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_notification_count ON reservations;
CREATE TRIGGER trigger_update_notification_count
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_count();

-- 10. 성능 최적화를 위한 추가 인덱스
CREATE INDEX IF NOT EXISTS idx_reservations_date_reminder_flags
ON reservations(reservation_date, reminder_sent, today_reminder_sent, followup_sent);

-- 11. 유용한 함수: 리마인더 통계 조회
CREATE OR REPLACE FUNCTION get_reminder_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    total_appointments INTEGER,
    reminder_sent_count INTEGER,
    today_reminder_sent_count INTEGER,
    followup_sent_count INTEGER,
    pending_reminders INTEGER,
    potential_noshows INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_appointments,
        COUNT(CASE WHEN r.reminder_sent = TRUE THEN 1 END)::INTEGER as reminder_sent_count,
        COUNT(CASE WHEN r.today_reminder_sent = TRUE THEN 1 END)::INTEGER as today_reminder_sent_count,
        COUNT(CASE WHEN r.followup_sent = TRUE THEN 1 END)::INTEGER as followup_sent_count,
        COUNT(CASE WHEN r.reservation_date >= target_date AND r.reminder_sent = FALSE THEN 1 END)::INTEGER as pending_reminders,
        COUNT(CASE WHEN r.reservation_date < target_date AND r.status IN ('pending', 'confirmed') THEN 1 END)::INTEGER as potential_noshows
    FROM reservations r
    WHERE r.reservation_date >= target_date - INTERVAL '7 days' -- 지난 7일부터 조회
      AND r.status IN ('pending', 'confirmed', 'completed');
END;
$$ LANGUAGE plpgsql;

-- 12. 댓글 추가
COMMENT ON TABLE notification_logs IS '알림 발송 로그 테이블 - 모든 알림 발송 내역 추적';
COMMENT ON COLUMN reservations.reminder_sent IS '내일 예약 리마인더 발송 여부';
COMMENT ON COLUMN reservations.today_reminder_sent IS '당일 예약 리마인더 발송 여부';
COMMENT ON COLUMN reservations.followup_sent IS '노쇼 후속 조치 발송 여부';
COMMENT ON VIEW reminder_status IS '리마인더 발송 상태 조회 뷰';
COMMENT ON FUNCTION get_reminder_stats IS '리마인더 발송 통계 조회 함수';

-- 마이그레이션 완료 로그
INSERT INTO public.schema_migrations (version, applied_at)
VALUES ('004_reminder_tracking', NOW())
ON CONFLICT (version) DO NOTHING;

-- 리드 추적 테이블 생성
CREATE TABLE lead_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('leadbot', 'typebot', 'manual', 'phone', 'walk-in')),
    service_type TEXT NOT NULL,
    lead_data JSONB NOT NULL, -- 원본 리드 데이터 저장
    conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
    follow_up_count INTEGER DEFAULT 0,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_lead_tracking_patient_id ON lead_tracking(patient_id);
CREATE INDEX idx_lead_tracking_reservation_id ON lead_tracking(reservation_id);
CREATE INDEX idx_lead_tracking_source ON lead_tracking(source);
CREATE INDEX idx_lead_tracking_conversion_status ON lead_tracking(conversion_status);
CREATE INDEX idx_lead_tracking_created_at ON lead_tracking(created_at DESC);
CREATE INDEX idx_lead_tracking_service_type ON lead_tracking(service_type);

-- RLS 정책 활성화
ALTER TABLE lead_tracking ENABLE ROW LEVEL SECURITY;

-- 관리자용 정책 (임시로 모든 접근 허용)
CREATE POLICY "Allow admin users to manage lead tracking" ON lead_tracking
    FOR ALL USING (TRUE);

-- 리드 통계를 위한 뷰 생성
CREATE OR REPLACE VIEW lead_statistics AS
SELECT
    source,
    service_type,
    conversion_status,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as lead_count,
    AVG(follow_up_count) as avg_follow_ups
FROM lead_tracking
GROUP BY source, service_type, conversion_status, DATE_TRUNC('day', created_at);

-- 월별 리드 통계 뷰
CREATE OR REPLACE VIEW monthly_lead_stats AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    source,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN conversion_status = 'completed' THEN 1 END) as completed_leads,
    ROUND(
        COUNT(CASE WHEN conversion_status = 'completed' THEN 1 END) * 100.0 / COUNT(*),
        2
    ) as conversion_rate
FROM lead_tracking
GROUP BY DATE_TRUNC('month', created_at), source
ORDER BY month DESC, source;

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_lead_tracking_updated_at
    BEFORE UPDATE ON lead_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 리드 변환 상태 업데이트 함수
CREATE OR REPLACE FUNCTION update_lead_conversion_status(
    p_reservation_id UUID,
    p_new_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE lead_tracking
    SET
        conversion_status = p_new_status,
        last_contact_at = NOW(),
        updated_at = NOW()
    WHERE reservation_id = p_reservation_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 팔로업 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_followup_count(
    p_lead_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE lead_tracking
    SET
        follow_up_count = follow_up_count + 1,
        last_contact_at = NOW(),
        updated_at = NOW(),
        notes = CASE
            WHEN p_notes IS NOT NULL THEN
                COALESCE(notes, '') || CHR(10) || '[' || NOW()::DATE || '] ' || p_notes
            ELSE notes
        END
    WHERE id = p_lead_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 테이블 코멘트
COMMENT ON TABLE lead_tracking IS '리드 추적 및 전환 관리 테이블';
COMMENT ON COLUMN lead_tracking.source IS '리드 유입 경로 (leadbot, typebot, manual, phone, walk-in)';
COMMENT ON COLUMN lead_tracking.service_type IS '요청한 서비스 유형';
COMMENT ON COLUMN lead_tracking.lead_data IS '원본 리드 데이터 (JSON 형태)';
COMMENT ON COLUMN lead_tracking.conversion_status IS '전환 상태 (pending, confirmed, completed, cancelled, no-show)';
COMMENT ON COLUMN lead_tracking.follow_up_count IS '팔로업 연락 횟수';
COMMENT ON COLUMN lead_tracking.last_contact_at IS '마지막 연락 날짜';

-- 샘플 데이터 (개발용)
INSERT INTO lead_tracking (patient_id, reservation_id, source, service_type, lead_data, conversion_status)
SELECT
    p.id as patient_id,
    r.id as reservation_id,
    'leadbot' as source,
    r.type as service_type,
    jsonb_build_object(
        'name', p.full_name,
        'phone', p.phone_number,
        'serviceType', r.type,
        'source', 'leadbot'
    ) as lead_data,
    'pending' as conversion_status
FROM patients p
JOIN reservations r ON r.patient_id = p.id
WHERE r.notes LIKE '%출처: leadbot%'
ON CONFLICT DO NOTHING;

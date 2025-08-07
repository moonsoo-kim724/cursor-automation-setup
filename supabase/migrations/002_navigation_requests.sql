-- 네비게이션 요청 로그 테이블 생성
CREATE TABLE navigation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    nav_app TEXT NOT NULL CHECK (nav_app IN ('kakao', 'naver', 'google', 'apple')),
    nav_link TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'sent_simulation')),
    error_message TEXT,
    twilio_sid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_navigation_requests_created_at ON navigation_requests(created_at DESC);
CREATE INDEX idx_navigation_requests_phone_number ON navigation_requests(phone_number);
CREATE INDEX idx_navigation_requests_status ON navigation_requests(status);

-- RLS 정책 활성화
ALTER TABLE navigation_requests ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 데이터에 접근 가능 (향후 관리자 권한 구현 시)
CREATE POLICY "Allow admin users to manage navigation requests" ON navigation_requests
    FOR ALL USING (TRUE); -- 임시로 모든 접근 허용, 추후 관리자 권한 체크 로직 추가

-- 개인정보 보호를 위한 자동 삭제 함수 (30일 후 자동 삭제)
CREATE OR REPLACE FUNCTION delete_old_navigation_requests()
RETURNS void AS $$
BEGIN
    DELETE FROM navigation_requests
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 자동 삭제 작업을 위한 pg_cron 확장 (Supabase에서 지원하는 경우)
-- SELECT cron.schedule('delete-old-navigation-requests', '0 2 * * *', 'SELECT delete_old_navigation_requests();');

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_navigation_requests_updated_at
    BEFORE UPDATE ON navigation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE navigation_requests IS '네비게이션 링크 전송 요청 로그 테이블';
COMMENT ON COLUMN navigation_requests.phone_number IS '수신자 전화번호 (개인정보 주의)';
COMMENT ON COLUMN navigation_requests.nav_app IS '선택된 네비게이션 앱 (kakao, naver, google, apple)';
COMMENT ON COLUMN navigation_requests.nav_link IS '전송된 길찾기 링크';
COMMENT ON COLUMN navigation_requests.message_content IS '전송된 메시지 전체 내용';
COMMENT ON COLUMN navigation_requests.status IS '전송 상태 (sent: 성공, failed: 실패, sent_simulation: 개발모드)';
COMMENT ON COLUMN navigation_requests.error_message IS '전송 실패 시 오류 메시지';
COMMENT ON COLUMN navigation_requests.twilio_sid IS 'Twilio SMS 전송 ID (추적용)';

-- 샘플 데이터 (개발용)
INSERT INTO navigation_requests (phone_number, nav_app, nav_link, message_content, status) VALUES
('01012345678', 'kakao', 'kakaomap://route?ep=127.0396597,37.5012743&by=CAR', '연수김안과의원 길찾기 테스트 메시지', 'sent_simulation'),
('01087654321', 'naver', 'nmap://route/car?dlat=37.5012743&dlng=127.0396597&dname=연수김안과의원', '연수김안과의원 네이버맵 길찾기', 'sent_simulation');

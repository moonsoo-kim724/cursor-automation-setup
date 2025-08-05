-- YSK 랜딩페이지 초기 데이터베이스 스키마
-- 생성일: 2025-01-31
-- 작성자: Vooster AI

-- Vector 확장 활성화 (AI 지식베이스용)
CREATE EXTENSION IF NOT EXISTS vector;

-- 환자 정보 테이블
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  birth_date DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 예약 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- 'consultation', 'surgery', 'checkup', 'lasik', 'lasek', 'cataract'
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  doctor_name VARCHAR(100) DEFAULT '김연수 원장',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  symptoms TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 상담 기록 테이블
CREATE TABLE IF NOT EXISTS consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  conversation JSONB NOT NULL, -- 대화 내용 JSON
  symptoms TEXT[], -- 증상 배열
  recommendations TEXT[], -- AI 추천사항
  urgency_level INTEGER DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 5), -- 1-5 긴급도
  consultation_type VARCHAR(50) DEFAULT 'chatbot', -- 'chatbot', 'phone', 'visit'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ 테이블
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'general', 'surgery', 'checkup', 'insurance'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 지식베이스 테이블 (벡터 검색용)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  embedding vector(1536), -- OpenAI embedding 차원
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 뉴스레터 구독 테이블
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 관리자 사용자 테이블
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'doctor', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(appointment_date);
CREATE INDEX IF NOT EXISTS idx_reservations_patient ON reservations(patient_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- 벡터 유사도 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Row Level Security (RLS) 활성화
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 환자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own patient data" ON patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own patient data" ON patients
  FOR UPDATE USING (auth.uid() = id);

-- 예약은 해당 환자만 볼 수 있음
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Users can create own reservations" ON reservations
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (patient_id = auth.uid());

-- 상담 기록은 해당 환자만 볼 수 있음
CREATE POLICY "Users can view own consultations" ON consultations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Users can create own consultations" ON consultations
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- 관리자용 정책 (모든 데이터 접근 가능)
CREATE POLICY "Admins can view all patient data" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage all reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can view all consultations" ON consultations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- FAQ와 지식베이스는 공개 읽기
CREATE POLICY "Anyone can view published FAQs" ON faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view active knowledge base" ON knowledge_base
  FOR SELECT USING (is_active = true);

-- 관리자만 FAQ 관리 가능
CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 기본 데이터 삽입
INSERT INTO faqs (category, question, answer, order_index) VALUES
('general', '연수김안과의원 진료시간은 어떻게 되나요?', '평일 오전 9시부터 오후 6시까지, 토요일은 오전 9시부터 오후 1시까지 진료합니다. 일요일과 공휴일은 휴진입니다. 점심시간은 오후 12시 30분부터 1시 30분까지입니다.', 1),
('general', '예약은 어떻게 하나요?', '홈페이지의 온라인 예약 시스템을 이용하시거나, 전화(1544-7260)로 예약 가능합니다. AI 챗봇을 통해서도 간편하게 예약하실 수 있습니다.', 2),
('general', '주차는 가능한가요?', '병원 건물 지하에 무료 주차장이 있습니다. 2시간 무료 주차가 가능하며, 수술 환자분은 하루 종일 무료 주차 가능합니다.', 3),
('surgery', '라식과 라섹의 차이점이 궁금합니다.', '라식은 각막 절편을 만들어 레이저로 교정하는 방법이고, 라섹은 각막 상피를 제거한 후 교정하는 방법입니다. 각각의 장단점이 있어 정밀검사 후 적합한 수술법을 결정합니다.', 4),
('surgery', '수술 후 회복기간은 얼마나 걸리나요?', '라식의 경우 1-2일, 라섹의 경우 3-5일 정도의 회복기간이 필요합니다. 개인차가 있으며, 정기적인 검진을 통해 회복 상태를 확인합니다.', 5)
ON CONFLICT DO NOTHING;

-- 기본 관리자 계정 (실제 운영시에는 안전한 비밀번호로 변경 필요)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@ysk-eye.com', '$2b$10$placeholder_hash', '시스템 관리자', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 함수: 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
SELECT 'YSK 랜딩페이지 데이터베이스 스키마 생성 완료!' as message;

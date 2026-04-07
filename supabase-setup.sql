-- =============================================
-- 팀 지식베이스 Q&A 봇 - Supabase 테이블 설정
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
-- =============================================

-- 1. teams 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. documents 테이블 생성
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  source_type text CHECK (source_type IN ('pdf', 'word', 'text', 'url')) NOT NULL,
  source_url text,
  created_at timestamptz DEFAULT now()
);

-- 3. RLS(Row Level Security) 정책 설정
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기/쓰기 허용 (anon key 사용)
CREATE POLICY "Allow all for teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for documents" ON documents FOR ALL USING (true) WITH CHECK (true);

-- 4. 초기 데이터 - 기술지원팀 연계개발 (없을 경우에만 생성)
INSERT INTO teams (name, description, password)
SELECT '기술지원팀 연계개발', '기술지원팀 연계개발 파트 전용 Q&A 봇', '1234'
WHERE NOT EXISTS (
  SELECT 1 FROM teams WHERE name = '기술지원팀 연계개발'
);

-- =====================================================
-- QUICK TEST SCRIPT - LEGACY SPA CODES
-- =====================================================

-- Kiểm tra cấu trúc bảng trước
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'legacy_spa_points' 
ORDER BY ordinal_position;

-- Tạo bảng nếu chưa có (dựa trên function claim_legacy_spa_points)
CREATE TABLE IF NOT EXISTS public.legacy_spa_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nick_name TEXT,
  position_rank INTEGER,
  spa_points INTEGER NOT NULL,
  claim_code TEXT UNIQUE NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chỉ tạo 3 codes đơn giản để test nhanh
INSERT INTO public.legacy_spa_points (
  full_name,
  nick_name,
  position_rank,
  spa_points,
  claim_code,
  claimed,
  admin_notes
) VALUES 
(
  'Test User Champion',
  'TestChamp',
  1,
  1500,
  'TEST-CHAMP-001',
  false,
  'Quick test - Champion'
),
(
  'Test User Runner',
  'TestRunner',
  2,
  1000,
  'TEST-RUNNER-002',
  false,
  'Quick test - Runner-up'
),
(
  'Test User Third',
  'TestThird',
  3,
  500,
  'TEST-THIRD-003',
  false,
  'Quick test - Third place'
);

-- Xem kết quả
SELECT claim_code, full_name, spa_points, claimed 
FROM public.legacy_spa_points 
WHERE admin_notes LIKE '%Quick test%';

-- Test claim function
-- SELECT * FROM public.claim_legacy_spa_points('TEST-CHAMP-001');

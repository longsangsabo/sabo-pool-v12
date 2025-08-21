-- =====================================================
-- DEBUG SCRIPT - PRODUCTION vs DEV RANK REQUESTS ISSUE
-- =====================================================

-- 1. KIỂM TRA RLS POLICIES HIỆN TẠI
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'rank_requests'
ORDER BY tablename, policyname;

-- 2. KIỂM TRA CẤU TRÚC BẢNG
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'rank_requests' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. KIỂM TRA PERMISSIONS TRÊN BẢNG
SELECT 
  table_schema,
  table_name,
  privilege_type,
  grantee,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'rank_requests'
ORDER BY privilege_type;

-- 4. KIỂM TRA RLS STATUS
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = 'rank_requests';

-- 5. TEST INSERT PERMISSIONS (CHỈ CHẠY TRÊN PRODUCTION)
-- Thay user_id và club_id bằng giá trị thực từ hệ thống
/*
SELECT 
  auth.uid() as current_user_id,
  'Test user ID check' as note;

-- Test basic insert
INSERT INTO public.rank_requests (
  user_id,
  requested_rank,
  club_id,
  status
) VALUES (
  auth.uid(),  -- Current user
  'H',         -- Test rank
  '00000000-0000-0000-0000-000000000001',  -- Thay bằng club ID thực
  'pending'
);
*/

-- 6. KIỂM TRA AUTH.UID() FUNCTION
SELECT 
  auth.uid() as current_user_authenticated,
  auth.role() as current_role,
  session_user as database_user;

-- 7. KIỂM TRA CÁC RANK REQUESTS HIỆN TẠI
SELECT 
  COUNT(*) as total_requests,
  status,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM public.rank_requests 
GROUP BY status;

-- 8. KIỂM TRA FOREIGN KEY CONSTRAINTS
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'rank_requests';

-- 9. TEST SUPABASE CLIENT PERMISSIONS
-- Kiểm tra xem user hiện tại có thể SELECT từ các bảng liên quan không
SELECT 
  'profiles' as table_name,
  COUNT(*) as accessible_rows
FROM public.profiles
UNION ALL
SELECT 
  'club_profiles' as table_name,
  COUNT(*) as accessible_rows
FROM public.club_profiles
UNION ALL
SELECT 
  'rank_requests' as table_name,
  COUNT(*) as accessible_rows
FROM public.rank_requests;

-- 10. KIỂM TRA ERROR LOGS (NẾU CÓ)
-- Xem logs gần đây về rank_requests
-- (Cần access vào Supabase Dashboard -> Logs)

-- =====================================================
-- EXPECTED OUTPUT ANALYSIS:
-- =====================================================
-- 1. RLS policies should show INSERT permissions for authenticated users
-- 2. auth.uid() should return valid UUID (not null)
-- 3. Foreign key constraints should exist and be valid
-- 4. Table permissions should include INSERT for appropriate roles
-- 5. If any step fails, that's likely the production issue

-- =====================================================
-- CÁCH SỬA PRODUCTION (NEU PHÁT HIỆN VẤN ĐỀ):
-- =====================================================

-- A. Nếu RLS chặn INSERT:
/*
ALTER TABLE public.rank_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own rank requests" ON public.rank_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rank requests" ON public.rank_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Club owners can view rank requests for their clubs" ON public.rank_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.club_profiles 
    WHERE id = rank_requests.club_id 
    AND owner_id = auth.uid()
  )
);
*/

-- B. Nếu thiếu permissions:
/*
GRANT INSERT, SELECT ON public.rank_requests TO authenticated;
GRANT USAGE ON SEQUENCE rank_requests_id_seq TO authenticated;
*/

-- C. Nếu foreign key issues:
/*
-- Kiểm tra và tạo lại foreign keys nếu cần
ALTER TABLE public.rank_requests 
ADD CONSTRAINT fk_rank_requests_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE public.rank_requests 
ADD CONSTRAINT fk_rank_requests_club_id 
FOREIGN KEY (club_id) REFERENCES public.club_profiles(id);
*/

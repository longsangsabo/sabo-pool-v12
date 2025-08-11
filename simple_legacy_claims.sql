-- Ultra Simple Legacy Claim System
-- User gửi yêu cầu → Admin approve/reject → Add điểm

-- 1. Tạo bảng đơn giản (NO RLS, NO COMPLEX RULES)
CREATE TABLE IF NOT EXISTS public.simple_legacy_claims (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  legacy_name TEXT NOT NULL,
  spa_points INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- 2. NO RLS - Anyone can read/write (for simplicity)
-- This is intentionally simple for admin use

-- 3. Simple insert function (optional, can use direct INSERT)
CREATE OR REPLACE FUNCTION submit_simple_claim(
  p_user_email TEXT,
  p_user_name TEXT,
  p_user_phone TEXT,
  p_legacy_name TEXT,
  p_spa_points INTEGER
) RETURNS TEXT AS $$
BEGIN
  INSERT INTO public.simple_legacy_claims (
    user_email, user_name, user_phone, legacy_name, spa_points
  ) VALUES (
    p_user_email, p_user_name, p_user_phone, p_legacy_name, p_spa_points
  );
  
  RETURN 'Claim submitted successfully';
END;
$$ LANGUAGE plpgsql;

-- 4. Simple approve function
CREATE OR REPLACE FUNCTION approve_simple_claim(
  p_claim_id INTEGER,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  UPDATE public.simple_legacy_claims
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    processed_at = NOW()
  WHERE id = p_claim_id;
  
  RETURN 'Claim approved';
END;
$$ LANGUAGE plpgsql;

-- 5. Simple reject function
CREATE OR REPLACE FUNCTION reject_simple_claim(
  p_claim_id INTEGER,
  p_admin_notes TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  UPDATE public.simple_legacy_claims
  SET 
    status = 'rejected',
    admin_notes = p_admin_notes,
    processed_at = NOW()
  WHERE id = p_claim_id;
  
  RETURN 'Claim rejected';
END;
$$ LANGUAGE plpgsql;

-- 6. Test data
INSERT INTO public.simple_legacy_claims (
  user_email, user_name, user_phone, legacy_name, spa_points
) VALUES (
  'longsangsabo@gmail.com', 'ANH LONG', '0961167717', 'ANH LONG MAGIC', 100
);

SELECT 'Simple Legacy Claim System created!' as result;

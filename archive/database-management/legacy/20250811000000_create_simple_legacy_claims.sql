-- Migration: Create simple_legacy_claims table
-- Created: 2025-08-11

CREATE TABLE IF NOT EXISTS simple_legacy_claims (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT,
  legacy_name TEXT NOT NULL,
  spa_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Grant permissions to anon and authenticated roles
GRANT ALL ON simple_legacy_claims TO anon;
GRANT ALL ON simple_legacy_claims TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE simple_legacy_claims_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE simple_legacy_claims_id_seq TO authenticated;

-- Insert test data
INSERT INTO simple_legacy_claims (user_email, user_name, user_phone, legacy_name, spa_points) VALUES
('test1@example.com', 'Nguyễn Văn A', '0123456789', 'LEGACY ACCOUNT A', 100),
('test2@example.com', 'Trần Thị B', '0987654321', 'LEGACY ACCOUNT B', 50),
('test3@example.com', 'Lê Văn C', '0111222333', 'LEGACY ACCOUNT C', 75)
ON CONFLICT DO NOTHING;

-- Create tournament_registrations table
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL,
  user_id UUID NOT NULL,
  registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'cancelled', 'waitlist')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_user ON tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(registration_status);

-- Enable RLS
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "public_view_registrations" ON tournament_registrations
FOR SELECT USING (true);

CREATE POLICY "users_manage_own_registrations" ON tournament_registrations
FOR ALL USING (auth.uid()::text = user_id);

-- Insert test registrations
INSERT INTO tournament_registrations (tournament_id, user_id, registration_status, payment_status)
SELECT 
  'f2aa6977-4797-4770-af4b-92ee3856781f'::uuid,
  user_id,
  'confirmed',
  'paid'
FROM profiles 
WHERE user_id IN (
  'e411093e-144a-46c3-9def-37186c4ee6c8',
  '519cf7c9-e112-40b2-9e4d-0cd44783ec9e'
)
ON CONFLICT (tournament_id, user_id) DO NOTHING;

SELECT 'Tournament registrations table created successfully!' as status;

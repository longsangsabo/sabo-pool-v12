-- Step 4: Add sample data
INSERT INTO tournaments (
  name,
  description,
  tournament_type,
  status,
  start_date,
  end_date,
  max_participants,
  is_sabo_tournament,
  race_to
) VALUES 
(
  'SABO Winter Championship 2025',
  'Giải đấu Pool SABO mùa đông 2025 - Double Elimination Format',
  'sabo_double_elimination',
  'upcoming',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '14 days',
  32,
  true,
  7
),
(
  'Weekend Pool Tournament',
  'Giải đấu cuối tuần dành cho tất cả skill level',
  'double_elimination',
  'registration',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '5 days',
  16,
  false,
  5
) ON CONFLICT DO NOTHING;

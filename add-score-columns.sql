-- 🔧 ADD MISSING SCORE COLUMNS TO tournament_matches
-- This adds the score_player1 and score_player2 columns that the frontend expects

-- Add missing score columns
ALTER TABLE tournament_matches 
ADD COLUMN IF NOT EXISTS score_player1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_player2 INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tournament_matches_scores 
ON tournament_matches(score_player1, score_player2);

-- Verify the columns were added
SELECT 'Score columns added successfully' as status;

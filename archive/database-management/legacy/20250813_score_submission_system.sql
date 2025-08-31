-- Score Submission System Migration
-- Enables players to submit scores for ongoing challenges

-- Add score submission columns to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS score_challenger INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS score_opponent INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS score_submitted_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS score_submitted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS score_confirmed_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS score_confirmed_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS club_approved_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS club_approved_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS final_score_challenger INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS final_score_opponent INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS spa_paid_out BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS match_notes TEXT DEFAULT NULL;

-- Update challenge status enum to include score submission states
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_status_v2') THEN
        CREATE TYPE challenge_status_v2 AS ENUM (
            'pending',
            'accepted', 
            'in_progress',
            'score_submitted',
            'score_confirmed',
            'pending_club_approval',
            'completed',
            'cancelled',
            'disputed'
        );
        
        -- Add new status column
        ALTER TABLE challenges ADD COLUMN status_v2 challenge_status_v2 DEFAULT 'pending';
        
        -- Migrate existing status values
        UPDATE challenges SET status_v2 = 
            CASE 
                WHEN status = 'pending' THEN 'pending'::challenge_status_v2
                WHEN status = 'accepted' THEN 'accepted'::challenge_status_v2
                WHEN status = 'active' THEN 'in_progress'::challenge_status_v2
                WHEN status = 'completed' THEN 'completed'::challenge_status_v2
                WHEN status = 'cancelled' THEN 'cancelled'::challenge_status_v2
                ELSE 'pending'::challenge_status_v2
            END;
    END IF;
END $$;

-- Create score_submissions table for audit trail
CREATE TABLE IF NOT EXISTS score_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES auth.users(id),
    score_challenger INTEGER NOT NULL CHECK (score_challenger >= 0),
    score_opponent INTEGER NOT NULL CHECK (score_opponent >= 0),
    submission_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent multiple submissions per user per challenge
    UNIQUE(challenge_id, submitted_by)
);

-- Enable RLS on score_submissions
ALTER TABLE score_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for score_submissions
CREATE POLICY "Users can view score submissions for their challenges" ON score_submissions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM challenges c 
        WHERE c.id = score_submissions.challenge_id 
        AND (c.challenger_id = auth.uid() OR c.opponent_id = auth.uid())
    )
);

CREATE POLICY "Users can submit scores for their challenges" ON score_submissions
FOR INSERT WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM challenges c 
        WHERE c.id = score_submissions.challenge_id 
        AND (c.challenger_id = auth.uid() OR c.opponent_id = auth.uid())
        AND c.status_v2 = 'in_progress'
    )
);

-- Club admins can view all score submissions for their club challenges
CREATE POLICY "Club admins can view club score submissions" ON score_submissions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM challenges c
        JOIN club_members cm ON cm.club_id = c.club_id
        WHERE c.id = score_submissions.challenge_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'owner')
    )
);

-- Function to submit a match score
CREATE OR REPLACE FUNCTION submit_match_score(
    p_challenge_id UUID,
    p_score_challenger INTEGER,
    p_score_opponent INTEGER,
    p_note TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge challenges%ROWTYPE;
    v_user_id UUID := auth.uid();
    v_is_challenger BOOLEAN;
    v_result JSON;
BEGIN
    -- Check authentication
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;

    -- Get challenge details
    SELECT * INTO v_challenge
    FROM challenges
    WHERE id = p_challenge_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Challenge not found'
        );
    END IF;

    -- Check if user is part of this challenge
    IF v_challenge.challenger_id != v_user_id AND v_challenge.opponent_id != v_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'You are not part of this challenge'
        );
    END IF;

    -- Check if challenge is in progress
    IF v_challenge.status_v2 != 'in_progress' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Challenge is not in progress'
        );
    END IF;

    -- Determine if user is challenger
    v_is_challenger := (v_challenge.challenger_id = v_user_id);

    -- Validate scores
    IF p_score_challenger < 0 OR p_score_opponent < 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Scores must be non-negative'
        );
    END IF;

    -- Insert or update score submission
    INSERT INTO score_submissions (
        challenge_id,
        submitted_by,
        score_challenger,
        score_opponent,
        submission_note
    ) VALUES (
        p_challenge_id,
        v_user_id,
        p_score_challenger,
        p_score_opponent,
        p_note
    )
    ON CONFLICT (challenge_id, submitted_by) 
    DO UPDATE SET
        score_challenger = EXCLUDED.score_challenger,
        score_opponent = EXCLUDED.score_opponent,
        submission_note = EXCLUDED.submission_note,
        updated_at = NOW();

    -- Update challenge with score submission
    UPDATE challenges SET
        score_challenger = p_score_challenger,
        score_opponent = p_score_opponent,
        score_submitted_by = v_user_id,
        score_submitted_at = NOW(),
        status_v2 = 'score_submitted',
        match_notes = COALESCE(match_notes, '') || 
            CASE WHEN match_notes IS NOT NULL AND match_notes != '' 
                 THEN E'\n' ELSE '' END ||
            'Score submitted by ' || 
            CASE WHEN v_is_challenger THEN 'challenger' ELSE 'opponent' END ||
            ': ' || p_score_challenger || '-' || p_score_opponent ||
            CASE WHEN p_note IS NOT NULL THEN ' (' || p_note || ')' ELSE '' END
    WHERE id = p_challenge_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Score submitted successfully',
        'status', 'score_submitted'
    );
END;
$$;

-- Function to confirm a submitted score
CREATE OR REPLACE FUNCTION confirm_match_score(
    p_challenge_id UUID,
    p_confirm BOOLEAN DEFAULT TRUE
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge challenges%ROWTYPE;
    v_user_id UUID := auth.uid();
    v_is_challenger BOOLEAN;
    v_other_user_id UUID;
    v_result JSON;
BEGIN
    -- Check authentication
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;

    -- Get challenge details
    SELECT * INTO v_challenge
    FROM challenges
    WHERE id = p_challenge_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Challenge not found'
        );
    END IF;

    -- Check if user is part of this challenge
    IF v_challenge.challenger_id != v_user_id AND v_challenge.opponent_id != v_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'You are not part of this challenge'
        );
    END IF;

    -- Check if challenge has a submitted score
    IF v_challenge.status_v2 != 'score_submitted' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No score to confirm'
        );
    END IF;

    -- Check if user is not the one who submitted the score
    IF v_challenge.score_submitted_by = v_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'You cannot confirm your own score submission'
        );
    END IF;

    -- Determine user roles
    v_is_challenger := (v_challenge.challenger_id = v_user_id);
    v_other_user_id := CASE WHEN v_is_challenger 
                           THEN v_challenge.opponent_id 
                           ELSE v_challenge.challenger_id END;

    IF p_confirm THEN
        -- Confirm the score
        UPDATE challenges SET
            score_confirmed_by = v_user_id,
            score_confirmed_at = NOW(),
            status_v2 = 'score_confirmed',
            match_notes = COALESCE(match_notes, '') || 
                CASE WHEN match_notes IS NOT NULL AND match_notes != '' 
                     THEN E'\n' ELSE '' END ||
                'Score confirmed by ' || 
                CASE WHEN v_is_challenger THEN 'challenger' ELSE 'opponent' END
        WHERE id = p_challenge_id;

        RETURN json_build_object(
            'success', true,
            'message', 'Score confirmed successfully',
            'status', 'score_confirmed'
        );
    ELSE
        -- Reject the score - reset to in_progress
        UPDATE challenges SET
            score_challenger = NULL,
            score_opponent = NULL,
            score_submitted_by = NULL,
            score_submitted_at = NULL,
            status_v2 = 'in_progress',
            match_notes = COALESCE(match_notes, '') || 
                CASE WHEN match_notes IS NOT NULL AND match_notes != '' 
                     THEN E'\n' ELSE '' END ||
                'Score rejected by ' || 
                CASE WHEN v_is_challenger THEN 'challenger' ELSE 'opponent' END
        WHERE id = p_challenge_id;

        -- Remove the score submission record
        DELETE FROM score_submissions 
        WHERE challenge_id = p_challenge_id 
        AND submitted_by = v_challenge.score_submitted_by;

        RETURN json_build_object(
            'success', true,
            'message', 'Score rejected, match continues',
            'status', 'in_progress'
        );
    END IF;
END;
$$;

-- Function for club to approve final result and process SPA payout
CREATE OR REPLACE FUNCTION club_approve_match_result(
    p_challenge_id UUID,
    p_approve BOOLEAN DEFAULT TRUE,
    p_admin_note TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_challenge challenges%ROWTYPE;
    v_user_id UUID := auth.uid();
    v_is_club_admin BOOLEAN := FALSE;
    v_winner_id UUID;
    v_loser_id UUID;
    v_spa_amount INTEGER;
    v_handicap_info JSON;
    v_result JSON;
BEGIN
    -- Check authentication
    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;

    -- Get challenge details
    SELECT * INTO v_challenge
    FROM challenges
    WHERE id = p_challenge_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Challenge not found'
        );
    END IF;

    -- Check if user is club admin
    SELECT EXISTS (
        SELECT 1 FROM club_members 
        WHERE club_id = v_challenge.club_id 
        AND user_id = v_user_id 
        AND role IN ('admin', 'owner')
    ) INTO v_is_club_admin;

    IF NOT v_is_club_admin THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Only club administrators can approve match results'
        );
    END IF;

    -- Check if score is confirmed
    IF v_challenge.status_v2 != 'score_confirmed' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Score must be confirmed by both players first'
        );
    END IF;

    IF p_approve THEN
        -- Determine winner and process SPA payout
        IF v_challenge.score_challenger > v_challenge.score_opponent THEN
            v_winner_id := v_challenge.challenger_id;
            v_loser_id := v_challenge.opponent_id;
        ELSIF v_challenge.score_opponent > v_challenge.score_challenger THEN
            v_winner_id := v_challenge.opponent_id;
            v_loser_id := v_challenge.challenger_id;
        ELSE
            -- Draw - no SPA transfer
            v_winner_id := NULL;
            v_loser_id := NULL;
        END IF;

        -- Get SPA amount to transfer
        v_spa_amount := v_challenge.bet_amount;

        -- Process SPA transfer if there's a winner
        IF v_winner_id IS NOT NULL AND v_loser_id IS NOT NULL THEN
            -- Deduct SPA from loser
            UPDATE profiles 
            SET spa_points = spa_points - v_spa_amount
            WHERE id = v_loser_id;

            -- Add SPA to winner  
            UPDATE profiles 
            SET spa_points = spa_points + v_spa_amount
            WHERE id = v_winner_id;
        END IF;

        -- Update challenge as completed
        UPDATE challenges SET
            club_approved_by = v_user_id,
            club_approved_at = NOW(),
            status_v2 = 'completed',
            final_score_challenger = v_challenge.score_challenger,
            final_score_opponent = v_challenge.score_opponent,
            spa_paid_out = TRUE,
            match_notes = COALESCE(match_notes, '') || 
                CASE WHEN match_notes IS NOT NULL AND match_notes != '' 
                     THEN E'\n' ELSE '' END ||
                'Match approved by club admin. ' ||
                CASE 
                    WHEN v_winner_id IS NOT NULL THEN 
                        'SPA payout: ' || v_spa_amount || ' points transferred.'
                    ELSE 
                        'Draw - no SPA transfer.'
                END ||
                CASE WHEN p_admin_note IS NOT NULL THEN 
                    ' Admin note: ' || p_admin_note ELSE '' END
        WHERE id = p_challenge_id;

        RETURN json_build_object(
            'success', true,
            'message', 'Match result approved and SPA processed',
            'status', 'completed',
            'winner_id', v_winner_id,
            'spa_transferred', v_spa_amount
        );
    ELSE
        -- Disapprove - send back for re-submission
        UPDATE challenges SET
            status_v2 = 'disputed',
            match_notes = COALESCE(match_notes, '') || 
                CASE WHEN match_notes IS NOT NULL AND match_notes != '' 
                     THEN E'\n' ELSE '' END ||
                'Match result disputed by club admin.' ||
                CASE WHEN p_admin_note IS NOT NULL THEN 
                    ' Reason: ' || p_admin_note ELSE '' END
        WHERE id = p_challenge_id;

        RETURN json_build_object(
            'success', true,
            'message', 'Match result disputed - requires resolution',
            'status', 'disputed'
        );
    END IF;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_status_v2 ON challenges(status_v2);
CREATE INDEX IF NOT EXISTS idx_challenges_score_submitted ON challenges(score_submitted_at) WHERE score_submitted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_score_submissions_challenge ON score_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_score_submissions_user ON score_submissions(submitted_by);

-- Add helpful comments
COMMENT ON COLUMN challenges.status_v2 IS 'Enhanced status for score submission workflow';
COMMENT ON COLUMN challenges.score_submitted_by IS 'User who first submitted the score';
COMMENT ON COLUMN challenges.score_confirmed_by IS 'User who confirmed the submitted score';
COMMENT ON COLUMN challenges.club_approved_by IS 'Club admin who approved the final result';
COMMENT ON TABLE score_submissions IS 'Audit trail for all score submissions';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON score_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION submit_match_score TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_match_score TO authenticated;
GRANT EXECUTE ON FUNCTION club_approve_match_result TO authenticated;

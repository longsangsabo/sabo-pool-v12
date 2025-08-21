const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : '';
};

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL');
const serviceKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceKey);

// Manual function creation using service client
async function createFixedFunction() {
  try {
    console.log('🔧 Creating fixed submit_sabo_match_score function...');
    
    // Drop existing function
    console.log('1. Dropping existing function...');
    const dropSQL = `DROP FUNCTION IF EXISTS submit_sabo_match_score(UUID, INTEGER, INTEGER, UUID);`;
    
    // Create new function with correct column names
    console.log('2. Creating new function...');
    const createSQL = `
CREATE OR REPLACE FUNCTION submit_sabo_match_score(
  p_match_id UUID,
  p_player1_score INTEGER,
  p_player2_score INTEGER,
  p_submitted_by UUID DEFAULT NULL
) RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_winner_id UUID;
  v_tournament_id UUID;
BEGIN
  -- Get match details
  SELECT * INTO v_match FROM tournament_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;
  
  -- Validate scores
  IF p_player1_score < 0 OR p_player2_score < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid scores');
  END IF;
  
  IF p_player1_score = p_player2_score THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ties not allowed');
  END IF;
  
  -- Determine winner
  v_winner_id := CASE 
    WHEN p_player1_score > p_player2_score THEN v_match.player1_id
    ELSE v_match.player2_id
  END;
  
  -- Update match with CORRECT column names
  UPDATE tournament_matches 
  SET 
    score_player1 = p_player1_score,
    score_player2 = p_player2_score,
    winner_id = v_winner_id,
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Score submitted successfully',
    'winner_id', v_winner_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;`;

    // Grant permissions
    const grantSQL = `
GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO authenticated;
GRANT EXECUTE ON FUNCTION submit_sabo_match_score TO service_role;
`;

    // Execute using RPC to execute raw SQL
    try {
      // Note: This might not work if no SQL execution RPC exists
      console.log('Attempting to execute SQL via Supabase...');
      
      // Test the current function first
      const { data: currentResult, error: currentError } = await supabase.rpc('submit_sabo_match_score', {
        p_match_id: '00000000-0000-0000-0000-000000000000',
        p_player1_score: 1,
        p_player2_score: 0,
        p_submitted_by: '00000000-0000-0000-0000-000000000000'
      });
      
      console.log('📋 Current function test result:');
      if (currentError) {
        console.log('❌ Error:', currentError.message);
        
        if (currentError.message.includes('does not exist')) {
          console.log('🚨 Function has column issues - manual SQL execution needed');
          console.log('\n📋 MANUAL FIX NEEDED:');
          console.log('1. Access Supabase Dashboard > SQL Editor');
          console.log('2. Execute the following SQL:');
          console.log('\\n' + dropSQL + '\\n' + createSQL + '\\n' + grantSQL);
        } else if (currentError.message.includes('Match not found')) {
          console.log('✅ Function already fixed and working!');
        }
      } else {
        console.log('✅ Success:', currentResult);
      }
      
    } catch (error) {
      console.error('❌ Execution error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Function creation error:', error.message);
  }
}

createFixedFunction();

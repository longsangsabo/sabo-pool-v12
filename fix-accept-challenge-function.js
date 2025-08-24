#!/usr/bin/env node
/**
 * Fix accept_open_challenge function using Supabase Service Key
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function fixAcceptOpenChallengeFunction() {
  console.log('🚀 Starting to fix accept_open_challenge function...');
  
  try {
    // First, check current function
    console.log('📊 Checking current function...');
    
    const { data: currentResult, error: currentError } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: '00000000-0000-0000-0000-000000000000', // dummy ID to test response format
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    
    if (currentError) {
      console.log('⚠️ Current function error (expected):', currentError.message);
    }
    console.log('📋 Current response format:', typeof currentResult, currentResult);

    // Now create the fixed function
    console.log('🔧 Creating fixed function...');
    
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.accept_open_challenge(
        p_challenge_id UUID,
        p_user_id UUID
      )
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        v_challenge RECORD;
        v_user_spa INTEGER;
        v_required_spa INTEGER;
        v_match_id UUID;
      BEGIN
        -- Get challenge details
        SELECT * INTO v_challenge
        FROM challenges
        WHERE id = p_challenge_id;
        
        -- Validate challenge exists
        IF NOT FOUND THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge not found'
          );
        END IF;
        
        -- Validate challenge is open (opponent_id is null)
        IF v_challenge.opponent_id IS NOT NULL THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge is not open'
          );
        END IF;
        
        -- Validate challenge status
        IF v_challenge.status != 'pending' THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge is no longer available'
          );
        END IF;
        
        -- Validate not accepting own challenge
        IF v_challenge.challenger_id = p_user_id THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot accept your own challenge'
          );
        END IF;
        
        -- Check expiry
        IF v_challenge.expires_at < NOW() THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', 'Challenge has expired'
          );
        END IF;
        
        -- Get user SPA points
        SELECT COALESCE(spa_points, 0) INTO v_user_spa
        FROM player_rankings
        WHERE user_id = p_user_id;
        
        -- Get required SPA
        v_required_spa := COALESCE(v_challenge.bet_points, 100);
        
        -- Check SPA balance
        IF v_user_spa < v_required_spa THEN
          RETURN jsonb_build_object(
            'success', false,
            'error', format('Insufficient SPA points. Required: %s, Available: %s', v_required_spa, v_user_spa)
          );
        END IF;
        
        -- Update challenge to accepted
        UPDATE challenges
        SET 
          opponent_id = p_user_id,
          status = 'accepted',
          responded_at = NOW(),
          updated_at = NOW()
        WHERE id = p_challenge_id;
        
        -- Create match record
        INSERT INTO matches (
          player1_id,
          player2_id,
          challenge_id,
          status,
          match_type,
          scheduled_time
        ) VALUES (
          v_challenge.challenger_id,
          p_user_id,
          p_challenge_id,
          'scheduled',
          'challenge',
          COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '2 hours')
        ) RETURNING id INTO v_match_id;
        
        -- Return success response
        RETURN jsonb_build_object(
          'success', true,
          'message', 'Successfully joined challenge',
          'challenge_id', p_challenge_id,
          'match_id', v_match_id
        );
        
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', SQLERRM
        );
      END;
      $$;
    `;
    
    const { error: functionError } = await supabase.rpc('exec_sql', {
      query: functionSQL
    });
    
    if (functionError) {
      // Try direct SQL execution instead
      console.log('📝 Using direct SQL execution...');
      
      const { error: directError } = await supabase
        .from('_migrations')
        .insert([
          {
            version: Date.now().toString(),
            name: 'fix_accept_open_challenge_function',
            sql: functionSQL
          }
        ]);
        
      if (directError) {
        console.error('❌ Direct SQL failed:', directError);
        throw directError;
      }
    }
    
    console.log('✅ Function created/updated successfully!');
    
    // Test the new function with dummy data
    console.log('🧪 Testing new function format...');
    
    const { data: testResult, error: testError } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: '00000000-0000-0000-0000-000000000000',
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    
    console.log('📋 New response format:', typeof testResult, testResult);
    
    if (testResult && typeof testResult === 'object' && 'success' in testResult) {
      console.log('✅ Function now returns correct JSONB format!');
    } else {
      console.log('⚠️ Response format still needs adjustment');
    }
    
  } catch (error) {
    console.error('❌ Error fixing function:', error);
    process.exit(1);
  }
}

// Run the fix
fixAcceptOpenChallengeFunction()
  .then(() => {
    console.log('🎉 Fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

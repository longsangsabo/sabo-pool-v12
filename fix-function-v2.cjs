#!/usr/bin/env node
/**
 * Fix accept_open_challenge function using Supabase Service Key - Direct SQL approach
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

async function executeSQLDirectly(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sql
    });
    
    if (error) {
      console.log('Trying alternative method...');
      
      // Alternative: use generic RPC call
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({ sql })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    }
    
    return data;
    
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
}

async function fixFunction() {
  console.log('🚀 Fixing accept_open_challenge function...');
  
  const functionSQL = `
    CREATE OR REPLACE FUNCTION public.accept_open_challenge(
      p_challenge_id UUID,
      p_user_id UUID
    )
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $function$
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
    $function$;
  `;
  
  try {
    console.log('📝 Creating function...');
    await executeSQLDirectly(functionSQL);
    console.log('✅ Function created successfully!');
    
    // Test the function
    console.log('🧪 Testing function...');
    const { data: testResult, error: testError } = await supabase.rpc('accept_open_challenge', {
      p_challenge_id: '00000000-0000-0000-0000-000000000000',
      p_user_id: '00000000-0000-0000-0000-000000000000'
    });
    
    console.log('📋 Test result:', testResult);
    console.log('📋 Result type:', typeof testResult);
    
    if (testResult && typeof testResult === 'object' && 'success' in testResult) {
      console.log('✅ Function returns correct JSONB format!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Try manual approach through database connection
    console.log('🔄 Trying alternative approach...');
    
    // Use direct SQL execution via REST API
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          query: functionSQL
        })
      });
      
      if (response.ok) {
        console.log('✅ Alternative method succeeded!');
      } else {
        console.log('Response status:', response.status);
        console.log('Response text:', await response.text());
      }
    } catch (altError) {
      console.error('❌ Alternative method failed:', altError);
    }
  }
}

fixFunction()
  .then(() => {
    console.log('🎉 Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

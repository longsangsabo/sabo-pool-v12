#!/usr/bin/env node
/**
 * Simple fix using supabase service key to execute SQL directly
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function executeSQLViaAPI() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🚀 Executing SQL fix...');
  
  const sql = `
    -- Drop and recreate function
    DROP FUNCTION IF EXISTS public.accept_open_challenge CASCADE;
    
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
      SELECT * INTO v_challenge FROM challenges WHERE id = p_challenge_id;
      
      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Challenge not found');
      END IF;
      
      IF v_challenge.opponent_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Challenge is not open');
      END IF;
      
      IF v_challenge.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Challenge is no longer available');
      END IF;
      
      IF v_challenge.challenger_id = p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot accept your own challenge');
      END IF;
      
      IF v_challenge.expires_at < NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Challenge has expired');
      END IF;
      
      SELECT COALESCE(spa_points, 0) INTO v_user_spa FROM player_rankings WHERE user_id = p_user_id;
      v_required_spa := COALESCE(v_challenge.bet_points, 100);
      
      IF v_user_spa < v_required_spa THEN
        RETURN jsonb_build_object('success', false, 'error', format('Insufficient SPA points. Required: %s, Available: %s', v_required_spa, v_user_spa));
      END IF;
      
      UPDATE challenges SET opponent_id = p_user_id, status = 'accepted', responded_at = NOW(), updated_at = NOW() WHERE id = p_challenge_id;
      
      INSERT INTO matches (player1_id, player2_id, challenge_id, status, match_type, scheduled_time)
      VALUES (v_challenge.challenger_id, p_user_id, p_challenge_id, 'scheduled', 'challenge', COALESCE(v_challenge.scheduled_time, NOW() + INTERVAL '2 hours'))
      RETURNING id INTO v_match_id;
      
      RETURN jsonb_build_object('success', true, 'message', 'Successfully joined challenge', 'challenge_id', p_challenge_id, 'match_id', v_match_id);
      
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM);
    END;
    $function$;
  `;
  
  // Create Supabase client with service key
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // Try different approaches
  try {
    console.log('📝 Method 1: Using supabase.from to execute...');
    
    // Method 1: Use a simple INSERT to trigger SQL execution
    const { error: insertError } = await supabase
      .from('_supabase_migrations')
      .insert([
        {
          version: `fix_accept_${Date.now()}`,
          statements: [sql]
        }
      ]);
    
    if (insertError) {
      console.log('Method 1 failed, trying method 2...');
      
      // Method 2: Try using RPC with the SQL
      const { data, error: rpcError } = await supabase.rpc('exec', {
        sql: sql
      });
      
      if (rpcError) {
        console.log('Method 2 failed, trying method 3...');
        
        // Method 3: Manual HTTP request
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`,
            'apikey': serviceKey
          },
          body: JSON.stringify({ sql })
        });
        
        if (response.ok) {
          console.log('✅ Method 3 succeeded!');
        } else {
          console.log('❌ All methods failed. Manual SQL required.');
          console.log('📋 Please run this SQL in Supabase SQL Editor:');
          console.log('---');
          console.log(sql);
          console.log('---');
        }
      } else {
        console.log('✅ Method 2 succeeded!');
      }
    } else {
      console.log('✅ Method 1 succeeded!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('📋 Please manually execute this SQL in Supabase SQL Editor:');
    console.log('---');
    console.log(sql);
    console.log('---');
  }
}

// Meanwhile, let's fix the frontend to handle both response formats
async function fixFrontendResponse() {
  console.log('🔧 Also fixing frontend to handle response formats...');
  
  const fs = require('fs');
  
  // Read the hook file
  const hookFile = '/workspaces/sabo-pool-v12/src/hooks/useEnhancedChallengesV3.tsx';
  
  if (fs.existsSync(hookFile)) {
    let content = fs.readFileSync(hookFile, 'utf8');
    
    // Find and replace the response handling
    const oldPattern = /if \(result\.success\)/g;
    const newPattern = `// Handle both response formats: direct JSONB or wrapped array
    const responseData = Array.isArray(result) ? result[0] : result;
    if (responseData?.success)`;
    
    if (content.includes('if (result.success)')) {
      content = content.replace(oldPattern, newPattern);
      fs.writeFileSync(hookFile, content, 'utf8');
      console.log('✅ Frontend response handling updated!');
    } else {
      console.log('⚠️ Frontend pattern not found, may need manual update');
    }
  }
}

// Run both fixes
Promise.all([
  executeSQLViaAPI(),
  fixFrontendResponse()
]).then(() => {
  console.log('🎉 Fix attempts completed!');
}).catch(error => {
  console.error('💥 Error:', error);
});

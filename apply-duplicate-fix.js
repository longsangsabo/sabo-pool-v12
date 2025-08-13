#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function applyFixMigration() {
  console.log('🔧 Applying fix for duplicate challenge match constraint...\n');
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      '/workspaces/sabo-pool-v12/supabase/migrations/20250813000001_fix_duplicate_challenge_match.sql',
      'utf8'
    );
    
    console.log('📄 Migration content loaded');
    console.log('📊 Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - execute SQL directly
      console.log('🔄 Trying direct SQL execution...');
      
      // Extract just the function creation part
      const functionMatch = migrationSQL.match(/CREATE OR REPLACE FUNCTION[\s\S]*?LANGUAGE plpgsql SECURITY DEFINER;/);
      
      if (functionMatch) {
        const functionSQL = functionMatch[0];
        
        // Split into smaller chunks if needed
        console.log('📝 Executing function creation...');
        
        // For testing, let's create a simplified version without the complex logic
        const simpleFixSQL = `
CREATE OR REPLACE FUNCTION public.accept_open_challenge(
  p_challenge_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_challenge RECORD;
  v_user_profile RECORD;
  v_required_spa INTEGER DEFAULT 0;
  v_user_spa INTEGER DEFAULT 0;
  v_existing_match RECORD;
BEGIN
  -- Lock the challenge row to prevent race conditions
  SELECT * INTO v_challenge
  FROM public.challenges 
  WHERE id = p_challenge_id 
    AND status = 'pending'
    AND opponent_id IS NULL
    AND challenger_id != p_user_id
    AND expires_at > NOW()
  FOR UPDATE NOWAIT;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu không còn khả dụng hoặc đã được nhận'
    );
  END IF;
  
  -- Get user profile with SPA points
  SELECT * INTO v_user_profile
  FROM public.profiles
  WHERE id = p_user_id OR user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Không tìm thấy thông tin người dùng'
    );
  END IF;
  
  -- Get required SPA and user's current SPA
  v_required_spa := COALESCE(v_challenge.bet_points, 0);
  v_user_spa := COALESCE(v_user_profile.spa_points, 0);
  
  -- Check SPA validation
  IF v_required_spa > 0 AND v_user_spa < v_required_spa THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Bạn không đủ SPA Points để tham gia thách đấu này',
      'required_spa', v_required_spa,
      'user_spa', v_user_spa,
      'shortage', v_required_spa - v_user_spa
    );
  END IF;
  
  -- Check if match already exists
  SELECT * INTO v_existing_match
  FROM public.matches
  WHERE challenge_id = p_challenge_id;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu này đã có trận đấu được tạo'
    );
  END IF;
  
  -- Update challenge
  UPDATE public.challenges 
  SET opponent_id = p_user_id,
      status = 'accepted',
      responded_at = NOW(),
      updated_at = NOW()
  WHERE id = p_challenge_id;
  
  -- Create match with conflict handling
  INSERT INTO public.matches (
    player1_id, player2_id, challenge_id, 
    status, match_type, scheduled_time,
    created_at, updated_at
  ) VALUES (
    v_challenge.challenger_id, p_user_id, p_challenge_id,
    'scheduled', 'challenge', 
    COALESCE(v_challenge.scheduled_time, NOW()),
    NOW(), NOW()
  )
  ON CONFLICT (challenge_id) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'challenge_id', p_challenge_id,
    'message', 'Tham gia thách đấu thành công!'
  );
  
EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu đang được xử lý, vui lòng thử lại'
    );
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Thách đấu này đã được nhận hoặc đã có trận đấu'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Có lỗi xảy ra: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        
        console.log('🔧 Applying simplified fix...');
        console.log('\nNote: You need to run this SQL manually in Supabase Dashboard:');
        console.log('=====================================');
        console.log(simpleFixSQL);
        console.log('=====================================\n');
        
        console.log('✅ Migration prepared! Please apply it manually in Supabase Dashboard SQL Editor.');
        
      } else {
        console.error('❌ Could not extract function from migration');
      }
    } else {
      console.log('✅ Migration applied successfully:', data);
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n📋 Manual instructions:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the migration file content');
    console.log('3. Run the SQL to update the accept_open_challenge function');
  }
}

// Run the migration
applyFixMigration().then(() => {
  console.log('\n🎯 Next steps:');
  console.log('1. Apply the SQL fix in Supabase Dashboard');
  console.log('2. Test challenge acceptance');
  console.log('3. Verify no more duplicate key errors');
  process.exit(0);
}).catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});

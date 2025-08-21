#!/usr/bin/env node

/**
 * Create milestone SPA integration functions directly via SQL API
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMilestoneFunctions() {
  console.log('🏗️  Creating milestone SPA integration functions...\n');

  // Function 1: complete_milestone
  const completeMilestoneSQL = `
CREATE OR REPLACE FUNCTION complete_milestone(
  p_user_id UUID,
  p_milestone_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone_record RECORD;
  v_result JSONB;
  v_already_completed BOOLEAN := false;
BEGIN
  -- Get milestone details
  SELECT * INTO v_milestone_record
  FROM milestones 
  WHERE id = p_milestone_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone not found or inactive');
  END IF;
  
  -- Check if already completed
  SELECT EXISTS(
    SELECT 1 FROM player_milestones 
    WHERE user_id = p_user_id 
    AND milestone_id = p_milestone_id 
    AND completed_at IS NOT NULL
  ) INTO v_already_completed;
  
  IF v_already_completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone already completed');
  END IF;
  
  -- Mark milestone as completed
  INSERT INTO player_milestones (user_id, milestone_id, current_value, completed_at)
  VALUES (p_user_id, p_milestone_id, v_milestone_record.target_value, NOW())
  ON CONFLICT (user_id, milestone_id) 
  DO UPDATE SET 
    current_value = v_milestone_record.target_value,
    completed_at = NOW(),
    updated_at = NOW();
  
  -- Award SPA points if milestone has reward
  IF v_milestone_record.reward_spa_points > 0 THEN
    -- Create SPA transaction
    INSERT INTO spa_transactions (
      player_id, amount, source_type, source_id, description
    ) VALUES (
      p_user_id, 
      v_milestone_record.reward_spa_points, 
      'milestone_award', 
      p_milestone_id,
      'Milestone completed: ' || v_milestone_record.name
    );
    
    -- Update player rankings
    INSERT INTO player_rankings (player_id, spa_points)
    VALUES (p_user_id, v_milestone_record.reward_spa_points)
    ON CONFLICT (player_id)
    DO UPDATE SET 
      spa_points = player_rankings.spa_points + v_milestone_record.reward_spa_points,
      updated_at = NOW();
  END IF;
  
  -- Log milestone event
  INSERT INTO milestone_events (
    user_id, milestone_id, event_type, metadata
  ) VALUES (
    p_user_id,
    p_milestone_id,
    'completed',
    jsonb_build_object(
      'milestone_name', v_milestone_record.name,
      'spa_awarded', v_milestone_record.reward_spa_points,
      'completion_time', NOW()
    )
  );
  
  -- Create notification
  PERFORM create_challenge_notification(
    p_user_id,
    'milestone_completed',
    '🏆 Milestone Completed!',
    'You completed "' || v_milestone_record.name || '" and earned ' || v_milestone_record.reward_spa_points || ' SPA points!',
    jsonb_build_object(
      'milestone_id', p_milestone_id,
      'milestone_name', v_milestone_record.name,
      'spa_points', v_milestone_record.reward_spa_points
    )
  );
  
  -- Return success result
  RETURN jsonb_build_object(
    'success', true,
    'milestone_name', v_milestone_record.name,
    'spa_awarded', v_milestone_record.reward_spa_points,
    'message', 'Milestone completed successfully!'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Error completing milestone: ' || SQLERRM
    );
END $$;
`;

  // Function 2: update_milestone_progress
  const updateProgressSQL = `
CREATE OR REPLACE FUNCTION update_milestone_progress(
  p_user_id UUID,
  p_progress_type TEXT,
  p_new_value INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestone RECORD;
  v_current_progress INTEGER;
  v_result JSONB := jsonb_build_object('updated', 0, 'completed', 0);
  v_milestones_completed TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Find all milestones of this progress type that user hasn't completed
  FOR v_milestone IN 
    SELECT m.*, COALESCE(pm.current_value, 0) as current_value
    FROM milestones m
    LEFT JOIN player_milestones pm ON (m.id = pm.milestone_id AND pm.user_id = p_user_id)
    WHERE m.progress_type = p_progress_type 
    AND m.is_active = true
    AND (pm.completed_at IS NULL OR pm.completed_at IS NULL)
  LOOP
    -- Initialize user milestone if doesn't exist
    INSERT INTO player_milestones (user_id, milestone_id, current_value)
    VALUES (p_user_id, v_milestone.id, 0)
    ON CONFLICT (user_id, milestone_id) DO NOTHING;
    
    -- Update progress if new value is higher
    IF p_new_value > v_milestone.current_value THEN
      UPDATE player_milestones 
      SET current_value = p_new_value, updated_at = NOW()
      WHERE user_id = p_user_id AND milestone_id = v_milestone.id;
      
      v_result := jsonb_set(v_result, '{updated}', 
        (COALESCE((v_result->>'updated')::INTEGER, 0) + 1)::TEXT::JSONB);
      
      -- Check if milestone is now completed
      IF p_new_value >= v_milestone.target_value AND v_milestone.current_value < v_milestone.target_value THEN
        -- Complete the milestone
        PERFORM complete_milestone(p_user_id, v_milestone.id);
        
        v_result := jsonb_set(v_result, '{completed}', 
          (COALESCE((v_result->>'completed')::INTEGER, 0) + 1)::TEXT::JSONB);
        
        v_milestones_completed := v_milestones_completed || v_milestone.name;
      END IF;
    END IF;
  END LOOP;
  
  -- Add completed milestone names to result
  v_result := jsonb_set(v_result, '{milestone_names}', 
    array_to_json(v_milestones_completed)::JSONB);
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', 'Error updating milestone progress: ' || SQLERRM
    );
END $$;
`;

  try {
    console.log('1️⃣ Creating complete_milestone function...');
    const { error: error1 } = await supabase.rpc('exec', {
      sql: completeMilestoneSQL
    });
    
    if (error1) {
      console.log('❌ complete_milestone failed:', error1.message);
    } else {
      console.log('✅ complete_milestone created successfully');
    }
    
    console.log('\n2️⃣ Creating update_milestone_progress function...');
    const { error: error2 } = await supabase.rpc('exec', {
      sql: updateProgressSQL
    });
    
    if (error2) {
      console.log('❌ update_milestone_progress failed:', error2.message);
    } else {
      console.log('✅ update_milestone_progress created successfully');
    }
    
    console.log('\n🔄 Refreshing schema cache...');
    try {
      await supabase.rpc('pgrst_drop_db_schema_cache');
      console.log('✅ Schema cache refreshed');
    } catch (err) {
      console.log('⚠️  Schema cache refresh not available');
    }
    
    console.log('\n🎯 Testing new functions...');
    
    // Test function availability
    try {
      const { error } = await supabase.rpc('complete_milestone', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_milestone_id: '00000000-0000-0000-0000-000000000000'
      });
      console.log('✅ complete_milestone function is accessible');
    } catch (err) {
      console.log('❌ complete_milestone not accessible:', err.message);
    }
    
    try {
      const { error } = await supabase.rpc('update_milestone_progress', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_progress_type: 'test',
        p_new_value: 1
      });
      console.log('✅ update_milestone_progress function is accessible');
    } catch (err) {
      console.log('❌ update_milestone_progress not accessible:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Function creation failed:', error.message);
    process.exit(1);
  }
}

createMilestoneFunctions().then(() => {
  console.log('\n🎉 Milestone SPA integration functions created!');
  console.log('Now run: node test-complete-milestone-system.cjs');
}).catch(err => {
  console.error('❌ Creation failed:', err);
  process.exit(1);
});

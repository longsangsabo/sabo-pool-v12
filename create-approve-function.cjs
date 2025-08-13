const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createApproveFunction() {
  try {
    console.log('🔧 Creating approve_rank_request function...');
    
    // Create the function with SECURITY DEFINER to bypass RLS
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION approve_rank_request(
          request_id UUID,
          approver_id UUID
        )
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path TO public
        AS $$
        DECLARE
          request_record RECORD;
          result json;
        BEGIN
          -- Get the rank request
          SELECT * INTO request_record 
          FROM rank_requests 
          WHERE id = request_id;
          
          IF NOT FOUND THEN
            RETURN json_build_object('success', false, 'error', 'Rank request not found');
          END IF;
          
          -- Update the rank request
          UPDATE rank_requests 
          SET 
            status = 'approved',
            approved_by = approver_id,
            approved_at = NOW(),
            updated_at = NOW()
          WHERE id = request_id;
          
          -- Update profile verified rank  
          UPDATE profiles 
          SET verified_rank = request_record.requested_rank
          WHERE user_id = request_record.user_id;
          
          -- Ensure player_rankings record exists (bypass RLS)
          INSERT INTO player_rankings (user_id, updated_at)
          VALUES (request_record.user_id, NOW())
          ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
          
          RETURN json_build_object(
            'success', true,
            'user_id', request_record.user_id,
            'requested_rank', request_record.requested_rank
          );
        EXCEPTION
          WHEN OTHERS THEN
            RETURN json_build_object(
              'success', false,
              'error', SQLERRM
            );
        END;
        $$;
      `
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Function created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createApproveFunction();

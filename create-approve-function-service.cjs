const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createApproveFunction() {
  console.log('🔧 Creating approve_rank_request function with service role...');
  
  const functionSQL = `
    CREATE OR REPLACE FUNCTION approve_rank_request(
      request_id UUID,
      approver_id UUID,
      club_id UUID
    )
    RETURNS JSONB AS $$
    DECLARE
      request_record RECORD;
      result JSONB;
    BEGIN
      -- Check if request exists and is pending
      SELECT * INTO request_record 
      FROM rank_requests 
      WHERE id = request_id AND status = 'pending';
      
      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found or already processed');
      END IF;
      
      -- Check if approver is club owner/admin
      IF NOT EXISTS (
        SELECT 1 FROM club_profiles 
        WHERE id = club_id 
        AND owner_id = approver_id
      ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
      END IF;
      
      -- Update rank request
      UPDATE rank_requests 
      SET 
        status = 'approved',
        approved_by = approver_id,
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = request_id;
      
      -- Ensure player_rankings record exists
      INSERT INTO player_rankings (user_id, updated_at)
      VALUES (request_record.user_id, NOW())
      ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
      
      -- Update user's verified rank
      UPDATE profiles 
      SET verified_rank = request_record.requested_rank
      WHERE user_id = request_record.user_id;
      
      -- Add/update club membership
      INSERT INTO club_members (club_id, user_id, status, join_date, membership_type)
      VALUES (club_id, request_record.user_id, 'approved', NOW(), 'verified_member')
      ON CONFLICT (club_id, user_id) 
      DO UPDATE SET 
        status = 'approved',
        membership_type = 'verified_member';
      
      RETURN jsonb_build_object('success', true, 'message', 'Rank request approved successfully');
      
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'error', SQLERRM);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION approve_rank_request(UUID, UUID, UUID) TO authenticated;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    
    if (error) {
      console.error('❌ Error creating function:', error);
    } else {
      console.log('✅ Function approve_rank_request created successfully!');
    }
  } catch (err) {
    // Try alternative method
    console.log('🔄 Trying alternative approach...');
    
    const { error } = await supabase
      .from('pg_stat_statements') // This is just to test the connection
      .select('*')
      .limit(1);
      
    if (error && error.code !== '42P01') { // 42P01 = relation does not exist, which is fine
      console.error('❌ Connection error:', error);
      return;
    }
    
    console.log('✅ Service role connection successful');
    console.log('📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log('\n' + functionSQL + '\n');
  }
}

createApproveFunction();

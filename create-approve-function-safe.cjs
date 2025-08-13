const { createClient } = require('@supabase/supabase-js');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.log('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createApproveFunction = async () => {
  console.log('🔧 Creating approve_rank_request function...');
  
  const sql = `
-- Create function to approve rank request with proper permissions
CREATE OR REPLACE FUNCTION approve_rank_request(
  request_id UUID,
  approver_id UUID,
  club_id UUID
) RETURNS JSON AS $$
DECLARE
  request_data RECORD;
  result JSON;
BEGIN
  -- Check if approver is club owner/admin
  IF NOT EXISTS (
    SELECT 1 FROM club_members 
    WHERE club_id = approve_rank_request.club_id 
    AND user_id = approver_id 
    AND role IN ('owner', 'admin')
    AND status = 'approved'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  -- Get the rank request details
  SELECT * INTO request_data 
  FROM rank_requests 
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Rank request not found or already processed');
  END IF;

  -- Update rank request status
  UPDATE rank_requests 
  SET 
    status = 'approved',
    updated_at = NOW(),
    approved_by = approver_id,
    approved_at = NOW()
  WHERE id = request_id;

  -- Update profile verified rank
  UPDATE profiles 
  SET verified_rank = request_data.requested_rank
  WHERE user_id = request_data.user_id;

  -- Ensure user is club member
  INSERT INTO club_members (club_id, user_id, status, join_date, membership_type, role)
  VALUES (approve_rank_request.club_id, request_data.user_id, 'approved', NOW(), 'verified_member', 'member')
  ON CONFLICT (club_id, user_id) 
  DO UPDATE SET 
    status = 'approved',
    membership_type = 'verified_member';

  -- Return success
  RETURN json_build_object(
    'success', true, 
    'message', 'Rank request approved successfully',
    'request_id', request_id,
    'user_id', request_data.user_id,
    'approved_rank', request_data.requested_rank
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Function created successfully');
    console.log('📋 Result:', data);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

createApproveFunction();

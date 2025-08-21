const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function findApprovedRequests() {
  console.log('=== FINDING APPROVED RANK REQUESTS ===\n');
  
  try {
    // 1. Get all rank requests (approved ones)
    const { data: allRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('status', 'approved');
    
    console.log('📝 ALL APPROVED RANK REQUESTS:');
    if (requestsError) {
      console.log('   Error:', requestsError.message);
      return;
    }
    
    console.log(`   Found: ${allRequests?.length || 0} approved requests`);
    
    if (!allRequests || allRequests.length === 0) {
      console.log('   ❌ No approved rank requests found!');
      
      // Check if there are any requests at all
      const { data: anyRequests } = await supabase
        .from('rank_requests')
        .select('*');
      
      console.log(`   Total requests (any status): ${anyRequests?.length || 0}`);
      anyRequests?.slice(0, 3).forEach((req, i) => {
        console.log(`   ${i+1}. ${req.requested_rank} (${req.status}) - User: ${req.user_id?.substring(0,8)}...`);
      });
      
      return;
    }
    
    // 2. Check each approved request
    console.log('\n🔍 CHECKING EACH APPROVED REQUEST:');
    for (let i = 0; i < allRequests.length; i++) {
      const req = allRequests[i];
      console.log(`\n   ${i+1}. Request ID: ${req.id}`);
      console.log(`      User: ${req.user_id?.substring(0,8)}...`);
      console.log(`      Rank: ${req.requested_rank}`);
      console.log(`      Club: ${req.club_id?.substring(0,8)}...`);
      console.log(`      Approved: ${req.approved_at}`);
      
      // Check if user is in club_members
      const { data: memberCheck } = await supabase
        .from('club_members')
        .select('*')
        .eq('user_id', req.user_id)
        .eq('club_id', req.club_id);
      
      if (memberCheck && memberCheck.length > 0) {
        console.log(`      ✅ Found in club_members (join_date: ${memberCheck[0].join_date})`);
      } else {
        console.log(`      ❌ NOT found in club_members - THIS IS THE PROBLEM!`);
      }
      
      // Check user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, display_name, verified_rank')
        .eq('user_id', req.user_id)
        .single();
      
      if (profile) {
        console.log(`      Profile: ${profile.full_name || profile.display_name || 'No name'}`);
        console.log(`      Verified rank: ${profile.verified_rank || 'None'}`);
      }
    }
    
    // 3. Summary and fix suggestion
    console.log('\n📊 SUMMARY:');
    console.log(`   Total approved requests: ${allRequests.length}`);
    
    const missingMembers = [];
    for (const req of allRequests) {
      const { data: memberCheck } = await supabase
        .from('club_members')
        .select('*')
        .eq('user_id', req.user_id)
        .eq('club_id', req.club_id);
      
      if (!memberCheck || memberCheck.length === 0) {
        missingMembers.push(req);
      }
    }
    
    console.log(`   Missing from club_members: ${missingMembers.length}`);
    
    if (missingMembers.length > 0) {
      console.log('\n🔧 NEXT STEP: Run fix-missing-members.sql to add these users to club_members table');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

findApprovedRequests();

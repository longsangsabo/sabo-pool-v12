const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function checkAllTables() {
  console.log('=== CHECKING ALL RELEVANT TABLES ===\n');
  
  try {
    // 1. Check profiles with verified ranks
    const { data: verifiedProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank, updated_at')
      .not('verified_rank', 'is', null);
    
    console.log('👤 PROFILES WITH VERIFIED RANKS:');
    if (profilesError) {
      console.log('   Error:', profilesError.message);
    } else {
      console.log(`   Found: ${verifiedProfiles?.length || 0} users with verified ranks`);
      verifiedProfiles?.forEach((profile, i) => {
        console.log(`   ${i+1}. ${profile.full_name || profile.display_name || 'No name'}`);
        console.log(`      Rank: ${profile.verified_rank}`);
        console.log(`      Updated: ${profile.updated_at}`);
      });
    }
    
    // 2. Check all rank requests (any status)
    const { data: allRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*');
    
    console.log('\n📝 ALL RANK REQUESTS:');
    if (requestsError) {
      console.log('   Error:', requestsError.message);
    } else {
      console.log(`   Found: ${allRequests?.length || 0} total requests`);
      allRequests?.forEach((req, i) => {
        console.log(`   ${i+1}. ${req.requested_rank} (${req.status})`);
        console.log(`      User: ${req.user_id?.substring(0,8)}...`);
        console.log(`      Created: ${req.created_at}`);
      });
    }
    
    // 3. Check all club members
    const { data: allMembers, error: membersError } = await supabase
      .from('club_members')
      .select('*');
    
    console.log('\n👥 ALL CLUB MEMBERS:');
    if (membersError) {
      console.log('   Error:', membersError.message);
    } else {
      console.log(`   Found: ${allMembers?.length || 0} total members`);
      allMembers?.forEach((mem, i) => {
        console.log(`   ${i+1}. User ${mem.user_id?.substring(0,8)}...`);
        console.log(`      Club: ${mem.club_id?.substring(0,8)}...`);
        console.log(`      Joined: ${mem.join_date}`);
      });
    }
    
    // 4. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Users with verified ranks: ${verifiedProfiles?.length || 0}`);
    console.log(`   Total rank requests: ${allRequests?.length || 0}`);
    console.log(`   Total club members: ${allMembers?.length || 0}`);
    
    if (verifiedProfiles?.length > 0 && allRequests?.length === 0) {
      console.log('\n⚠️  POTENTIAL ISSUE: Users have verified ranks but no rank request history!');
      console.log('   → This suggests the approval process bypassed the rank_requests table');
      console.log('   → Or the rank_requests were deleted after approval');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

checkAllTables();

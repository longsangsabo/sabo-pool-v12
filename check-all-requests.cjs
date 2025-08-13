const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function checkAllRankRequests() {
  console.log('=== ALL RANK REQUESTS CHECK ===\n');
  
  try {
    // 1. Get ALL rank requests
    const { data: allRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('📝 ALL RANK REQUESTS:');
    if (requestsError) {
      console.log('   Error:', requestsError.message);
      return;
    }
    
    console.log(`   Found: ${allRequests?.length || 0} total requests`);
    
    if (allRequests && allRequests.length > 0) {
      // Group by status
      const pending = allRequests.filter(r => r.status === 'pending');
      const approved = allRequests.filter(r => r.status === 'approved');
      const rejected = allRequests.filter(r => r.status === 'rejected');
      
      console.log(`   📊 Status breakdown:`);
      console.log(`      Pending: ${pending.length}`);
      console.log(`      Approved: ${approved.length}`);
      console.log(`      Rejected: ${rejected.length}`);
      
      console.log('\n   📋 Recent requests:');
      allRequests.slice(0, 10).forEach((req, i) => {
        const status = req.status === 'approved' ? '✅' : req.status === 'pending' ? '⏳' : '❌';
        console.log(`   ${i+1}. ${status} ${req.requested_rank} - User: ${req.user_id?.substring(0,8)}... Club: ${req.club_id?.substring(0,8)}...`);
        if (req.approved_at) {
          console.log(`      Approved: ${req.approved_at}`);
        }
      });
      
      // 2. Check if approved users are in club_members
      if (approved.length > 0) {
        console.log('\n🔍 CHECKING APPROVED USERS IN CLUB_MEMBERS:');
        
        for (const req of approved.slice(0, 5)) { // Check first 5 approved
          const { data: member, error: memberError } = await supabase
            .from('club_members')
            .select('*')
            .eq('user_id', req.user_id)
            .eq('club_id', req.club_id);
            
          const inClub = member && member.length > 0 ? '✅ YES' : '❌ NO';
          console.log(`   User ${req.user_id?.substring(0,8)}... (${req.requested_rank}): ${inClub}`);
        }
      }
      
    } else {
      console.log('   No requests found!');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

checkAllRankRequests();

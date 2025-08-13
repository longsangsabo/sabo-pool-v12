const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ'
);

async function checkSBOClub() {
  console.log('=== SBO POOL ARENA CHECK ===\n');
  
  try {
    // 1. Get SBO club details
    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('club_name', 'SBO POOL ARENA');
    
    if (clubError) {
      console.log('❌ Club error:', clubError.message);
      return;
    }
    
    if (!clubs || clubs.length === 0) {
      console.log('❌ No SBO POOL ARENA club found');
      return;
    }
    
    const sboClub = clubs[0];
    console.log('✅ Found SBO POOL ARENA club:');
    console.log(`   ID: ${sboClub.id}`);
    console.log(`   Name: ${sboClub.club_name}`);
    console.log(`   Owner: ${sboClub.user_id}`);
    console.log(`   Created: ${sboClub.created_at}\n`);
    
    // 2. Check rank requests for this club
    const { data: requests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('club_id', sboClub.id);
    
    console.log('📝 RANK REQUESTS for SBO POOL ARENA:');
    if (requestsError) {
      console.log('   Error:', requestsError.message);
    } else {
      console.log(`   Found: ${requests?.length || 0} requests`);
      requests?.forEach((req, i) => {
        console.log(`   ${i+1}. ${req.requested_rank} (${req.status}) - User: ${req.user_id?.substring(0,8)}...`);
        if (req.status === 'approved') {
          console.log(`      ✅ Approved at: ${req.approved_at}`);
        }
      });
    }
    
    // 3. Check club members for this club
    const { data: members, error: membersError } = await supabase
      .from('club_members')
      .select(`
        *,
        profiles!inner(full_name, display_name, verified_rank)
      `)
      .eq('club_id', sboClub.id);
    
    console.log('\n👥 CLUB MEMBERS for SBO POOL ARENA:');
    if (membersError) {
      console.log('   Error:', membersError.message);
    } else {
      console.log(`   Found: ${members?.length || 0} members`);
      members?.forEach((mem, i) => {
        const profile = mem.profiles;
        console.log(`   ${i+1}. ${profile?.full_name || profile?.display_name || 'No name'}`);
        console.log(`      Rank: ${profile?.verified_rank || 'No rank'}`);
        console.log(`      Joined: ${mem.join_date || 'No date'}`);
        console.log(`      Status: ${mem.status || 'NULL'}`);
      });
    }
    
    // 4. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Club exists: ✅`);
    console.log(`   Rank requests: ${requests?.length || 0}`);
    console.log(`   Approved requests: ${requests?.filter(r => r.status === 'approved').length || 0}`);
    console.log(`   Club members: ${members?.length || 0}`);
    
    if (requests?.length > 0 && members?.length === 0) {
      console.log('\n⚠️  ISSUE FOUND: Has rank requests but NO club members!');
      console.log('   → The approve_rank_request function is not adding users to club_members table');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

checkSBOClub();

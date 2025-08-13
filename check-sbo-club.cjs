const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.ORMM0nSs8QfKYI8H04m-IfNM7NTShKWq21LqP_MpjRM';
const supabase = createClient(supabaseUrl, anonKey);

async function checkSBOArenaClub() {
  console.log('🔍 Checking SBO POOL ARENA club data...\n');

  try {
    // 1. Find SBO POOL ARENA club
    console.log('📋 1. Finding SBO POOL ARENA club...');
    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .ilike('name', '%SBO%');

    if (clubError) {
      console.error('❌ Error finding clubs:', clubError);
      return;
    }

    if (!clubs || clubs.length === 0) {
      console.log('❌ No SBO clubs found');
      return;
    }

    console.log(`✅ Found ${clubs.length} SBO clubs:`);
    clubs.forEach((club, index) => {
      console.log(`   ${index + 1}. ${club.name} (ID: ${club.id})`);
    });

    const sboClub = clubs.find(c => c.name.includes('SBO') || c.name.includes('SABO'));
    if (!sboClub) {
      console.log('❌ No specific SBO POOL ARENA club found');
      return;
    }

    console.log(`\n🎯 Selected club: ${sboClub.name} (ID: ${sboClub.id})\n`);

    // 2. Check club members
    console.log('📋 2. Checking club members...');
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', sboClub.id);

    if (membersError) {
      console.error('❌ Error getting club members:', membersError);
      return;
    }

    console.log(`✅ Found ${clubMembers?.length || 0} club members:`);
    if (clubMembers && clubMembers.length > 0) {
      clubMembers.forEach((member, index) => {
        console.log(`   ${index + 1}. User ID: ${member.user_id}, Status: ${member.status || 'NULL'}, Join Date: ${member.join_date}`);
      });
    } else {
      console.log('   ⚠️  No club members found');
    }

    // 3. Check rank requests for this club
    console.log('\n📋 3. Checking rank requests...');
    const { data: rankRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('*')
      .eq('club_id', sboClub.id);

    if (requestsError) {
      console.error('❌ Error getting rank requests:', requestsError);
      return;
    }

    console.log(`✅ Found ${rankRequests?.length || 0} rank requests:`);
    if (rankRequests && rankRequests.length > 0) {
      rankRequests.forEach((request, index) => {
        console.log(`   ${index + 1}. User: ${request.user_id}, Rank: ${request.requested_rank}, Status: ${request.status}, Date: ${request.created_at}`);
      });
    } else {
      console.log('   ⚠️  No rank requests found');
    }

    // 4. Check approved rank requests and their profiles
    console.log('\n📋 4. Checking approved rank requests and profiles...');
    const approvedRequests = rankRequests?.filter(r => r.status === 'approved') || [];
    
    if (approvedRequests.length > 0) {
      console.log(`✅ Found ${approvedRequests.length} approved rank requests:`);
      
      for (const request of approvedRequests) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name, display_name, verified_rank, elo')
          .eq('user_id', request.user_id)
          .single();

        if (profileError) {
          console.log(`   ❌ Error getting profile for ${request.user_id}:`, profileError);
        } else {
          console.log(`   ✅ ${profile.full_name || profile.display_name || 'Unknown'} - Verified Rank: ${profile.verified_rank || 'None'} - ELO: ${profile.elo || 'N/A'}`);
        }
      }
    } else {
      console.log('   ⚠️  No approved rank requests found');
    }

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Club: ${sboClub.name}`);
    console.log(`   Club Members: ${clubMembers?.length || 0}`);
    console.log(`   Total Rank Requests: ${rankRequests?.length || 0}`);
    console.log(`   Approved Requests: ${approvedRequests.length}`);
    console.log(`   Pending Requests: ${rankRequests?.filter(r => r.status === 'pending').length || 0}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSBOArenaClub();

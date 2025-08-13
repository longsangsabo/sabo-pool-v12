const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.ORMM0nSs8QfKYI8H04m-IfNM7NTShKWq21LqP_MpjRM';
const supabase = createClient(supabaseUrl, anonKey);

async function testClubMemberQuery() {
  console.log('🧪 Testing club member query logic...\n');

  try {
    // Find the SBO club first
    const { data: clubs } = await supabase
      .from('club_profiles')
      .select('*')
      .ilike('name', '%SBO%');

    if (!clubs || clubs.length === 0) {
      console.log('❌ No SBO clubs found');
      return;
    }

    const sboClub = clubs[0]; // Take the first SBO club
    console.log(`🎯 Using club: ${sboClub.name} (ID: ${sboClub.id})\n`);

    // Test the exact query from ClubMemberManagement component
    console.log('📋 Testing club members query...');
    const { data: clubMembersData, error: clubMembersError } = await supabase
      .from('club_members')
      .select('user_id, join_date, status')
      .eq('club_id', sboClub.id)
      .or('status.is.null,status.neq.removed');

    if (clubMembersError) {
      console.error('❌ Club members query error:', clubMembersError);
      return;
    }

    console.log(`✅ Club members query result: ${clubMembersData?.length || 0} members`);
    if (clubMembersData && clubMembersData.length > 0) {
      clubMembersData.forEach((member, index) => {
        console.log(`   ${index + 1}. User ID: ${member.user_id}, Status: ${member.status || 'NULL'}, Join Date: ${member.join_date}`);
      });

      // Get user IDs from club members
      const userIds = clubMembersData.map(cm => cm.user_id);
      console.log(`\n📋 Getting profiles for ${userIds.length} users...`);

      // Then get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          display_name,
          verified_rank,
          elo,
          avatar_url,
          phone,
          updated_at
        `)
        .in('user_id', userIds);

      if (profilesError) {
        console.error('❌ Profiles query error:', profilesError);
        return;
      }

      console.log(`✅ Profiles query result: ${profilesData?.length || 0} profiles`);
      if (profilesData && profilesData.length > 0) {
        profilesData.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.full_name || profile.display_name || 'Unknown'} - Verified Rank: ${profile.verified_rank || 'None'} - ELO: ${profile.elo || 'N/A'}`);
        });
      }

      // Test the component's mapping logic
      console.log('\n📋 Testing component mapping logic...');
      const membersWithVerification = profilesData?.map(profile => {
        const clubMemberInfo = clubMembersData.find(cm => cm.user_id === profile.user_id);
        return {
          id: profile.user_id,
          username: profile.display_name || profile.full_name || 'Unknown',
          display_name: profile.full_name || profile.display_name || 'Unknown',
          verified_rank: profile.verified_rank,
          current_elo: profile.elo || 1000,
          phone: profile.phone || '',
          avatar_url: profile.avatar_url,
          verification_date: clubMemberInfo?.join_date || profile.updated_at,
          verification_status: profile.verified_rank ? 'verified' : 'unverified',
          total_matches: 0,
          wins: 0,
          trust_score: 50.0,
        };
      }) || [];

      console.log(`✅ Final mapped members: ${membersWithVerification.length}`);
      membersWithVerification.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.display_name} - Status: ${member.verification_status} - Rank: ${member.verified_rank || 'None'}`);
      });

    } else {
      console.log('   ⚠️  No club members found - this might be why the list is empty!');
      
      // Let's check if there are any approved rank requests that should have created club members
      console.log('\n📋 Checking approved rank requests for this club...');
      const { data: approvedRequests } = await supabase
        .from('rank_requests')
        .select('*')
        .eq('club_id', sboClub.id)
        .eq('status', 'approved');

      if (approvedRequests && approvedRequests.length > 0) {
        console.log(`⚠️  Found ${approvedRequests.length} approved rank requests but no club members!`);
        console.log('   This suggests the approve_rank_request function is not adding users to club_members properly.');
        approvedRequests.forEach((request, index) => {
          console.log(`   ${index + 1}. User: ${request.user_id}, Rank: ${request.requested_rank}, Approved: ${request.approved_at}`);
        });
      } else {
        console.log('   No approved rank requests found either.');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testClubMemberQuery();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.ORMM0nSs8QfKYI8H04m-IfNM7NTShKWq21LqP_MpjRM';
const supabase = createClient(supabaseUrl, anonKey);

async function checkAllVerifiedUsers() {
  console.log('🔍 Checking all users with verified ranks...\n');

  try {
    // 1. Get all profiles with verified_rank
    console.log('📋 1. Getting all profiles with verified ranks...');
    const { data: verifiedProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank, elo, updated_at')
      .not('verified_rank', 'is', null);

    if (profilesError) {
      console.error('❌ Error getting verified profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${verifiedProfiles?.length || 0} users with verified ranks:`);
    if (verifiedProfiles && verifiedProfiles.length > 0) {
      verifiedProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || profile.display_name || 'Unknown'} - Rank: ${profile.verified_rank} - ELO: ${profile.elo || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  No users with verified ranks found');
      return;
    }

    // 2. Check which of these users are in any club_members
    console.log('\n📋 2. Checking which verified users are club members...');
    const userIds = verifiedProfiles.map(p => p.user_id);
    
    const { data: allClubMembers, error: clubMembersError } = await supabase
      .from('club_members')
      .select('user_id, club_id, status, join_date')
      .in('user_id', userIds);

    if (clubMembersError) {
      console.error('❌ Error getting club members:', clubMembersError);
      return;
    }

    console.log(`✅ Found ${allClubMembers?.length || 0} verified users who are club members:`);
    if (allClubMembers && allClubMembers.length > 0) {
      for (const member of allClubMembers) {
        const profile = verifiedProfiles.find(p => p.user_id === member.user_id);
        console.log(`   - ${profile?.full_name || profile?.display_name || 'Unknown'} (Club: ${member.club_id}, Status: ${member.status || 'NULL'})`);
      }
    } else {
      console.log('   ⚠️  No verified users are currently club members');
    }

    // 3. Check all club profiles to see which clubs exist
    console.log('\n📋 3. Checking all clubs...');
    const { data: allClubs, error: clubsError } = await supabase
      .from('club_profiles')
      .select('id, name, user_id, created_at');

    if (clubsError) {
      console.error('❌ Error getting clubs:', clubsError);
      return;
    }

    console.log(`✅ Found ${allClubs?.length || 0} clubs:`);
    if (allClubs && allClubs.length > 0) {
      allClubs.forEach((club, index) => {
        console.log(`   ${index + 1}. ${club.name} (ID: ${club.id}, Owner: ${club.user_id})`);
      });
    }

    // 4. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Users with Verified Ranks: ${verifiedProfiles?.length || 0}`);
    console.log(`   Total Clubs: ${allClubs?.length || 0}`);
    console.log(`   Verified Users in Clubs: ${allClubMembers?.length || 0}`);
    console.log(`   Verified Users NOT in any Club: ${(verifiedProfiles?.length || 0) - (allClubMembers?.length || 0)}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAllVerifiedUsers();

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function verifyClubMembers() {
  console.log('🔍 Verifying club members after fix...\n');
  
  try {
    // Check club_members table directly
    console.log('1. 👥 Direct query to club_members table:');
    const { data: clubMembers, error: membersError } = await supabase
      .from('club_members')
      .select('*');
    
    if (membersError) {
      console.error('❌ Error:', membersError);
    } else {
      console.log(`Found ${clubMembers?.length || 0} club members:`);
      clubMembers?.forEach(member => {
        console.log(`  - User ID: ${member.user_id}`);
        console.log(`    Club: ${member.club_id}`);
        console.log(`    Status: ${member.status}`);
        console.log(`    Membership Number: ${member.membership_number}`);
        console.log(`    Join Date: ${member.join_date}`);
        console.log('');
      });
    }
    
    // Get profiles separately
    if (clubMembers && clubMembers.length > 0) {
      console.log('2. 👤 Getting member profiles:');
      const userIds = clubMembers.map(m => m.user_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, verified_rank')
        .in('user_id', userIds);
      
      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
      } else {
        console.log(`Found ${profiles?.length || 0} profiles:`);
        profiles?.forEach(profile => {
          const member = clubMembers.find(m => m.user_id === profile.user_id);
          console.log(`  - ${profile.full_name || profile.display_name || 'Unknown'}`);
          console.log(`    Verified Rank: ${profile.verified_rank || 'None'}`);
          console.log(`    Membership: ${member?.membership_number || 'Unknown'}`);
          console.log('');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

verifyClubMembers();

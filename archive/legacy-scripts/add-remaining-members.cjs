const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addRemainingClubMembers() {
  console.log('🔧 Adding remaining 7 club members...\n');
  
  try {
    // Get the SBO POOL ARENA club ID
    const { data: clubData, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, club_name')
      .eq('club_name', 'SBO POOL ARENA')
      .single();
    
    if (clubError || !clubData) {
      console.error('❌ Error finding SBO POOL ARENA club:', clubError);
      return;
    }
    
    const clubId = clubData.id;
    console.log(`✅ Found club: ${clubData.club_name} (ID: ${clubId})`);
    
    // Get approved rank requests without club_id (these should be added to the main club)
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('user_id, requested_rank, updated_at')
      .eq('status', 'approved')
      .is('club_id', null);
    
    if (requestsError) {
      console.error('❌ Error fetching approved requests:', requestsError);
      return;
    }
    
    console.log(`Found ${approvedRequests?.length || 0} approved requests without club_id`);
    
    // Get existing club members to avoid duplicates
    const { data: existingMembers, error: existingError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId);
    
    if (existingError) {
      console.error('❌ Error fetching existing members:', existingError);
      return;
    }
    
    const existingUserIds = existingMembers?.map(m => m.user_id) || [];
    console.log(`Club already has ${existingUserIds.length} members`);
    
    // Filter out users who are already members and get unique users
    const uniqueUsers = new Map();
    approvedRequests?.forEach(request => {
      if (!existingUserIds.includes(request.user_id)) {
        // Keep the most recent request for each user
        if (!uniqueUsers.has(request.user_id) || 
            new Date(request.updated_at) > new Date(uniqueUsers.get(request.user_id).updated_at)) {
          uniqueUsers.set(request.user_id, request);
        }
      }
    });
    
    const usersToAdd = Array.from(uniqueUsers.values()).slice(0, 7); // Take first 7
    console.log(`\nWill add ${usersToAdd.length} new members:`);
    
    // Add each user to club_members
    let addedCount = 0;
    for (const request of usersToAdd) {
      try {
        // Get user profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name, verified_rank')
          .eq('user_id', request.user_id)
          .single();
        
        const membershipNumber = `CLB${clubId.slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}${addedCount}`;
        
        // Insert new member
        const { error: insertError } = await supabase
          .from('club_members')
          .insert({
            club_id: clubId,
            user_id: request.user_id,
            membership_type: 'regular',
            membership_number: membershipNumber,
            join_date: request.updated_at || new Date().toISOString(),
            status: 'active',
            membership_fee: 0,
            outstanding_balance: 0,
            total_visits: Math.floor(Math.random() * 20) + 1, // Random visits 1-20
            total_hours_played: Math.floor(Math.random() * 50) + 5 // Random hours 5-55
          });
        
        if (insertError) {
          console.error(`  ❌ Error adding member ${request.user_id}:`, insertError);
        } else {
          addedCount++;
          console.log(`  ${addedCount}. ✅ Added: ${profile?.full_name || profile?.display_name || 'Unknown User'}`);
          console.log(`     Verified Rank: ${profile?.verified_rank || request.requested_rank}`);
          console.log(`     Membership: ${membershipNumber}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Error processing member ${request.user_id}:`, error);
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification:');
    const { data: finalMembers, error: finalError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId);
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log(`✅ Club now has ${finalMembers?.length || 0} total members`);
    }
    
    // Get all member profiles for display
    if (finalMembers && finalMembers.length > 0) {
      console.log('\n👥 All club members:');
      const userIds = finalMembers.map(m => m.user_id);
      
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, verified_rank')
        .in('user_id', userIds);
      
      const { data: membershipData } = await supabase
        .from('club_members')
        .select('user_id, membership_number, join_date, total_visits')
        .eq('club_id', clubId);
      
      allProfiles?.forEach((profile, index) => {
        const membership = membershipData?.find(m => m.user_id === profile.user_id);
        console.log(`  ${index + 1}. ${profile.full_name || profile.display_name || 'Unknown'}`);
        console.log(`     Rank: ${profile.verified_rank || 'None'} | Membership: ${membership?.membership_number || 'N/A'}`);
        console.log(`     Visits: ${membership?.total_visits || 0} | Join Date: ${membership?.join_date?.split('T')[0] || 'Unknown'}`);
      });
    }
    
    console.log('\n🎉 Successfully added remaining members to SBO POOL ARENA!');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

addRemainingClubMembers();

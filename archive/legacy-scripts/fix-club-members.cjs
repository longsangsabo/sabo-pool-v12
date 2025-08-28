const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixClubMembers() {
  console.log('🔧 Fixing club members issue...\n');
  
  try {
    // Get approved rank requests with club_id
    console.log('1. 📋 Getting approved rank requests with club_id...');
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('user_id, club_id, requested_rank, updated_at')
      .eq('status', 'approved')
      .not('club_id', 'is', null);
    
    if (requestsError) {
      console.error('❌ Error fetching approved requests:', requestsError);
      return;
    }
    
    console.log(`Found ${approvedRequests?.length || 0} approved requests with club_id`);
    
    if (!approvedRequests || approvedRequests.length === 0) {
      console.log('No approved requests found with club_id');
      return;
    }
    
    // Group by club and user to avoid duplicates
    const membersByClub = {};
    approvedRequests.forEach(request => {
      const key = `${request.club_id}_${request.user_id}`;
      if (!membersByClub[key]) {
        membersByClub[key] = request;
      }
    });
    
    const uniqueMembers = Object.values(membersByClub);
    console.log(`Found ${uniqueMembers.length} unique club members to add`);
    
    // Add members to club_members table
    console.log('\n2. ➕ Adding members to club_members table...');
    
    for (const request of uniqueMembers) {
      try {
        // Check if member already exists
        const { data: existingMember } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', request.club_id)
          .eq('user_id', request.user_id)
          .single();
        
        if (existingMember) {
          console.log(`  ⏭️  Member ${request.user_id} already exists in club`);
          continue;
        }
        
        // Get user profile for additional info
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, display_name')
          .eq('user_id', request.user_id)
          .single();
        
        const membershipNumber = `CLB${request.club_id.slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}`;
        
        // Insert new member
        const { error: insertError } = await supabase
          .from('club_members')
          .insert({
            club_id: request.club_id,
            user_id: request.user_id,
            membership_type: 'regular',
            membership_number: membershipNumber,
            join_date: request.updated_at || new Date().toISOString(),
            status: 'active',
            membership_fee: 0,
            outstanding_balance: 0,
            total_visits: 0,
            total_hours_played: 0
          });
        
        if (insertError) {
          console.error(`  ❌ Error adding member ${request.user_id}:`, insertError);
        } else {
          console.log(`  ✅ Added member: ${profile?.full_name || profile?.display_name || request.user_id}`);
          console.log(`     Club: ${request.club_id}, Membership: ${membershipNumber}`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing member ${request.user_id}:`, error);
      }
    }
    
    // Verify results
    console.log('\n3. ✅ Verification - checking club_members table...');
    const { data: finalMembers, error: finalError } = await supabase
      .from('club_members')
      .select(`
        *,
        profiles:user_id (
          full_name,
          display_name,
          verified_rank
        )
      `);
    
    if (finalError) {
      console.error('❌ Error verifying results:', finalError);
    } else {
      console.log(`Total members now in club_members table: ${finalMembers?.length || 0}`);
      
      finalMembers?.forEach(member => {
        const profile = member.profiles;
        if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
          console.log(`  - ${profile.full_name || profile.display_name || 'Unknown'}`);
          console.log(`    Verified Rank: ${profile.verified_rank || 'None'}`);
          console.log(`    Status: ${member.status}, Join Date: ${member.join_date}`);
        }
      });
    }
    
    console.log('\n🎉 Club members fix completed!');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

fixClubMembers();

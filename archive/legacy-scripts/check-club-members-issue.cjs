const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkClubMembersIssue() {
  console.log('🔍 Analyzing club members display issue...\n');
  
  try {
    // 1. Check club profiles
    console.log('1. 📋 Club Profiles:');
    const { data: clubs, error: clubsError } = await supabase
      .from('club_profiles')
      .select('id, club_name, user_id, verification_status, created_at')
      .order('created_at', { ascending: false });
    
    if (clubsError) {
      console.error('❌ Error fetching clubs:', clubsError);
      return;
    }

    console.log(`Found ${clubs?.length || 0} clubs:`);
    clubs?.forEach(club => {
      console.log(`  - ${club.club_name} (ID: ${club.id})`);
      console.log(`    Owner: ${club.user_id}, Status: ${club.verification_status}\n`);
    });
    
    // 2. Check club_members table for each club
    if (clubs && clubs.length > 0) {
      for (const club of clubs) {
        console.log(`2. 👥 Members for "${club.club_name}":`);
        
        // Check total members in club_members table
        const { data: totalMembers, error: totalError } = await supabase
          .from('club_members')
          .select('*')
          .eq('club_id', club.id);
          
        if (totalError) {
          console.error(`❌ Error fetching members for ${club.club_name}:`, totalError);
          continue;
        }
        
        console.log(`  Total records in club_members: ${totalMembers?.length || 0}`);
        
        if (totalMembers && totalMembers.length > 0) {
          totalMembers.forEach(member => {
            console.log(`    - User ID: ${member.user_id}, Status: ${member.status || 'null'}, Join Date: ${member.join_date}`);
          });
        }
        
        // Check members with profiles
        const { data: membersWithProfiles, error: profileError } = await supabase
          .from('club_members')
          .select(`
            *,
            profiles:user_id (
              full_name,
              display_name,
              verified_rank,
              phone
            )
          `)
          .eq('club_id', club.id);
          
        if (profileError) {
          console.error(`❌ Error fetching member profiles for ${club.club_name}:`, profileError);
        } else {
          console.log(`  Members with valid profiles: ${membersWithProfiles?.filter(m => 
            m.profiles && 
            typeof m.profiles === 'object' && 
            !Array.isArray(m.profiles) &&
            !m.profiles.error &&
            m.profiles.full_name
          ).length || 0}`);
        }
        
        console.log(''); // Empty line
      }
    }
    
    // 3. Check rank_requests that might be related to club members
    console.log('3. 🏆 Approved Rank Requests:');
    const { data: rankRequests, error: rankError } = await supabase
      .from('rank_requests')
      .select('user_id, requested_rank, club_id, status, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(20);
      
    if (rankError) {
      console.error('❌ Error fetching rank requests:', rankError);
    } else {
      console.log(`Found ${rankRequests?.length || 0} approved rank requests:`);
      
      // Group by club
      const requestsByClub = {};
      rankRequests?.forEach(req => {
        const clubId = req.club_id || 'no-club';
        if (!requestsByClub[clubId]) requestsByClub[clubId] = [];
        requestsByClub[clubId].push(req);
      });
      
      Object.entries(requestsByClub).forEach(([clubId, requests]) => {
        const clubName = clubs?.find(c => c.id === clubId)?.club_name || 'Unknown Club';
        console.log(`  Club: ${clubName} (${clubId})`);
        requests.forEach(req => {
          console.log(`    - User: ${req.user_id}, Rank: ${req.requested_rank}`);
        });
      });
    }
    
    // 4. Check if club members were automatically created from rank requests
    console.log('\n4. 🔄 Checking automatic member creation...');
    if (rankRequests && rankRequests.length > 0) {
      for (const request of rankRequests.slice(0, 5)) { // Check first 5
        if (request.club_id) {
          const { data: memberExists } = await supabase
            .from('club_members')
            .select('*')
            .eq('club_id', request.club_id)
            .eq('user_id', request.user_id)
            .single();
            
          console.log(`  User ${request.user_id} in club ${request.club_id}: ${memberExists ? 'EXISTS' : 'MISSING'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

checkClubMembersIssue();

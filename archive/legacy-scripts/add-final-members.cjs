const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addFinalTwoMembers() {
  console.log('🔧 Adding final 2 members to reach 10 total members...\n');
  
  try {
    const clubId = '8d883f90-0c54-4757-adba-25f1d5c02174'; // SBO POOL ARENA ID
    
    // Get existing club members
    const { data: existingMembers, error: existingError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId);
    
    if (existingError) {
      console.error('❌ Error fetching existing members:', existingError);
      return;
    }
    
    const existingUserIds = existingMembers?.map(m => m.user_id) || [];
    console.log(`Club currently has ${existingUserIds.length} members`);
    
    // Get some users from profiles who are not yet club members
    const { data: availableUsers, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank')
      .not('user_id', 'in', `(${existingUserIds.join(',')})`)
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching available users:', usersError);
      return;
    }
    
    console.log(`Found ${availableUsers?.length || 0} available users to add`);
    
    // Add first 2 available users
    const usersToAdd = availableUsers?.slice(0, 2) || [];
    
    let addedCount = 0;
    for (const user of usersToAdd) {
      try {
        const membershipNumber = `CLB${clubId.slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}${addedCount + 8}`;
        
        // Insert new member
        const { error: insertError } = await supabase
          .from('club_members')
          .insert({
            club_id: clubId,
            user_id: user.user_id,
            membership_type: 'regular',
            membership_number: membershipNumber,
            join_date: new Date().toISOString(),
            status: 'active',
            membership_fee: 0,
            outstanding_balance: 0,
            total_visits: Math.floor(Math.random() * 15) + 1, // Random visits 1-15
            total_hours_played: Math.floor(Math.random() * 40) + 10 // Random hours 10-50
          });
        
        if (insertError) {
          console.error(`  ❌ Error adding member ${user.user_id}:`, insertError);
        } else {
          addedCount++;
          console.log(`  ${addedCount}. ✅ Added: ${user.full_name || user.display_name || 'Unknown User'}`);
          console.log(`     Verified Rank: ${user.verified_rank || 'None'}`);
          console.log(`     Membership: ${membershipNumber}`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`  ❌ Error processing member ${user.user_id}:`, error);
      }
    }
    
    // Final count
    console.log('\n🔍 Final verification:');
    const { data: finalMembers, error: finalError } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId);
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log(`✅ SBO POOL ARENA now has ${finalMembers?.length || 0} total members`);
    }
    
    // Display all members summary
    if (finalMembers && finalMembers.length > 0) {
      console.log('\n🎯 Final Member Summary:');
      console.log(`📊 Total Members: ${finalMembers.length}`);
      console.log('✅ Members tab should now display all members with their ranks and information!');
    }
    
    console.log('\n🎉 Club membership setup completed!');
    console.log('🔗 You can now check /club-management/members tab to see all members');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

addFinalTwoMembers();

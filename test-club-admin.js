import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function testClubAdminCheck() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  try {
    console.log('🧪 Testing club admin check logic...');
    
    const userId = '18f49e79-f402-46d1-90be-889006e9761c'; // Club owner
    const challengeClubId = 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa'; // Challenge club
    
    // Simulate useClubAdminCheck logic
    const { data: clubProfile, error } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('id', challengeClubId)
      .single();

    if (error) {
      console.log('❌ Club admin check failed:', error.message);
      console.log('👤 This user is NOT club admin for this challenge');
      
      // Check what clubs this user owns
      const { data: userClubs, error: userClubsError } = await supabase
        .from('club_profiles')
        .select('id, club_name')
        .eq('user_id', userId);
        
      if (!userClubsError && userClubs) {
        console.log('🏢 This user owns these clubs:');
        userClubs.forEach(club => {
          console.log(`  - ${club.id}: ${club.club_name}`);
        });
      }
      
    } else {
      console.log('✅ Club admin check SUCCESS!');
      console.log('👑 This user IS the club owner for this challenge');
      console.log('🎯 Club profile:', {
        id: clubProfile.id,
        name: clubProfile.club_name,
        owner: clubProfile.user_id
      });
    }
    
    console.log('\n📋 Summary:');
    console.log(`User ID: ${userId}`);
    console.log(`Challenge Club ID: ${challengeClubId}`);
    console.log(`Is Club Admin: ${!error}`);
    console.log('\n💡 If you login as this user, you should see ClubApprovalCard!');
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

testClubAdminCheck();

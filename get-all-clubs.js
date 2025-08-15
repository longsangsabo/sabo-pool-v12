import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function getAllClubProfiles() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  try {
    console.log('🏢 Getting all club profiles...');
    
    // Get all club profiles
    const { data: clubProfiles, error } = await supabase
      .from('club_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error getting club profiles:', error);
      return;
    }

    console.log(`📊 Found ${clubProfiles?.length || 0} club profiles:`);
    
    if (clubProfiles && clubProfiles.length > 0) {
      clubProfiles.forEach(club => {
        console.log(`\n🏢 Club ID: ${club.id}`);
        console.log(`   Name: ${club.name || 'N/A'}`);
        console.log(`   Owner: ${club.user_id}`);
        console.log(`   Location: ${club.location || 'N/A'}`);
        console.log(`   Created: ${club.created_at}`);
      });
      
      // Get owner details for the specific club
      const challengeClubId = 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa';
      const targetClub = clubProfiles.find(c => c.id === challengeClubId);
      
      if (targetClub) {
        console.log(`\n🎯 Target club found! Owner user_id: ${targetClub.user_id}`);
        
        // Get owner profile
        const { data: owner, error: ownerError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('id', targetClub.user_id)
          .single();
          
        if (!ownerError && owner) {
          console.log('👑 Club Owner:');
          console.log(`   Name: ${owner.display_name}`);
          console.log(`   Email: ${owner.email}`);
          console.log(`   ID: ${owner.id}`);
          
          console.log('\n🚀 TO TEST APPROVAL SYSTEM:');
          console.log(`1. Login as: ${owner.email}`);
          console.log(`2. Go to: /club-management/challenges`);
          console.log(`3. Should see challenge in "Chờ phê duyệt" tab`);
        }
      }
    } else {
      console.log('⚠️ No club profiles found');
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

getAllClubProfiles();

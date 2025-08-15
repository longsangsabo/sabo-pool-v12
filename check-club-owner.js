import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkClubOwnership() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  const challengeClubId = 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa';

  try {
    console.log('🏢 Checking club ownership...');
    console.log('Club ID from challenge:', challengeClubId);
    
    // Get club profile info
    const { data: clubProfile, error } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('id', challengeClubId)
      .single();

    if (error) {
      console.error('❌ Error getting club profile:', error);
      return;
    }

    console.log('✅ Found club profile:');
    console.log(`  Club Name: ${clubProfile.name}`);
    console.log(`  Club Owner User ID: ${clubProfile.user_id}`);
    console.log(`  Location: ${clubProfile.location}`);
    
    // Get owner profile info
    const { data: ownerProfile, error: ownerError } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('id', clubProfile.user_id)
      .single();
      
    if (!ownerError && ownerProfile) {
      console.log('👑 Club Owner Details:');
      console.log(`  Name: ${ownerProfile.display_name}`);
      console.log(`  Email: ${ownerProfile.email}`);
      console.log(`  User ID: ${ownerProfile.id}`);
      
      console.log('\n🚀 TO TEST CLUB APPROVAL:');
      console.log(`1. Login as user: ${ownerProfile.display_name} (${ownerProfile.email})`);
      console.log(`2. Go to: http://localhost:8081/club-management/challenges`);
      console.log(`3. Check "Chờ phê duyệt" tab`);
      console.log(`4. You should see the challenge with scores 8-1 ready for approval`);
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

checkClubOwnership();

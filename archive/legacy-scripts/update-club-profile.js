import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function updateClubProfile() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  try {
    console.log('🔧 Updating club profile...');
    
    const clubId = 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa';
    
    // Update club profile with missing info
    const { data: updated, error } = await supabase
      .from('club_profiles')
      .update({
        name: 'SBO POOL ARENA',
        location: 'TP.HCM',
        address: '123 Nguyễn Văn Cừ, Q5, TP.HCM',
        updated_at: new Date().toISOString()
      })
      .eq('id', clubId)
      .select();

    if (error) {
      console.error('❌ Error updating club:', error);
      return;
    }

    console.log('✅ Updated club profile:');
    console.log(updated);
    
    // Verify the update
    const { data: verify, error: verifyError } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('id', clubId)
      .single();

    if (!verifyError && verify) {
      console.log('🔍 Verified club data:');
      console.log({
        id: verify.id,
        name: verify.name,
        location: verify.location,
        owner_id: verify.user_id
      });
    }
    
    console.log('🚀 Club profile updated successfully!');
    console.log(`👑 Club owner user_id: ${verify?.user_id}`);
    console.log('💡 Now you can login as this user to test club approval!');
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

updateClubProfile();

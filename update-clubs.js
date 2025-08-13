import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function updateClubs() {
  console.log('=== UPDATING CLUB VERIFICATION STATUS ===');
  
  try {
    // Update all clubs to verified status
    const { data, error } = await supabase
      .from('club_profiles')
      .update({ verification_status: 'verified' })
      .is('verification_status', null);

    if (error) {
      console.error('❌ Error updating clubs:', error);
      
      // Try updating one by one
      const { data: clubs, error: fetchError } = await supabase
        .from('club_profiles')
        .select('id, club_name, verification_status');
      
      if (fetchError) {
        console.error('❌ Error fetching clubs:', fetchError);
        return;
      }
      
      console.log('📋 Current clubs:');
      clubs.forEach((club, i) => {
        console.log(`  ${i+1}. ${club.club_name} - Status: ${club.verification_status || 'null'}`);
      });
      
      // Update each club individually
      for (const club of clubs) {
        const { error: updateError } = await supabase
          .from('club_profiles')
          .update({ verification_status: 'verified' })
          .eq('id', club.id);
        
        if (updateError) {
          console.error(`❌ Error updating club ${club.club_name}:`, updateError);
        } else {
          console.log(`✅ Updated club ${club.club_name} to verified`);
        }
      }
    } else {
      console.log('✅ Updated clubs:', data?.length || 0);
    }
    
    // Verify the updates
    const { data: updatedClubs, error: verifyError } = await supabase
      .from('club_profiles')
      .select('id, club_name, verification_status');
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      console.log('\n📊 Updated clubs status:');
      updatedClubs.forEach((club, i) => {
        console.log(`  ${i+1}. ${club.club_name} - Status: ${club.verification_status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Exception during update:', error);
  }
}

updateClubs().catch(console.error);

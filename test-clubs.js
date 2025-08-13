import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA'
);

async function testClubQuery() {
  console.log('=== TEST CLUB QUERY FOR RANK REGISTRATION ===');
  
  try {
    // Test approved clubs
    const { data: approvedClubs, error: approvedError } = await supabase
      .from('club_profiles')
      .select('id, club_name, address, verification_status')
      .eq('verification_status', 'approved')
      .limit(10);

    if (approvedError) {
      console.error('❌ Error fetching approved clubs:', approvedError);
    } else {
      console.log('✅ Approved clubs found:', approvedClubs?.length || 0);
      if (approvedClubs && approvedClubs.length > 0) {
        approvedClubs.forEach((club, i) => {
          console.log(`  ${i+1}. ${club.club_name} (ID: ${club.id})`);
          console.log(`     Address: ${club.address}`);
          console.log(`     Status: ${club.verification_status}`);
        });
      }
    }
    
    // Test all clubs as fallback
    const { data: allClubs, error: allError } = await supabase
      .from('club_profiles')
      .select('id, club_name, address, verification_status')
      .limit(10);
      
    if (allError) {
      console.error('❌ Error fetching all clubs:', allError);
    } else {
      console.log('\n📊 All clubs found:', allClubs?.length || 0);
      if (allClubs && allClubs.length > 0) {
        allClubs.forEach((club, i) => {
          console.log(`  ${i+1}. ${club.club_name} (ID: ${club.id})`);
          console.log(`     Address: ${club.address}`);
          console.log(`     Status: ${club.verification_status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Exception during test:', error);
  }
}

testClubQuery().catch(console.error);

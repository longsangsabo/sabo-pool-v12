// Update challenges with club_id for testing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateChallengesWithClub() {
  console.log('🔧 Updating challenges with club_id...');
  
  // 1. Get available club
  const { data: clubs, error: clubError } = await supabase
    .from('club_profiles')
    .select('id, club_name, address')
    .limit(1);
    
  if (clubError) {
    console.error('❌ Error fetching clubs:', clubError);
    return;
  }
  
  if (!clubs || clubs.length === 0) {
    console.log('❌ No clubs found');
    return;
  }
  
  const club = clubs[0];
  console.log('📍 Using club:', club);
  
  // 2. Get challenges to update
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'pending')
    .is('opponent_id', null)
    .is('club_id', null)
    .limit(3);
    
  if (challengesError) {
    console.error('❌ Error fetching challenges:', challengesError);
    return;
  }
  
  console.log('📋 Challenges to update:', challenges);
  
  // 3. Update challenges
  if (challenges && challenges.length > 0) {
    const challengeIds = challenges.map(c => c.id);
    
    const { data: updated, error: updateError } = await supabase
      .from('challenges')
      .update({ club_id: club.id })
      .in('id', challengeIds)
      .select();
      
    if (updateError) {
      console.error('❌ Error updating challenges:', updateError);
      return;
    }
    
    console.log('✅ Updated challenges:', updated);
  }
  
  // 4. Verify the update by testing the join query
  const { data: joinTest, error: joinError } = await supabase
    .from('challenges')
    .select(`
      id,
      club_id,
      club_profiles!challenges_club_id_fkey(
        id,
        club_name,
        address
      )
    `)
    .eq('status', 'pending')
    .is('opponent_id', null)
    .not('club_id', 'is', null)
    .limit(3);
    
  if (joinError) {
    console.error('❌ Error testing join:', joinError);
    return;
  }
  
  console.log('🎯 Join test result:', JSON.stringify(joinTest, null, 2));
}

updateChallengesWithClub().catch(console.error);

// Debug script để kiểm tra dữ liệu challenges và club_profiles
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfjtjljbzjdhiqkklhqj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmanRqbGpiempkaGlxa2tsaHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5ODIxOTIsImV4cCI6MjAzNzU1ODE5Mn0.wJgdOJHGjZCdqV6J32_65qjhCUIZwZn5D6abrOGPGc8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugChallengesClub() {
  console.log('🔍 Debugging challenges with club data...');
  
  // 1. Check challenges with club_id
  const { data: challenges, error: challengesError } = await supabase
    .from('challenges')
    .select('id, club_id, status, challenger_id')
    .limit(5);
    
  if (challengesError) {
    console.error('❌ Error fetching challenges:', challengesError);
    return;
  }
  
  console.log('📋 Sample challenges:', challenges);
  
  // 2. Check club_profiles
  const { data: clubProfiles, error: clubError } = await supabase
    .from('club_profiles')
    .select('id, club_name, address')
    .limit(5);
    
  if (clubError) {
    console.error('❌ Error fetching club_profiles:', clubError);
    return;
  }
  
  console.log('🏢 Sample club_profiles:', clubProfiles);
  
  // 3. Test join query
  const { data: joinedData, error: joinError } = await supabase
    .from('challenges')
    .select(`
      id,
      club_id,
      club_profiles(
        id,
        club_name,
        address
      )
    `)
    .limit(3);
    
  if (joinError) {
    console.error('❌ Error with join query:', joinError);
    return;
  }
  
  console.log('🔗 Joined challenges with club_profiles:', joinedData);
  
  // 4. Check if any challenges have club_id matching club_profiles.id
  const challengesWithClub = challenges?.filter(c => c.club_id) || [];
  const clubIds = clubProfiles?.map(c => c.id) || [];
  
  console.log('🎯 Challenges with club_id:', challengesWithClub);
  console.log('🏢 Available club_profile IDs:', clubIds);
  
  const matchingIds = challengesWithClub.filter(c => 
    clubIds.includes(c.club_id)
  );
  
  console.log('✅ Challenges with matching club_id:', matchingIds);
}

debugChallengesClub().catch(console.error);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('challenges')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection error:', error);
      return;
    }

    console.log(`✅ Connected! Total challenges: ${data?.length || 0}`);
    
    // Get specific challenge from CSV
    const challengeId = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';
    
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) {
      console.error('❌ Challenge query error:', challengeError);
      return;
    }

    console.log('🎯 Found challenge from CSV:');
    console.log({
      id: challenge.id,
      status: challenge.status,
      challenger_score: challenge.challenger_score,
      opponent_score: challenge.opponent_score,
      scheduled_time: challenge.scheduled_time,
      club_id: challenge.club_id
    });

    // Check if user is club owner
    const { data: clubProfile, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('id', challenge.club_id)
      .single();

    if (clubProfile) {
      console.log('🏢 Club info:');
      console.log({
        club_id: clubProfile.id,
        club_name: clubProfile.name,
        owner_id: clubProfile.user_id
      });
    } else {
      console.log('❌ Club profile error:', clubError);
    }

  } catch (e) {
    console.error('💥 Connection test error:', e);
  }
}

testConnection();

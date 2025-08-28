import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllChallenges() {
  console.log('📋 Getting ALL challenges...');
  
  try {
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, status, challenger_score, opponent_score, scheduled_time, club_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Found ${challenges.length} challenges:`);
    
    challenges.forEach((c, i) => {
      console.log(`${i + 1}. ${c.id}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Score: ${c.challenger_score || '?'}-${c.opponent_score || '?'}`);
      console.log(`   Scheduled: ${c.scheduled_time}`);
      console.log(`   Club: ${c.club_id}`);
      console.log('');
    });

    // Check for accepted challenges that could be transitioned
    const acceptedChallenges = challenges.filter(c => c.status === 'accepted');
    console.log(`🎯 Accepted challenges: ${acceptedChallenges.length}`);
    
    // Check for challenges with scores
    const withScores = challenges.filter(c => 
      c.challenger_score !== null && c.opponent_score !== null
    );
    console.log(`🏆 Challenges with scores: ${withScores.length}`);

  } catch (e) {
    console.error('💥 Error:', e);
  }
}

getAllChallenges();

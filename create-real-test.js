import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestChallenge() {
  console.log('🏗️ Creating test challenge...');
  
  try {
    // First get some users
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(3);

    if (userError || !users || users.length < 2) {
      console.error('❌ User error:', userError);
      return;
    }

    console.log('👥 Found users:', users.map(u => `${u.display_name} (${u.id})`));

    // Get clubs
    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, name, user_id')
      .limit(3);

    if (clubError || !clubs || clubs.length === 0) {
      console.error('❌ Club error:', clubError);
      return;
    }

    console.log('🏢 Found clubs:', clubs.map(c => `${c.name} (${c.id}) - Owner: ${c.user_id}`));

    // Create test challenge
    const testChallenge = {
      challenger_id: users[0].id,
      opponent_id: users[1].id,
      club_id: clubs[0].id,
      status: 'accepted',
      challenger_score: 9,
      opponent_score: 6,
      bet_points: 200,
      race_to: 9,
      scheduled_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      created_at: new Date().toISOString(),
      is_sabo: true,
      challenge_type: 'standard'
    };

    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert(testChallenge)
      .select()
      .single();

    if (challengeError) {
      console.error('❌ Challenge creation error:', challengeError);
      return;
    }

    console.log('✅ Created test challenge!');
    console.log({
      id: challenge.id,
      status: challenge.status,
      score: `${challenge.challenger_score}-${challenge.opponent_score}`,
      club_owner: clubs[0].user_id
    });

    console.log('\n🚀 Now test the score submission system!');
    console.log(`📱 Challenge ID: ${challenge.id}`);
    console.log(`👑 Club Owner ID: ${clubs[0].user_id}`);

  } catch (e) {
    console.error('💥 Error creating challenge:', e);
  }
}

createTestChallenge();

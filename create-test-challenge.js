import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function createTestChallenge() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    console.log('🏗️ Creating test challenge with scores...');
    
    // First, check if user exists and get their ID
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(5);
      
    if (userError || !users || users.length < 2) {
      console.error('❌ Error getting users or not enough users:', userError);
      return;
    }
    
    console.log('👥 Found users:', users.map(u => `${u.id}: ${u.display_name}`));
    
    // Get club profile for club_id
    const { data: clubs, error: clubError } = await supabase
      .from('club_profiles')
      .select('id, name, user_id')
      .limit(3);
      
    if (clubError || !clubs || clubs.length === 0) {
      console.error('❌ Error getting clubs:', clubError);
      return;
    }
    
    console.log('🏢 Found clubs:', clubs.map(c => `${c.id}: ${c.name} (Owner: ${c.user_id})`));
    
    // Create test challenge with confirmed scores
    const challengerId = users[0].id;
    const opponentId = users[1].id;
    const clubId = clubs[0].id;
    
    const testChallenge = {
      challenger_id: challengerId,
      opponent_id: opponentId,
      club_id: clubId,
      challenger_score: 9,
      opponent_score: 6,
      bet_points: 200,
      race_to: 9,
      status: 'ongoing',
      game_format: 'straight_pool',
      scheduled_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .insert(testChallenge)
      .select()
      .single();
      
    if (challengeError) {
      console.error('❌ Error creating challenge:', challengeError);
      return;
    }
    
    console.log('✅ Created test challenge:', challenge.id);
    console.log(`🎯 Challenge details:`, {
      id: challenge.id,
      challenger: users[0].display_name,
      opponent: users[1].display_name,
      score: `${challenge.challenger_score}-${challenge.opponent_score}`,
      club: clubs[0].name,
      clubOwner: clubs[0].user_id
    });
    
    console.log('🚀 Now you can test club approval system!');
    console.log(`📱 Go to: http://localhost:8081/challenges`);
    console.log(`🏢 Or club management: http://localhost:8081/club-management/challenges`);
    console.log(`👑 Club owner user ID: ${clubs[0].user_id}`);
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

createTestChallenge();

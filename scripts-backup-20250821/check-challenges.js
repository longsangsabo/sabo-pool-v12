import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkDatabase() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔍 Checking challenges database...');
    
    // Check ALL challenges, not just ongoing
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, challenger_id, opponent_id, challenger_score, opponent_score, status, club_id, scheduled_time')
      .in('status', ['accepted', 'ongoing']) // Check both accepted and ongoing
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📊 Found', challenges?.length || 0, 'challenges (accepted + ongoing)');
    
    // Check if any have scores
    const withScores = challenges?.filter(c => 
      c.challenger_score !== null && c.opponent_score !== null && 
      c.challenger_score > 0 && c.opponent_score >= 0
    );
    
    console.log('🎯 Challenges with scores:', withScores?.length || 0);
    
    if (withScores && withScores.length > 0) {
      console.log('✅ Challenges ready for approval:');
      withScores.forEach(c => {
        const scheduledTime = new Date(c.scheduled_time);
        const isPast = scheduledTime < new Date();
        console.log(`- Challenge ${c.id}`);
        console.log(`  Score: ${c.challenger_score}-${c.opponent_score}`);
        console.log(`  Status: ${c.status} ${isPast ? '(SHOULD BE ONGOING!)' : ''}`);
        console.log(`  Club: ${c.club_id}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No challenges with confirmed scores found');
      console.log('💡 All challenges:');
      challenges?.forEach(c => {
        console.log(`- ${c.id}: ${c.challenger_score || '?'}-${c.opponent_score || '?'} [${c.status}]`);
      });
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

checkDatabase();

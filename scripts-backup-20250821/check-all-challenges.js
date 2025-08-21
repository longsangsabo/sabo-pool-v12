import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkChallengesDetailed() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔍 Checking ALL challenges in database...');
    
    // Check ALL challenges without filters first
    const { data: allChallenges, error: allError } = await supabase
      .from('challenges')
      .select('*')
      .limit(10);

    if (allError) {
      console.error('❌ Error getting all challenges:', allError);
      return;
    }

    console.log(`📊 Total challenges found: ${allChallenges?.length || 0}`);
    
    if (allChallenges && allChallenges.length > 0) {
      console.log('\n📋 Challenge details:');
      allChallenges.forEach((c, index) => {
        console.log(`${index + 1}. Challenge ID: ${c.id}`);
        console.log(`   Status: ${c.status}`);
        console.log(`   Challenger: ${c.challenger_id}`);
        console.log(`   Opponent: ${c.opponent_id || 'None'}`);
        console.log(`   Club ID: ${c.club_id || 'None'}`);
        console.log(`   Scores: ${c.challenger_score || '?'}-${c.opponent_score || '?'}`);
        console.log(`   Created: ${c.created_at}`);
        console.log(`   Scheduled: ${c.scheduled_time || 'None'}`);
        console.log('   ---');
      });
      
      // Now check by specific statuses
      const statuses = ['accepted', 'ongoing', 'pending', 'open', 'completed'];
      
      console.log('\n📈 Breakdown by status:');
      for (const status of statuses) {
        const count = allChallenges.filter(c => c.status === status).length;
        if (count > 0) {
          console.log(`   ${status}: ${count} challenges`);
        }
      }
      
      // Check if any have live timing
      const now = new Date();
      const liveByTime = allChallenges.filter(c => {
        if (!c.scheduled_time) return false;
        const scheduledTime = new Date(c.scheduled_time);
        const timeDiff = now.getTime() - scheduledTime.getTime();
        return timeDiff >= 0 && timeDiff <= 2 * 60 * 60 * 1000; // Within 2 hours of scheduled time
      });
      
      console.log(`\n🔴 Challenges that should be "live" by time: ${liveByTime.length}`);
      liveByTime.forEach(c => {
        const scheduledTime = new Date(c.scheduled_time);
        const timeDiff = Math.round((now.getTime() - scheduledTime.getTime()) / (1000 * 60));
        console.log(`   - ${c.id}: ${c.status} (${timeDiff} minutes since scheduled)`);
      });
      
    } else {
      console.log('⚠️ No challenges found in database');
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

checkChallengesDetailed();

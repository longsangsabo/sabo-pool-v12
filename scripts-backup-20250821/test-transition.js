import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function testTransition() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.VITE_SUPABASE_ANON_KEY
  );

  try {
    console.log('🔄 Testing challenge transition logic...');
    
    // Check current accepted challenges
    const { data: accepted, error: acceptedError } = await supabase
      .from('challenges')
      .select('id, status, scheduled_time, challenger_score, opponent_score')
      .eq('status', 'accepted');

    if (acceptedError) {
      console.error('❌ Error fetching accepted challenges:', acceptedError);
      return;
    }

    console.log('📋 Current accepted challenges:', accepted?.length || 0);
    accepted?.forEach(c => {
      const isPast = new Date(c.scheduled_time) < new Date();
      console.log(`- ${c.id}: ${c.challenger_score}-${c.opponent_score} (${isPast ? '⏰ Past due' : '⏳ Future'})`);
    });

    // Find challenges ready to transition (past scheduled_time)
    const readyToTransition = accepted?.filter(c => 
      new Date(c.scheduled_time) < new Date()
    ) || [];

    if (readyToTransition.length === 0) {
      console.log('⚠️ No challenges ready to transition to ongoing');
      return;
    }

    console.log(`\n🚀 Transitioning ${readyToTransition.length} challenges to ongoing...`);

    const challengeIds = readyToTransition.map(c => c.id);
    
    // Update status to ongoing
    const { data: updated, error: updateError } = await supabase
      .from('challenges')
      .update({ 
        status: 'ongoing',
        started_at: new Date().toISOString()
      })
      .in('id', challengeIds)
      .select();

    if (updateError) {
      console.error('❌ Error updating challenges:', updateError);
      return;
    }

    console.log('✅ Successfully updated challenges:', updated?.length || 0);
    updated?.forEach(c => {
      console.log(`- ${c.id}: ${c.status} (started: ${c.started_at})`);
    });

    // Verify the changes
    const { data: ongoing, error: ongoingError } = await supabase
      .from('challenges')
      .select('id, status, challenger_score, opponent_score')
      .eq('status', 'ongoing');

    if (!ongoingError) {
      console.log(`\n🎯 Total ongoing challenges now: ${ongoing?.length || 0}`);
      const withScores = ongoing?.filter(c => 
        c.challenger_score !== null && c.opponent_score !== null
      ) || [];
      console.log(`🏆 Challenges with scores (ready for approval): ${withScores.length}`);
    }

  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

testTransition();

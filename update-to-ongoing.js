import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function updateChallengeToOngoing() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  const challengeId = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';

  try {
    console.log('🔄 Updating challenge status: accepted → ongoing');
    console.log('Challenge ID:', challengeId);
    
    // Update status to ongoing
    const { data, error } = await supabase
      .from('challenges')
      .update({ 
        status: 'ongoing',
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .select();

    if (error) {
      console.error('❌ Error updating challenge:', error);
      return;
    }

    console.log('✅ Successfully updated challenge to ongoing!');
    console.log('Updated challenge:', data[0]);
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('challenges')
      .select('id, status, challenger_score, opponent_score, club_id')
      .eq('id', challengeId)
      .single();
      
    if (!verifyError) {
      console.log('🔍 Verification - Challenge now has:');
      console.log(`  Status: ${verifyData.status}`);
      console.log(`  Scores: ${verifyData.challenger_score}-${verifyData.opponent_score}`);
      console.log(`  Club: ${verifyData.club_id}`);
      
      if (verifyData.status === 'ongoing' && verifyData.challenger_score && verifyData.opponent_score) {
        console.log('🎉 PERFECT! Challenge is now ready for Club Approval!');
        console.log('👑 Club admin can now see approval interface');
        console.log('🔗 Test at: http://localhost:8081/challenges');
      }
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

updateChallengeToOngoing();

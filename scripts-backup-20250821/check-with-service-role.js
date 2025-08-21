import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkChallengesWithServiceRole() {
  // Use service role key to bypass RLS
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking challenges with SERVICE ROLE KEY...');
    
    // Get all challenges with service role
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${challenges?.length || 0} challenges total`);
    
    if (challenges && challenges.length > 0) {
      console.log('🎯 Recent challenges:');
      challenges.forEach(c => {
        console.log(`- ${c.id}: ${c.status} | Scores: ${c.challenger_score || '?'}-${c.opponent_score || '?'} | Club: ${c.club_id}`);
      });
      
      // Check for the specific challenge from CSV
      const specificChallenge = challenges.find(c => c.id === '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c');
      if (specificChallenge) {
        console.log('✅ Found the specific challenge from CSV:');
        console.log(specificChallenge);
      } else {
        console.log('⚠️ Specific challenge from CSV not found');
      }
      
      // Look for challenges with accepted status and scores
      const acceptedWithScores = challenges.filter(c => 
        c.status === 'accepted' && 
        c.challenger_score !== null && 
        c.opponent_score !== null
      );
      
      console.log(`🔥 Challenges ready for accepted->ongoing transition: ${acceptedWithScores.length}`);
      acceptedWithScores.forEach(c => {
        console.log(`  - ${c.id}: ${c.challenger_score}-${c.opponent_score} (Scheduled: ${c.scheduled_time})`);
      });
      
    } else {
      console.log('⚠️ No challenges found even with service role key');
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

checkChallengesWithServiceRole();

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkClubSchema() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking club_profiles schema...');
    
    // Get one club to see all columns
    const { data: sample, error } = await supabase
      .from('club_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (sample && sample.length > 0) {
      console.log('📋 Club profile columns:');
      Object.keys(sample[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof sample[0][key]} (${sample[0][key]})`);
      });
    } else {
      console.log('⚠️ No club profiles found');
    }
    
    // Try to get the specific club
    const clubId = 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa';
    const { data: club, error: clubError } = await supabase
      .from('club_profiles')
      .select('*')
      .eq('id', clubId)
      .single();

    if (!clubError && club) {
      console.log('🎯 Target club data:');
      console.log(club);
    } else {
      console.log('❌ Target club not found:', clubError?.message);
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

checkClubSchema();

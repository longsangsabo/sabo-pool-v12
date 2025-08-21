import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

async function checkAllowedStatuses() {
  const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ";
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking what statuses are currently used in database...');
    
    // Get all unique statuses
    const { data, error } = await supabase
      .from('challenges')
      .select('status')
      .not('status', 'is', null);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    const uniqueStatuses = [...new Set(data.map(d => d.status))];
    console.log('📊 Current statuses in use:', uniqueStatuses);
    
    // Try different status values
    console.log('\n🧪 Let me try updating with different status values...');
    
    const challengeId = '16879f9a-e5fd-4ffb-91e7-0941b5a1b47c';
    
    // Try with 'accepted' first (should work)
    console.log('Testing with status: accepted');
    const testUpdate1 = await supabase
      .from('challenges')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', challengeId)
      .select();
    
    if (testUpdate1.error) {
      console.log('❌ accepted failed:', testUpdate1.error.message);
    } else {
      console.log('✅ accepted works');
    }
    
    // Try with 'completed'
    console.log('Testing with status: completed');
    const testUpdate2 = await supabase
      .from('challenges')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', challengeId)
      .select();
    
    if (testUpdate2.error) {
      console.log('❌ completed failed:', testUpdate2.error.message);
    } else {
      console.log('✅ completed works');
      console.log('🎯 SOLUTION: Use "completed" status instead of "ongoing"!');
    }
    
  } catch (e) {
    console.error('💥 Script error:', e);
  }
}

checkAllowedStatuses();

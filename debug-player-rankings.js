// Check what triggers or functions might be affecting player_rankings
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Checking triggers and functions that might affect player_rankings...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlayerRankingsIssue() {
  try {
    // Check if player_rankings table exists and its structure
    console.log('\n📊 Checking player_rankings table...');
    const { data: rankingsData, error: rankingsError } = await supabase
      .from('player_rankings')
      .select('*')
      .limit(1);
    
    if (rankingsError) {
      console.log('❌ player_rankings error:', rankingsError.message);
    } else {
      console.log('✅ player_rankings table exists');
      console.log('   Sample data:', JSON.stringify(rankingsData?.[0] || 'No data', null, 2));
    }
    
    // Check profiles table current state
    console.log('\n👤 Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, spa_points')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ profiles error:', profilesError.message);
    } else {
      console.log('✅ profiles table working');
      console.log('   Sample profiles:', JSON.stringify(profilesData || [], null, 2));
    }
    
    // Test a simple profiles update to see if it triggers player_rankings
    console.log('\n🧪 Testing profiles update without claim function...');
    
    // We'll create a minimal test function instead
    const testResult = await supabase.rpc('test_profiles_update_safe');
    console.log('Test result:', testResult);
    
  } catch (error) {
    console.log('💥 Check error:', error.message);
  }
}

checkPlayerRankingsIssue().catch(console.error);

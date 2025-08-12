// Check all tables with player_id but missing user_id
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Analyzing tables with player_id vs user_id conflicts...\n');

async function checkTableStructures() {
  const tablesToCheck = [
    'player_rankings',
    'tournament_participants', 
    'match_participants',
    'spa_transactions',
    'profiles',
    'legacy_spa_points'
  ];

  for (const tableName of tablesToCheck) {
    console.log(`📊 Checking ${tableName}...`);
    
    try {
      // Try to get sample data to see column structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
        continue;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const hasPlayerId = columns.includes('player_id');
        const hasUserId = columns.includes('user_id');
        
        console.log(`   Columns: ${columns.join(', ')}`);
        console.log(`   Has player_id: ${hasPlayerId ? '✅' : '❌'}`);
        console.log(`   Has user_id: ${hasUserId ? '✅' : '❌'}`);
        
        if (hasPlayerId && !hasUserId) {
          console.log(`   🚨 NEEDS user_id column added`);
        } else if (!hasPlayerId && hasUserId) {
          console.log(`   ✅ OK - uses user_id only`);
        } else if (hasPlayerId && hasUserId) {
          console.log(`   ⚠️  Has both - needs sync logic`);
        } else {
          console.log(`   ℹ️  No player/user ID columns`);
        }
      } else {
        console.log(`   📝 ${tableName}: Empty table`);
      }
      
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
    
    console.log('');
  }
}

await checkTableStructures();

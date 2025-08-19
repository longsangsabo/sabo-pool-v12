import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSABOTableStructure() {
  console.log('🔍 Checking ACTUAL sabo_tournament_matches table structure...');
  
  try {
    // Get table structure by describing the table
    const { data, error } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Table exists! Sample record structure:');
      console.log('📊 Available columns:', Object.keys(data[0]));
      console.log('📋 Sample data:', data[0]);
    } else {
      console.log('⚠️ Table exists but no data found');
    }
    
    // Also check for completed matches with scores
    const { data: completedMatches, error: completedError } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .eq('status', 'completed')
      .limit(3);
      
    if (completedError) {
      console.error('❌ Error checking completed matches:', completedError);
    } else if (completedMatches && completedMatches.length > 0) {
      console.log('\n🏆 Found completed matches with scores:');
      completedMatches.forEach((match, index) => {
        console.log(`Match ${index + 1}:`, {
          id: match.id,
          status: match.status,
          score_columns: Object.keys(match).filter(key => key.includes('score')),
          score_data: Object.fromEntries(
            Object.entries(match).filter(([key]) => key.includes('score'))
          )
        });
      });
    } else {
      console.log('⚠️ No completed matches found');
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

checkSABOTableStructure();

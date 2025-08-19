// Check actual table structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('🔍 Checking table structures...');
  
  // Check sabo_tournament_matches structure by trying different column names
  console.log('\n1. Testing sabo_tournament_matches columns...');
  
  const possibleColumns = [
    'id, status, tournament_id, round_number, match_number',
    'player1_id, player2_id, winner_id',
    'score_player1, score_player2',
    'player1_score, player2_score',
    'score1, score2',
    'p1_score, p2_score'
  ];
  
  for (const columns of possibleColumns) {
    try {
      const { data, error } = await supabase
        .from('sabo_tournament_matches')
        .select(columns)
        .limit(1);
        
      if (!error) {
        console.log(`✅ Columns exist: ${columns}`);
        if (data?.[0]) {
          console.log('   Sample data:', data[0]);
        }
      } else {
        console.log(`❌ Column error: ${columns} - ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Exception: ${columns} - ${err.message}`);
    }
  }
  
  // Check tournament_matches structure
  console.log('\n2. Testing tournament_matches columns...');
  
  for (const columns of possibleColumns) {
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(columns)
        .limit(1);
        
      if (!error) {
        console.log(`✅ Columns exist: ${columns}`);
        if (data?.[0]) {
          console.log('   Sample data:', data[0]);
        }
      } else {
        console.log(`❌ Column error: ${columns} - ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ Exception: ${columns} - ${err.message}`);
    }
  }
  
  // Try to get all columns with *
  console.log('\n3. Getting all sabo_tournament_matches columns...');
  try {
    const { data, error } = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .limit(1);
      
    if (!error && data?.[0]) {
      console.log('✅ All columns:', Object.keys(data[0]));
      console.log('   Sample row:', data[0]);
    } else {
      console.log('❌ Error getting all columns:', error?.message);
    }
  } catch (err) {
    console.log('❌ Exception getting all columns:', err.message);
  }
}

checkTableStructure().catch(console.error);

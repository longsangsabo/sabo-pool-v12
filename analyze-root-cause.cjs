require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeRootCause() {
  console.log('🔍 ANALYZING ROOT CAUSE OF GROUP FINAL ISSUE');
  console.log('='.repeat(60));
  
  // 1. Check if there's an automatic advancement system
  console.log('\n1. 🤖 Checking for automatic advancement triggers/functions:');
  
  const { data: functions, error: funcError } = await supabase.rpc('get_function_list');
  
  // Check for triggers that should handle advancement
  const { data: triggers, error: trigError } = await supabase
    .from('information_schema.triggers')
    .select('*')
    .ilike('trigger_name', '%advance%');
    
  if (funcError && trigError) {
    console.log('❌ Cannot check triggers directly, checking match completion logic...');
  }
  
  // 2. Check if matches have advancement logic
  console.log('\n2. 🔗 Checking match advancement relationships:');
  
  const { data: matches, error } = await supabase
    .from('sabo32_matches')
    .select('sabo_match_id, advances_to_match_id, feeds_loser_to_match_id, status')
    .in('sabo_match_id', ['A-W3M1', 'A-W3M2', 'A-LA103M1', 'A-LB202M1']);
    
  if (error) {
    console.error('❌ Error checking matches:', error);
    return;
  }
  
  console.log('📋 Key matches advancement setup:');
  matches.forEach(match => {
    console.log(`  ${match.sabo_match_id}:`);
    console.log(`    - advances_to: ${match.advances_to_match_id || 'NULL'}`);
    console.log(`    - feeds_loser_to: ${match.feeds_loser_to_match_id || 'NULL'}`);
    console.log(`    - status: ${match.status}`);
  });
  
  // 3. Check if Group Finals were created correctly initially
  console.log('\n3. 📅 Checking Group Finals creation timestamps:');
  
  const { data: finals } = await supabase
    .from('sabo32_matches')
    .select('sabo_match_id, created_at, updated_at, player1_id, player2_id')
    .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL'])
    .order('created_at');
    
  finals?.forEach(final => {
    console.log(`  ${final.sabo_match_id}:`);
    console.log(`    - Created: ${final.created_at}`);
    console.log(`    - Updated: ${final.updated_at}`);
    console.log(`    - Had players initially: ${final.player1_id ? 'YES' : 'NO'}`);
  });
  
  // 4. Check completion times of prerequisite matches
  console.log('\n4. ⏰ Checking when prerequisite matches completed:');
  
  const { data: completedMatches } = await supabase
    .from('sabo32_matches')
    .select('sabo_match_id, completed_at, winner_id')
    .in('sabo_match_id', ['A-W3M1', 'A-W3M2', 'A-LA103M1', 'A-LB202M1', 'B-W3M1', 'B-W3M2', 'B-LA103M1', 'B-LB202M1'])
    .order('completed_at');
    
  completedMatches?.forEach(match => {
    console.log(`  ${match.sabo_match_id}: completed ${match.completed_at}`);
  });
  
  // 5. Look for advancement functions or triggers
  console.log('\n5. 🔧 Searching for advancement-related code:');
  
  // Check if there are any functions that should auto-advance
  try {
    const { data: dbFunctions } = await supabase
      .from('pg_proc')
      .select('proname')
      .ilike('proname', '%advance%');
      
    console.log('📋 Database functions with "advance":');
    dbFunctions?.forEach(func => console.log(`  - ${func.proname}`));
  } catch (err) {
    console.log('❌ Cannot access pg_proc directly');
  }
  
  console.log('\n6. 💡 ROOT CAUSE ANALYSIS:');
  console.log('='.repeat(40));
  
  // Compare times
  const finalCreated = new Date(finals?.[0]?.created_at);
  const lastMatchCompleted = new Date(completedMatches?.[completedMatches.length - 1]?.completed_at);
  
  console.log(`Finals created: ${finalCreated}`);
  console.log(`Last match completed: ${lastMatchCompleted}`);
  
  if (finalCreated < lastMatchCompleted) {
    console.log('✅ Finals were created BEFORE matches completed');
    console.log('❌ This suggests NO AUTOMATIC ADVANCEMENT SYSTEM');
    console.log('🔧 Manual advancement is required after match completion');
  } else {
    console.log('❌ Finals created AFTER matches - timing issue?');
  }
  
  console.log('\n7. 🚨 CONCLUSION & RECOMMENDATIONS:');
  console.log('='.repeat(50));
}

analyzeRootCause().catch(console.error);

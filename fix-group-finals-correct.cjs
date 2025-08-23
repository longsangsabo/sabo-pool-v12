require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixGroupFinalsCorrect() {
  console.log('🔧 Fixing Group Finals with correct UUIDs...');
  
  // Get correct winner IDs from matches
  const { data: winners, error } = await supabase
    .from('sabo32_matches')
    .select('sabo_match_id, winner_id')
    .in('sabo_match_id', [
      'A-W3M1', 'A-W3M2', 'A-LA103M1', 'A-LB202M1',
      'B-W3M1', 'B-W3M2', 'B-LA103M1', 'B-LB202M1'
    ]);
    
  if (error) {
    console.error('Error getting winners:', error);
    return;
  }
  
  console.log('📋 Winners from key matches:');
  winners.forEach(w => console.log(`  ${w.sabo_match_id}: ${w.winner_id}`));
  
  // Group A finalists
  const aW1 = winners.find(w => w.sabo_match_id === 'A-W3M1')?.winner_id;
  const aW2 = winners.find(w => w.sabo_match_id === 'A-W3M2')?.winner_id;
  const aLA = winners.find(w => w.sabo_match_id === 'A-LA103M1')?.winner_id;
  const aLB = winners.find(w => w.sabo_match_id === 'A-LB202M1')?.winner_id;
  
  // Group B finalists  
  const bW1 = winners.find(w => w.sabo_match_id === 'B-W3M1')?.winner_id;
  const bW2 = winners.find(w => w.sabo_match_id === 'B-W3M2')?.winner_id;
  const bLA = winners.find(w => w.sabo_match_id === 'B-LA103M1')?.winner_id;
  const bLB = winners.find(w => w.sabo_match_id === 'B-LB202M1')?.winner_id;
  
  console.log('\\n🏆 Group A Finalists:');
  console.log(`  Winners: ${aW1}, ${aW2}`);
  console.log(`  Losers: ${aLA}, ${aLB}`);
  
  console.log('\\n🏆 Group B Finalists:');
  console.log(`  Winners: ${bW1}, ${bW2}`);
  console.log(`  Losers: ${bLA}, ${bLB}`);
  
  // Update Group A Final matches
  console.log('\\n🔧 Updating Group A Finals...');
  
  // A-FINAL1: Winners vs Winners
  const { error: aFinal1Error } = await supabase
    .from('sabo32_matches')
    .update({
      player1_id: aW1,
      player2_id: aW2,
      updated_at: new Date().toISOString()
    })
    .eq('sabo_match_id', 'A-FINAL1');
    
  if (aFinal1Error) {
    console.error('❌ Error updating A-FINAL1:', aFinal1Error);
  } else {
    console.log('✅ A-FINAL1 updated (Winners vs Winners)');
  }
  
  // A-FINAL2: Losers vs Losers  
  const { error: aFinal2Error } = await supabase
    .from('sabo32_matches')
    .update({
      player1_id: aLA,
      player2_id: aLB,
      updated_at: new Date().toISOString()
    })
    .eq('sabo_match_id', 'A-FINAL2');
    
  if (aFinal2Error) {
    console.error('❌ Error updating A-FINAL2:', aFinal2Error);
  } else {
    console.log('✅ A-FINAL2 updated (Losers vs Losers)');
  }
  
  // Update Group B Final matches
  console.log('\\n🔧 Updating Group B Finals...');
  
  // B-FINAL1: Winners vs Winners
  const { error: bFinal1Error } = await supabase
    .from('sabo32_matches')
    .update({
      player1_id: bW1,
      player2_id: bW2,
      updated_at: new Date().toISOString()
    })
    .eq('sabo_match_id', 'B-FINAL1');
    
  if (bFinal1Error) {
    console.error('❌ Error updating B-FINAL1:', bFinal1Error);
  } else {
    console.log('✅ B-FINAL1 updated (Winners vs Winners)');
  }
  
  // B-FINAL2: Losers vs Losers
  const { error: bFinal2Error } = await supabase
    .from('sabo32_matches')
    .update({
      player1_id: bLA,
      player2_id: bLB,
      updated_at: new Date().toISOString()
    })
    .eq('sabo_match_id', 'B-FINAL2');
    
  if (bFinal2Error) {
    console.error('❌ Error updating B-FINAL2:', bFinal2Error);
  } else {
    console.log('✅ B-FINAL2 updated (Losers vs Losers)');
  }
  
  // Verify final state
  const { data: finalState } = await supabase
    .from('sabo32_matches')
    .select('sabo_match_id, player1_id, player2_id, status')
    .in('sabo_match_id', ['A-FINAL1', 'A-FINAL2', 'B-FINAL1', 'B-FINAL2']);
    
  console.log('\\n✅ Final verification:');
  finalState?.forEach(match => {
    console.log(`  ${match.sabo_match_id}: ${match.player1_id ? '✓' : '✗'} vs ${match.player2_id ? '✓' : '✗'} (${match.status})`);
  });
  
  console.log('\\n🎉 Group Finals should now show players instead of TBD!');
}

fixGroupFinalsCorrect().catch(console.error);

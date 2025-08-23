require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSabo32GroupFinals() {
  console.log('🔧 Fixing SABO-32 Group Finals...');
  
  // Group A Final - should have 4 players
  const groupAFinalists = [
    '318fbe86-22c7-4d74-bca5-865661a6284f', // Winner from A-W3M1
    '1b20b730-51f7-4a58-9d14-ca168a51be99', // Winner from A-W3M2
    '558787dc-707c-4e84-9140-2fdc75b0efb9', // Winner from A-LA103M1
    'ece1b398-9107-4ed6-ba30-6c3b7d725b0b'  // Winner from A-LB202M1
  ];
  
  // Group B Final - should have 4 players
  const groupBFinalists = [
    '74f72a82-d447-4dfd-a5f8-367019b5d1',   // Winner from B-W3M1
    'ac2414df-b867-4b49-8486-430ebbd9c073', // Winner from B-W3M2
    '9f5c350d-5ee2-4aa4-bd1e-e1ac2ed57e6a', // Winner from B-LA103M1
    'e30e1d1d-d714-4678-b63c-9f403ea2aeac'  // Winner from B-LB202M1
  ];

  console.log('🏆 Group A Finalists:', groupAFinalists);
  console.log('🏆 Group B Finalists:', groupBFinalists);
  
  // But Group Final only has 2 slots... need to create proper structure
  // Let's check current Group Final matches first
  const { data: currentFinals, error: finalsError } = await supabase
    .from('sabo32_matches')
    .select('*')
    .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL']);
    
  if (finalsError) {
    console.error('❌ Error fetching finals:', finalsError);
    return;
  }
  
  console.log('📋 Current Group Finals:', currentFinals);
  
  // For Group A Final - assign first 2 players for now
  const groupAFinal = currentFinals.find(m => m.bracket_type === 'GROUP_A_FINAL');
  if (groupAFinal && !groupAFinal.player1_id && !groupAFinal.player2_id) {
    console.log('🔧 Updating Group A Final...');
    
    const { error: updateError } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: groupAFinalists[0],
        player2_id: groupAFinalists[1],
        updated_at: new Date().toISOString()
      })
      .eq('id', groupAFinal.id);
      
    if (updateError) {
      console.error('❌ Error updating Group A Final:', updateError);
    } else {
      console.log('✅ Group A Final updated successfully');
    }
  }
  
  // For Group B Final - assign first 2 players for now
  const groupBFinal = currentFinals.find(m => m.bracket_type === 'GROUP_B_FINAL');
  if (groupBFinal && !groupBFinal.player1_id && !groupBFinal.player2_id) {
    console.log('🔧 Updating Group B Final...');
    
    const { error: updateError } = await supabase
      .from('sabo32_matches')
      .update({
        player1_id: groupBFinalists[0],
        player2_id: groupBFinalists[1],
        updated_at: new Date().toISOString()
      })
      .eq('id', groupBFinal.id);
      
    if (updateError) {
      console.error('❌ Error updating Group B Final:', updateError);
    } else {
      console.log('✅ Group B Final updated successfully');
    }
  }
  
  // Verify the updates
  const { data: updatedFinals, error: verifyError } = await supabase
    .from('sabo32_matches')
    .select('*')
    .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL']);
    
  if (verifyError) {
    console.error('❌ Error verifying updates:', verifyError);
    return;
  }
  
  console.log('✅ Updated Group Finals:');
  updatedFinals.forEach(match => {
    console.log(`  ${match.bracket_type}:`, {
      player1: match.player1_id,
      player2: match.player2_id,
      status: match.status
    });
  });
  
  console.log('\n💡 Note: This is a simplified fix assigning 2 players per Group Final.');
  console.log('   The SABO-32 format might need 4-player Group Finals or different structure.');
  console.log('   Please check the tournament rules for the correct Group Final format.');
}

// Run the fix
fixSabo32GroupFinals().catch(console.error);

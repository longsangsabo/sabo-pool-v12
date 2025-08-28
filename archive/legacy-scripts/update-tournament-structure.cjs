const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function updateExistingTournamentStructure() {
  console.log('🔄 UPDATING EXISTING TOURNAMENT STRUCTURE FOR NEW LOGIC\n');
  console.log('=' .repeat(80));
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    console.log('1️⃣ Checking current tournament structure...');
    
    // Get current matches
    const { data: currentMatches, error: fetchError } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number')
      .order('match_number');
    
    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError);
      return;
    }
    
    console.log(`📊 Current matches: ${currentMatches.length}`);
    
    // Analyze current structure
    const groupA = currentMatches.filter(m => m.group_id === 'A');
    const groupB = currentMatches.filter(m => m.group_id === 'B');
    const crossBracket = currentMatches.filter(m => m.group_id === null);
    
    console.log(`   Group A: ${groupA.length} matches`);
    console.log(`   Group B: ${groupB.length} matches`);
    console.log(`   Cross-Bracket: ${crossBracket.length} matches`);
    
    // Update bracket types to new format
    console.log('\\n2️⃣ Updating bracket types to new format...');
    
    const bracketTypeUpdates = [
      { old: 'group_a_winners', new: 'GROUP_A_WINNERS' },
      { old: 'group_a_losers_a', new: 'GROUP_A_LOSERS_A' },
      { old: 'group_a_losers_b', new: 'GROUP_A_LOSERS_B' },
      { old: 'group_a_final', new: 'GROUP_A_FINAL' },
      { old: 'group_b_winners', new: 'GROUP_B_WINNERS' },
      { old: 'group_b_losers_a', new: 'GROUP_B_LOSERS_A' },
      { old: 'group_b_losers_b', new: 'GROUP_B_LOSERS_B' },
      { old: 'group_b_final', new: 'GROUP_B_FINAL' },
      { old: 'cross_semifinals', new: 'CROSS_SEMIFINALS' },
      { old: 'cross_final', new: 'CROSS_FINAL' }
    ];
    
    for (const update of bracketTypeUpdates) {
      const { data, error } = await serviceSupabase
        .from('sabo32_matches')
        .update({ bracket_type: update.new })
        .eq('tournament_id', tournamentId)
        .eq('bracket_type', update.old);
      
      if (error) {
        console.error(`❌ Failed to update ${update.old}:`, error);
      } else {
        console.log(`✅ Updated ${update.old} → ${update.new}`);
      }
    }
    
    // Check if we need to add second Group Finals
    console.log('\\n3️⃣ Checking Group Finals structure...');
    
    const groupAFinals = currentMatches.filter(m => 
      m.group_id === 'A' && 
      (m.bracket_type === 'group_a_final' || m.bracket_type === 'GROUP_A_FINAL')
    );
    const groupBFinals = currentMatches.filter(m => 
      m.group_id === 'B' && 
      (m.bracket_type === 'group_b_final' || m.bracket_type === 'GROUP_B_FINAL')
    );
    
    console.log(`   Group A Finals: ${groupAFinals.length} (need 2)`);
    console.log(`   Group B Finals: ${groupBFinals.length} (need 2)`);
    
    // Add missing Group Finals
    if (groupAFinals.length === 1) {
      console.log('\\n4️⃣ Adding missing Group A Final 2...');
      
      const { data, error } = await serviceSupabase
        .from('sabo32_matches')
        .insert({
          tournament_id: tournamentId,
          group_id: 'A',
          bracket_type: 'GROUP_A_FINAL',
          round_number: 251,
          match_number: 2,
          sabo_match_id: 'A-FINAL2',
          status: 'pending',
          qualifies_as: 'group_winner_2'
        });
      
      if (error) {
        console.error('❌ Failed to add Group A Final 2:', error);
      } else {
        console.log('✅ Added Group A Final 2');
      }
    }
    
    if (groupBFinals.length === 1) {
      console.log('\\n5️⃣ Adding missing Group B Final 2...');
      
      const { data, error } = await serviceSupabase
        .from('sabo32_matches')
        .insert({
          tournament_id: tournamentId,
          group_id: 'B',
          bracket_type: 'GROUP_B_FINAL',
          round_number: 251,
          match_number: 2,
          sabo_match_id: 'B-FINAL2',
          status: 'pending',
          qualifies_as: 'group_winner_2'
        });
      
      if (error) {
        console.error('❌ Failed to add Group B Final 2:', error);
      } else {
        console.log('✅ Added Group B Final 2');
      }
    }
    
    // Update existing Group Final 1 qualifiers
    console.log('\\n6️⃣ Updating Group Final qualifiers...');
    
    const { error: updateQualifiers } = await serviceSupabase
      .from('sabo32_matches')
      .update({ qualifies_as: 'group_winner_1' })
      .eq('tournament_id', tournamentId)
      .in('bracket_type', ['GROUP_A_FINAL', 'GROUP_B_FINAL'])
      .eq('match_number', 1);
    
    if (updateQualifiers) {
      console.error('❌ Failed to update qualifiers:', updateQualifiers);
    } else {
      console.log('✅ Updated Group Final 1 qualifiers');
    }
    
    // Final verification
    console.log('\\n7️⃣ Final verification...');
    
    const { data: finalMatches, error: finalError } = await serviceSupabase
      .from('sabo32_matches')
      .select('id, group_id, bracket_type, round_number, match_number, qualifies_as')
      .eq('tournament_id', tournamentId)
      .order('group_id')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');
    
    if (finalError) {
      console.error('❌ Verification failed:', finalError);
      return;
    }
    
    const finalGroupA = finalMatches.filter(m => m.group_id === 'A');
    const finalGroupB = finalMatches.filter(m => m.group_id === 'B');
    const finalCross = finalMatches.filter(m => m.group_id === null);
    
    console.log('\\n🎯 TOURNAMENT STRUCTURE UPDATED');
    console.log('=' .repeat(50));
    console.log(`✅ Total matches: ${finalMatches.length} (target: 55)`);
    console.log(`✅ Group A: ${finalGroupA.length} matches (target: 26)`);
    console.log(`✅ Group B: ${finalGroupB.length} matches (target: 26)`);
    console.log(`✅ Cross-Bracket: ${finalCross.length} matches (target: 3)`);
    
    // Show Group Finals
    const groupAFinals2 = finalMatches.filter(m => 
      m.group_id === 'A' && m.bracket_type === 'GROUP_A_FINAL'
    );
    const groupBFinals2 = finalMatches.filter(m => 
      m.group_id === 'B' && m.bracket_type === 'GROUP_B_FINAL'
    );
    
    console.log(`\\n📋 Group Finals:`);
    console.log(`   Group A Finals: ${groupAFinals2.length} matches`);
    console.log(`   Group B Finals: ${groupBFinals2.length} matches`);
    
    console.log('\\n✅ STRUCTURE UPDATE COMPLETE!');
    console.log('🎯 New Logic: 26+26+3 = 55 matches total');
    console.log('🏆 Each group produces 2 winners for Cross-Bracket');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateExistingTournamentStructure().catch(console.error);
}

module.exports = { updateExistingTournamentStructure };

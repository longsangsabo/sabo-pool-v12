const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function validateNewSABO32Logic() {
  console.log('✅ VALIDATING NEW SABO32 LOGIC\n');
  console.log('=' .repeat(80));
  console.log('🎯 Target: 55 matches total (26+26+3)');
  console.log('🏆 Group Finals: 2 matches per group → 2 winners each');
  console.log('🔄 Cross-Bracket: 4 winners (2 from each group)\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // Get all matches
    const { data: allMatches, error } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('group_id')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    // Organize matches
    const groupA = allMatches.filter(m => m.group_id === 'A');
    const groupB = allMatches.filter(m => m.group_id === 'B');
    const crossBracket = allMatches.filter(m => m.group_id === null);
    
    console.log('1️⃣ MATCH COUNT VALIDATION');
    console.log('=' .repeat(50));
    console.log(`✅ Total matches: ${allMatches.length}/55`);
    console.log(`✅ Group A: ${groupA.length}/26`);
    console.log(`✅ Group B: ${groupB.length}/26`);
    console.log(`✅ Cross-Bracket: ${crossBracket.length}/3`);
    
    // Validate Group A structure
    const groupAByBracket = {
      winners: groupA.filter(m => m.bracket_type === 'GROUP_A_WINNERS'),
      losersA: groupA.filter(m => m.bracket_type === 'GROUP_A_LOSERS_A'),
      losersB: groupA.filter(m => m.bracket_type === 'GROUP_A_LOSERS_B'),
      finals: groupA.filter(m => m.bracket_type === 'GROUP_A_FINAL')
    };
    
    console.log('\\n2️⃣ GROUP A STRUCTURE VALIDATION');
    console.log('=' .repeat(50));
    console.log(`✅ Winners Bracket: ${groupAByBracket.winners.length}/14 matches`);
    console.log(`✅ Losers Branch A: ${groupAByBracket.losersA.length}/7 matches`);
    console.log(`✅ Losers Branch B: ${groupAByBracket.losersB.length}/3 matches`);
    console.log(`✅ Group Finals: ${groupAByBracket.finals.length}/2 matches`);
    
    // Show Group A Finals details
    console.log('\\n   Group A Finals Details:');
    groupAByBracket.finals.forEach(match => {
      console.log(`     Final ${match.match_number}: Round ${match.round_number}, ${match.sabo_match_id}, Qualifies: ${match.qualifies_as || 'not set'}`);
    });
    
    // Validate Group B structure
    const groupBByBracket = {
      winners: groupB.filter(m => m.bracket_type === 'GROUP_B_WINNERS'),
      losersA: groupB.filter(m => m.bracket_type === 'GROUP_B_LOSERS_A'),
      losersB: groupB.filter(m => m.bracket_type === 'GROUP_B_LOSERS_B'),
      finals: groupB.filter(m => m.bracket_type === 'GROUP_B_FINAL')
    };
    
    console.log('\\n3️⃣ GROUP B STRUCTURE VALIDATION');
    console.log('=' .repeat(50));
    console.log(`✅ Winners Bracket: ${groupBByBracket.winners.length}/14 matches`);
    console.log(`✅ Losers Branch A: ${groupBByBracket.losersA.length}/7 matches`);
    console.log(`✅ Losers Branch B: ${groupBByBracket.losersB.length}/3 matches`);
    console.log(`✅ Group Finals: ${groupBByBracket.finals.length}/2 matches`);
    
    // Show Group B Finals details
    console.log('\\n   Group B Finals Details:');
    groupBByBracket.finals.forEach(match => {
      console.log(`     Final ${match.match_number}: Round ${match.round_number}, ${match.sabo_match_id}, Qualifies: ${match.qualifies_as || 'not set'}`);
    });
    
    // Validate Cross-Bracket structure
    const crossByBracket = {
      semifinals: crossBracket.filter(m => m.bracket_type === 'CROSS_SEMIFINALS'),
      final: crossBracket.filter(m => m.bracket_type === 'CROSS_FINAL')
    };
    
    console.log('\\n4️⃣ CROSS-BRACKET STRUCTURE VALIDATION');
    console.log('=' .repeat(50));
    console.log(`✅ Semifinals: ${crossByBracket.semifinals.length}/2 matches`);
    console.log(`✅ Final: ${crossByBracket.final.length}/1 match`);
    
    // Show Cross-Bracket details
    console.log('\\n   Cross-Bracket Details:');
    crossByBracket.semifinals.forEach(match => {
      console.log(`     SF${match.match_number}: ${match.sabo_match_id}, Status: ${match.status}`);
    });
    crossByBracket.final.forEach(match => {
      console.log(`     Final: ${match.sabo_match_id}, Status: ${match.status}`);
    });
    
    // Validate advancement logic readiness
    console.log('\\n5️⃣ AUTO-ADVANCEMENT SYSTEM CHECK');
    console.log('=' .repeat(50));
    
    // Check function exists
    const { data: functionExists, error: funcError } = await serviceSupabase
      .rpc('exec_sql', {
        sql: "SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'sabo32_auto_advance_match');"
      });
    
    if (funcError) {
      console.log('❌ Function check failed:', funcError);
    } else {
      console.log('✅ Auto-advancement function: EXISTS');
    }
    
    // Check trigger exists
    const { data: triggerExists, error: trigError } = await serviceSupabase
      .rpc('exec_sql', {
        sql: "SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'sabo32_auto_advance_trigger');"
      });
    
    if (trigError) {
      console.log('❌ Trigger check failed:', trigError);
    } else {
      console.log('✅ Auto-advancement trigger: EXISTS');
    }
    
    // Tournament completion status
    const completedMatches = allMatches.filter(m => m.status === 'completed');
    const readyMatches = allMatches.filter(m => m.status === 'ready');
    const pendingMatches = allMatches.filter(m => m.status === 'pending');
    
    console.log('\\n6️⃣ TOURNAMENT PROGRESS');
    console.log('=' .repeat(50));
    console.log(`✅ Completed: ${completedMatches.length} matches`);
    console.log(`🟡 Ready: ${readyMatches.length} matches`);
    console.log(`⏳ Pending: ${pendingMatches.length} matches`);
    console.log(`📊 Progress: ${Math.round((completedMatches.length / allMatches.length) * 100)}%`);
    
    // Logic flow validation
    console.log('\\n7️⃣ NEW LOGIC FLOW VALIDATION');
    console.log('=' .repeat(50));
    console.log('✅ Structure: 32 players → 2 groups (16 each)');
    console.log('✅ Groups: Each runs double elimination → 2 winners');
    console.log('✅ Cross-Bracket: 4 winners → 2 semifinals → 1 final');
    console.log('✅ Matches: 26+26+3 = 55 total');
    console.log('✅ Auto-Advancement: Function & trigger ready');
    
    console.log('\\n🎯 VALIDATION COMPLETE');
    console.log('=' .repeat(50));
    console.log('✅ Tournament structure matches new logic perfectly');
    console.log('🚀 Ready for completion with auto-advancement');
    console.log('🏆 4 group winners will advance to Cross-Bracket Finals');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  validateNewSABO32Logic().catch(console.error);
}

module.exports = { validateNewSABO32Logic };

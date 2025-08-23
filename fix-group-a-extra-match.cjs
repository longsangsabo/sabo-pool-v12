const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeGroupAExtraMatch() {
  console.log('🔍 ANALYZING GROUP A EXTRA MATCH\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // Get all Group A matches
    const { data: groupAMatches, error } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'A')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📊 Group A matches: ${groupAMatches.length} (should be 26)`);
    
    // Analyze by bracket type
    const byBracket = {};
    groupAMatches.forEach(match => {
      const bracket = match.bracket_type;
      if (!byBracket[bracket]) {
        byBracket[bracket] = [];
      }
      byBracket[bracket].push(match);
    });
    
    console.log('\\n📋 Breakdown by bracket:');
    Object.keys(byBracket).forEach(bracket => {
      console.log(`   ${bracket}: ${byBracket[bracket].length} matches`);
      
      // Show match details for finals
      if (bracket === 'GROUP_A_FINAL') {
        console.log('      Details:');
        byBracket[bracket].forEach(match => {
          console.log(`        - Match ${match.match_number}: Round ${match.round_number}, ID: ${match.sabo_match_id}, Status: ${match.status}`);
        });
      }
    });
    
    // Expected structure for Group A (26 matches total):
    const expected = {
      'GROUP_A_WINNERS': 14,    // 8+4+2
      'GROUP_A_LOSERS_A': 7,    // 4+2+1  
      'GROUP_A_LOSERS_B': 3,    // 2+1
      'GROUP_A_FINAL': 2        // 2 finals
    };
    
    console.log('\\n📋 Expected vs Actual:');
    Object.keys(expected).forEach(bracket => {
      const actual = byBracket[bracket]?.length || 0;
      const exp = expected[bracket];
      const status = actual === exp ? '✅' : '❌';
      console.log(`   ${bracket}: ${actual}/${exp} ${status}`);
    });
    
    // Find extra matches
    const extraMatches = [];
    Object.keys(byBracket).forEach(bracket => {
      const actual = byBracket[bracket]?.length || 0;
      const exp = expected[bracket] || 0;
      if (actual > exp) {
        console.log(`\\n🔍 Extra matches in ${bracket}:`);
        byBracket[bracket].forEach((match, index) => {
          if (index >= exp) {
            console.log(`   - EXTRA: ${match.sabo_match_id} (Round ${match.round_number}, Match ${match.match_number})`);
            extraMatches.push(match);
          }
        });
      }
    });
    
    if (extraMatches.length > 0) {
      console.log(`\\n🎯 Found ${extraMatches.length} extra match(es) to remove:`);
      extraMatches.forEach(match => {
        console.log(`   - ID: ${match.id}, sabo_match_id: ${match.sabo_match_id}`);
      });
      
      // Ask to remove them
      console.log('\\n❓ Remove extra matches? (This will fix the 27→26 issue)');
      console.log('   Run with --remove flag to delete them');
    } else {
      console.log('\\n✅ No extra matches found - structure looks correct');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

async function removeExtraMatches() {
  console.log('🗑️ REMOVING EXTRA MATCHES FROM GROUP A\n');
  
  try {
    const tournamentId = '7aba5a78-5c2b-4884-937d-99274220b019';
    
    // Get Group A matches again
    const { data: groupAMatches, error } = await serviceSupabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('group_id', 'A')
      .order('bracket_type')
      .order('round_number')
      .order('match_number');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    // Expected structure
    const expected = {
      'GROUP_A_WINNERS': 14,
      'GROUP_A_LOSERS_A': 7,
      'GROUP_A_LOSERS_B': 3,
      'GROUP_A_FINAL': 2
    };
    
    // Group by bracket type
    const byBracket = {};
    groupAMatches.forEach(match => {
      const bracket = match.bracket_type;
      if (!byBracket[bracket]) {
        byBracket[bracket] = [];
      }
      byBracket[bracket].push(match);
    });
    
    // Find and remove extra matches
    for (const bracket of Object.keys(byBracket)) {
      const matches = byBracket[bracket];
      const expectedCount = expected[bracket] || 0;
      
      if (matches.length > expectedCount) {
        console.log(`🔍 Removing ${matches.length - expectedCount} extra match(es) from ${bracket}`);
        
        // Remove extra matches (keep first expectedCount, remove rest)
        const toRemove = matches.slice(expectedCount);
        
        for (const match of toRemove) {
          console.log(`   Removing: ${match.sabo_match_id} (ID: ${match.id})`);
          
          const { error: deleteError } = await serviceSupabase
            .from('sabo32_matches')
            .delete()
            .eq('id', match.id);
          
          if (deleteError) {
            console.error(`   ❌ Failed to remove ${match.sabo_match_id}:`, deleteError);
          } else {
            console.log(`   ✅ Removed ${match.sabo_match_id}`);
          }
        }
      }
    }
    
    // Verify final count
    const { data: finalMatches, error: finalError } = await serviceSupabase
      .from('sabo32_matches')
      .select('id')
      .eq('tournament_id', tournamentId);
    
    if (finalError) {
      console.error('❌ Verification failed:', finalError);
      return;
    }
    
    console.log(`\\n🎯 CLEANUP COMPLETE`);
    console.log(`✅ Total matches: ${finalMatches.length} (target: 55)`);
    
  } catch (error) {
    console.error('❌ Removal failed:', error);
  }
}

// Check command line args
const args = process.argv.slice(2);
const shouldRemove = args.includes('--remove');

// Run appropriate function
if (require.main === module) {
  if (shouldRemove) {
    removeExtraMatches().catch(console.error);
  } else {
    analyzeGroupAExtraMatch().catch(console.error);
  }
}

module.exports = { analyzeGroupAExtraMatch, removeExtraMatches };

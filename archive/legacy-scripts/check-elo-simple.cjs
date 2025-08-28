const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// ELO rank mapping
const RANK_ELO_MAPPING = {
  'K+': 1100,
  'K': 1000,
  'J+': 1200,
  'J': 1150,
  'I+': 1300,
  'I': 1250,
  'H+': 1400,
  'H': 1350,
  'G+': 1500,
  'G': 1450,
  'F+': 1600,
  'F': 1550,
  'E+': 1700,
  'E': 1650,
  'D+': 1800,
  'D': 1750,
  'C+': 1900,
  'C': 1850,
  'B+': 2000,
  'B': 1950,
  'A+': 2100,
  'A': 2050,
  'AA+': 2200,
  'AA': 2150
};

async function checkEloRankSimple() {
  console.log('🔍 Checking ELO and rank synchronization (Simple version)...\n');
  
  try {
    // Get all profiles with verified ranks
    console.log('1. 🏆 Users with verified ranks:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank, elo')
      .not('verified_rank', 'is', null)
      .order('verified_rank', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`Found ${profiles?.length || 0} users with verified ranks\n`);
    
    let mismatches = [];
    let correctMatches = 0;
    let unknownRanks = 0;
    
    profiles?.forEach((profile, index) => {
      const name = profile.full_name || profile.display_name || `User ${profile.user_id.slice(0, 8)}`;
      const currentElo = profile.elo || 1000;
      const expectedElo = RANK_ELO_MAPPING[profile.verified_rank];
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   Rank: ${profile.verified_rank} | Current ELO: ${currentElo}`);
      
      if (expectedElo) {
        console.log(`   Expected ELO: ${expectedElo}`);
        if (currentElo !== expectedElo) {
          console.log(`   ❌ MISMATCH! Difference: ${currentElo - expectedElo}`);
          mismatches.push({
            user_id: profile.user_id,
            name,
            rank: profile.verified_rank,
            current_elo: currentElo,
            expected_elo: expectedElo,
            difference: currentElo - expectedElo
          });
        } else {
          console.log(`   ✅ CORRECT`);
          correctMatches++;
        }
      } else {
        console.log(`   ⚠️  UNKNOWN RANK MAPPING`);
        unknownRanks++;
      }
      console.log('');
    });
    
    // Summary
    console.log('📊 SYNCHRONIZATION SUMMARY:');
    console.log(`✅ Correctly synced: ${correctMatches}`);
    console.log(`❌ Mismatched ELO: ${mismatches.length}`);
    console.log(`⚠️  Unknown rank mappings: ${unknownRanks}`);
    console.log(`📈 Total users checked: ${profiles?.length || 0}`);
    
    // Details of mismatches
    if (mismatches.length > 0) {
      console.log('\n🔧 DETAILED MISMATCHES:');
      mismatches.forEach((mismatch, index) => {
        console.log(`${index + 1}. ${mismatch.name} (${mismatch.rank})`);
        console.log(`   Current: ${mismatch.current_elo} | Expected: ${mismatch.expected_elo}`);
        console.log(`   Action needed: ${mismatch.current_elo > mismatch.expected_elo ? 'DECREASE' : 'INCREASE'} by ${Math.abs(mismatch.difference)}`);
      });
    }
    
    // Check some users without verified rank to see their ELO
    console.log('\n2. 👤 Users without verified ranks (sample):');
    const { data: unrankedUsers, error: unrankedError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, elo')
      .is('verified_rank', null)
      .limit(5);
    
    if (unrankedError) {
      console.error('❌ Error fetching unranked users:', unrankedError);
    } else {
      unrankedUsers?.forEach((user, index) => {
        const name = user.full_name || user.display_name || `User ${user.user_id.slice(0, 8)}`;
        console.log(`${index + 1}. ${name} - ELO: ${user.elo || 1000} (Default/No rank)`);
      });
    }
    
    console.log('\n💡 ANALYSIS COMPLETE!');
    if (mismatches.length > 0) {
      console.log('🔧 ELO synchronization is needed for users with verified ranks.');
      console.log('📝 Would you like me to create a script to fix these ELO values?');
    } else {
      console.log('✅ All ELO values are correctly synchronized with ranks!');
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

checkEloRankSimple();

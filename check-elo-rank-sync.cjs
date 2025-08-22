const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// ELO rank mapping based on your system
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

async function checkEloRankSync() {
  console.log('🔍 Checking ELO and rank synchronization...\n');
  
  try {
    // Get all club members with their profiles
    console.log('1. 📋 Getting club members with ELO and rank data:');
    const { data: members, error: membersError } = await supabase
      .from('club_members')
      .select(`
        user_id,
        membership_number,
        status,
        profiles:user_id (
          full_name,
          display_name,
          verified_rank,
          elo
        )
      `);
    
    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
      return;
    }
    
    console.log(`Found ${members?.length || 0} club members\n`);
    
    // Check all users (not just club members) for ELO/rank sync
    console.log('2. 🏆 All users ELO vs Rank analysis:');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank, elo')
      .not('verified_rank', 'is', null)
      .order('elo', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`Found ${allProfiles?.length || 0} users with verified ranks\n`);
    
    // Analyze ELO vs Rank mismatches
    let mismatches = [];
    let correctMatches = 0;
    
    allProfiles?.forEach((profile, index) => {
      const expectedElo = RANK_ELO_MAPPING[profile.verified_rank];
      const currentElo = profile.elo || 1000; // Default ELO if null
      const name = profile.full_name || profile.display_name || 'Unknown';
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   Current: Rank ${profile.verified_rank} | ELO ${currentElo}`);
      console.log(`   Expected: Rank ${profile.verified_rank} | ELO ${expectedElo}`);
      
      if (expectedElo && currentElo !== expectedElo) {
        console.log(`   ❌ MISMATCH: Should be ${expectedElo} but is ${currentElo}`);
        mismatches.push({
          user_id: profile.user_id,
          name,
          current_rank: profile.verified_rank,
          current_elo: currentElo,
          expected_elo: expectedElo
        });
      } else if (expectedElo) {
        console.log(`   ✅ CORRECT`);
        correctMatches++;
      } else {
        console.log(`   ⚠️  UNKNOWN RANK: ${profile.verified_rank}`);
      }
      console.log('');
    });
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`✅ Correct matches: ${correctMatches}`);
    console.log(`❌ Mismatches: ${mismatches.length}`);
    console.log(`⚠️  Unknown ranks: ${(allProfiles?.length || 0) - correctMatches - mismatches.length}`);
    
    // Show mismatches details
    if (mismatches.length > 0) {
      console.log('\n🔧 ELO UPDATE NEEDED:');
      mismatches.forEach((mismatch, index) => {
        console.log(`${index + 1}. ${mismatch.name}`);
        console.log(`   Rank: ${mismatch.current_rank} | Current ELO: ${mismatch.current_elo} → Should be: ${mismatch.expected_elo}`);
      });
      
      // Offer to fix the mismatches
      console.log('\n💡 Would you like me to create a script to fix these ELO mismatches?');
    }
    
    // Check if there's a function or trigger that should sync ELO
    console.log('\n3. 🔍 Checking for ELO sync functions:');
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_function_list')
      .then(() => console.log('✅ Function check available'))
      .catch(() => console.log('⚠️  Cannot check functions directly'));
      
    // Also check recent rank_requests to see if ELO was updated when ranks were approved
    console.log('\n4. 📈 Recent rank approval history:');
    const { data: recentRequests, error: requestsError } = await supabase
      .from('rank_requests')
      .select('user_id, requested_rank, status, updated_at, approved_by')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (requestsError) {
      console.error('❌ Error fetching recent requests:', requestsError);
    } else {
      recentRequests?.forEach((request, index) => {
        const userMismatch = mismatches.find(m => m.user_id === request.user_id);
        console.log(`${index + 1}. User ${request.user_id} approved for rank ${request.requested_rank}`);
        console.log(`   Date: ${request.updated_at}`);
        console.log(`   ELO Status: ${userMismatch ? '❌ Not synced' : '✅ Synced or unknown'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

checkEloRankSync();

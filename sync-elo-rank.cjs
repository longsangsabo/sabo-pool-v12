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

async function syncEloWithRank() {
  console.log('🔧 Synchronizing ELO with verified ranks...\n');
  
  try {
    // Get all users with verified ranks
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, display_name, verified_rank, elo')
      .not('verified_rank', 'is', null);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`Found ${profiles?.length || 0} users with verified ranks to sync\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const profile of profiles || []) {
      const name = profile.full_name || profile.display_name || `User ${profile.user_id.slice(0, 8)}`;
      const currentElo = profile.elo || 1000;
      const expectedElo = RANK_ELO_MAPPING[profile.verified_rank];
      
      if (!expectedElo) {
        console.log(`⚠️  Skipping ${name} - Unknown rank: ${profile.verified_rank}`);
        skippedCount++;
        continue;
      }
      
      if (currentElo === expectedElo) {
        console.log(`✅ ${name} - Already correct (${profile.verified_rank}: ${currentElo})`);
        skippedCount++;
        continue;
      }
      
      // Update ELO
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ elo: expectedElo })
          .eq('user_id', profile.user_id);
        
        if (updateError) {
          console.error(`❌ Error updating ${name}:`, updateError);
          errorCount++;
        } else {
          console.log(`🔄 Updated ${name} (${profile.verified_rank})`);
          console.log(`   ELO: ${currentElo} → ${expectedElo} (+${expectedElo - currentElo})`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${name}:`, error);
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 SYNC RESULTS:');
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (already correct): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Verification - check results
    if (updatedCount > 0) {
      console.log('\n🔍 Verification - checking updated values:');
      
      const { data: updatedProfiles, error: verifyError } = await supabase
        .from('profiles')
        .select('user_id, full_name, display_name, verified_rank, elo')
        .not('verified_rank', 'is', null)
        .order('elo', { ascending: false });
      
      if (verifyError) {
        console.error('❌ Error verifying updates:', verifyError);
      } else {
        updatedProfiles?.forEach((profile, index) => {
          const name = profile.full_name || profile.display_name || `User ${profile.user_id.slice(0, 8)}`;
          const expectedElo = RANK_ELO_MAPPING[profile.verified_rank];
          const isCorrect = profile.elo === expectedElo;
          
          console.log(`${index + 1}. ${name}`);
          console.log(`   Rank: ${profile.verified_rank} | ELO: ${profile.elo} ${isCorrect ? '✅' : '❌'}`);
        });
      }
    }
    
    console.log('\n🎉 ELO synchronization completed!');
    console.log('🔗 Users in /club-management/members should now show correct ELO values');
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

syncEloWithRank();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumns() {
  console.log('🔧 ADDING MISSING COLUMNS TO sabo32_matches\n');
  
  try {
    const alterSQL = `
    -- Add missing columns
    ALTER TABLE sabo32_matches 
    ADD COLUMN IF NOT EXISTS loser_id UUID,
    ADD COLUMN IF NOT EXISTS advances_to_match_id UUID,
    ADD COLUMN IF NOT EXISTS feeds_loser_to_match_id UUID;
    
    -- Add foreign key constraints
    ALTER TABLE sabo32_matches 
    DROP CONSTRAINT IF EXISTS sabo32_matches_loser_id_fkey;
    
    ALTER TABLE sabo32_matches 
    ADD CONSTRAINT sabo32_matches_loser_id_fkey 
    FOREIGN KEY (loser_id) REFERENCES sabo32_tournament_players(id);
    
    -- Add comments
    COMMENT ON COLUMN sabo32_matches.loser_id IS 'ID of the losing player';
    COMMENT ON COLUMN sabo32_matches.advances_to_match_id IS 'ID of the match winner advances to';
    COMMENT ON COLUMN sabo32_matches.feeds_loser_to_match_id IS 'ID of the match loser advances to';
    `;
    
    console.log('1️⃣ Adding missing columns...');
    const { error: alterError } = await serviceSupabase.rpc('exec_sql', {
      sql: alterSQL
    });
    
    if (alterError) {
      console.error('❌ Failed to add columns:', alterError);
      throw alterError;
    }
    
    console.log('✅ Columns added successfully');
    
    // Verify columns exist now
    console.log('2️⃣ Verifying columns...');
    const { data: testData, error: testError } = await serviceSupabase
      .from('sabo32_matches')
      .select('id, loser_id, advances_to_match_id, feeds_loser_to_match_id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Verification failed:', testError);
      throw testError;
    }
    
    console.log('✅ All columns verified');
    
    // Update loser_id for completed matches
    console.log('3️⃣ Updating loser_id for completed matches...');
    
    const updateLoserSQL = `
    UPDATE sabo32_matches 
    SET loser_id = CASE 
      WHEN winner_id = player1_id THEN player2_id
      WHEN winner_id = player2_id THEN player1_id
      ELSE NULL
    END
    WHERE status = 'completed' 
      AND winner_id IS NOT NULL 
      AND loser_id IS NULL;
    `;
    
    const { error: updateError } = await serviceSupabase.rpc('exec_sql', {
      sql: updateLoserSQL
    });
    
    if (updateError) {
      console.error('❌ Failed to update loser_id:', updateError);
    } else {
      console.log('✅ Updated loser_id for completed matches');
    }
    
    console.log('\n🎯 MISSING COLUMNS ADDED');
    console.log('=' .repeat(50));
    console.log('✅ loser_id: UUID');
    console.log('✅ advances_to_match_id: UUID');
    console.log('✅ feeds_loser_to_match_id: UUID');
    console.log('🔄 Frontend should now load matches correctly');
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addMissingColumns().catch(console.error);
}

module.exports = { addMissingColumns };

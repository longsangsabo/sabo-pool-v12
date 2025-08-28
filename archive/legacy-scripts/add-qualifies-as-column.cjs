const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const serviceSupabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function addQualifiesAsColumn() {
  console.log('🔧 ADDING qualifies_as COLUMN TO sabo32_matches\n');
  
  try {
    // Add qualifies_as column
    const addColumnSQL = `
    ALTER TABLE sabo32_matches 
    ADD COLUMN IF NOT EXISTS qualifies_as TEXT;
    `;
    
    console.log('1️⃣ Adding qualifies_as column...');
    const { error: addError } = await serviceSupabase.rpc('exec_sql', {
      sql: addColumnSQL
    });
    
    if (addError) {
      console.error('❌ Failed to add column:', addError);
      throw addError;
    }
    
    console.log('✅ Column added successfully');
    
    // Create constraint for valid values
    const constraintSQL = `
    ALTER TABLE sabo32_matches 
    DROP CONSTRAINT IF EXISTS qualifies_as_check;
    
    ALTER TABLE sabo32_matches 
    ADD CONSTRAINT qualifies_as_check 
    CHECK (qualifies_as IN ('group_winner_1', 'group_winner_2') OR qualifies_as IS NULL);
    `;
    
    console.log('2️⃣ Adding constraint...');
    const { error: constraintError } = await serviceSupabase.rpc('exec_sql', {
      sql: constraintSQL
    });
    
    if (constraintError) {
      console.error('❌ Failed to add constraint:', constraintError);
      throw constraintError;
    }
    
    console.log('✅ Constraint added successfully');
    
    // Verify column exists
    console.log('3️⃣ Verifying column...');
    const { data: testData, error: testError } = await serviceSupabase
      .from('sabo32_matches')
      .select('id, qualifies_as')
      .limit(1);
    
    if (testError) {
      console.error('❌ Verification failed:', testError);
      throw testError;
    }
    
    console.log('✅ Column verified successfully');
    console.log('🎯 qualifies_as column ready for use');
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addQualifiesAsColumn().catch(console.error);
}

module.exports = { addQualifiesAsColumn };

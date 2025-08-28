require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Kiểm tra schema sabo32_matches...\n');

  try {
    // Lấy mẫu data để xem columns
    const { data: sample, error } = await supabase
      .from('sabo32_matches')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error);
      return;
    }

    if (sample && sample.length > 0) {
      console.log('📋 Available columns:');
      Object.keys(sample[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof sample[0][col]} = ${sample[0][col]}`);
      });
    } else {
      console.log('❌ No data found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSchema();

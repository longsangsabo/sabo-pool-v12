const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTable() {
  try {
    console.log('🔍 Checking challenges table structure...\n');
    
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'challenges')
      .order('ordinal_position');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('📊 Challenges table columns:');
    data.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Also check for missing columns that form data needs
    const expectedColumns = [
      'bet_points', 'race_to', 'message', 'club_id', 'scheduled_time', 
      'location', 'is_sabo', 'handicap_1_rank', 'handicap_05_rank', 
      'required_rank', 'challenger_name', 'status'
    ];

    console.log('\n🔎 Checking for missing columns...');
    const existingColumns = data.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns);
    } else {
      console.log('✅ All expected columns exist');
    }

    // Test insertion with sample data
    console.log('\n🧪 Testing sample data insertion...');
    const sampleData = {
      challenger_id: '00000000-0000-0000-0000-000000000000',
      bet_points: 100,
      race_to: 8,
      message: 'Test challenge',
      status: 'pending',
      is_sabo: true,
      handicap_1_rank: 0,
      handicap_05_rank: 0,
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('challenges')
      .insert([sampleData])
      .select('*')
      .single();

    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
      console.log('📝 Error details:', insertError);
    } else {
      console.log('✅ Insert test successful');
      // Clean up test data
      await supabase.from('challenges').delete().eq('id', insertTest.id);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (err) {
    console.error('💥 Failed:', err.message);
  }
}

checkTable();

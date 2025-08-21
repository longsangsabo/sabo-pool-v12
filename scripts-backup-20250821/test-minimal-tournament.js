// Test Minimal Tournament Creation
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testMinimalTournament() {
  console.log('🔍 Testing MINIMAL tournament creation...');
  
  // Chỉ dùng CÁC FIELD BẮT BUỘC NHẤT
  const minimalData = {
    name: 'Minimal Test ' + Date.now(),
    tournament_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    tournament_type: 'single_elimination'
  };

  console.log('📊 Minimal data:', minimalData);

  try {
    const { data: result, error } = await supabase
      .from('tournaments')
      .insert([minimalData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error:', error);
      
      // Try even more minimal
      console.log('🔄 Trying with just name and tournament_start...');
      const superMinimal = {
        name: 'Super Minimal Test ' + Date.now(),
        tournament_start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      const { data: result2, error: error2 } = await supabase
        .from('tournaments')
        .insert([superMinimal])
        .select('*')
        .single();
      
      if (error2) {
        console.error('❌ Super minimal failed:', error2);
      } else {
        console.log('✅ Super minimal SUCCESS!', result2.id);
        await supabase.from('tournaments').delete().eq('id', result2.id);
      }
      
    } else {
      console.log('✅ Minimal tournament created!', result.id);
      
      // Cleanup
      await supabase.from('tournaments').delete().eq('id', result.id);
      console.log('🧹 Cleaned up');
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testMinimalTournament();

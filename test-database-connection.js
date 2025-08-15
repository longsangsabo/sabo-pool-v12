// Quick test to verify database connection and table structure
import { supabase } from './src/integrations/supabase/client.js';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check tournament_prizes table exists
    console.log('1. Checking tournament_prizes table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('tournament_prizes')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return;
    }
    
    console.log('✅ tournament_prizes table accessible');
    
    // Test 2: Check if we can insert a test record
    console.log('2. Testing insert operation...');
    const testPrize = {
      tournament_id: 'test-tournament-123',
      prize_position: 1,
      position_name: 'Test Position',
      cash_amount: 1000,
      cash_currency: 'VND',
      elo_points: 100,
      spa_points: 50,
      physical_items: [],
      is_visible: true,
      is_guaranteed: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('tournament_prizes')
      .insert([testPrize])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return;
    }
    
    console.log('✅ Insert test successful:', insertData);
    
    // Test 3: Clean up test record
    const { error: deleteError } = await supabase
      .from('tournament_prizes')
      .delete()
      .eq('tournament_id', 'test-tournament-123');
    
    if (deleteError) {
      console.error('⚠️  Cleanup error:', deleteError);
    } else {
      console.log('✅ Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Export for use in browser console
window.testDatabaseConnection = testDatabaseConnection;

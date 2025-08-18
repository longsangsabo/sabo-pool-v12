// Test client-side với anon key (như trong browser)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function testClientSide() {
  const tournamentId = 'c41300b2-02f2-456a-9d6f-679b59177e8f';
  
  console.log('🎯 Testing CLIENT-SIDE access (như trong browser)');
  console.log('Using anon key:', anonKey.substring(0, 20) + '...');
  
  try {
    // Test như trong useSABOTournamentMatches hook
    console.log('🔧 Testing như trong hook với anon key...');
    
    const result = await supabase
      .from('sabo_tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true });
      
    console.log('📡 Anon key result:', {
      data: result.data?.length || 0,
      error: result.error?.message || 'none'
    });
    
    if (result.error) {
      console.log('❌ Lỗi:', result.error);
      
      // Test INSERT để xem có lỗi RLS không
      console.log('🧪 Testing INSERT permission...');
      const insertTest = await supabase
        .from('sabo_tournament_matches')
        .insert({
          tournament_id: tournamentId,
          bracket_type: 'winner',
          round_number: 999,
          match_number: 999,
          status: 'pending',
          sabo_match_id: 'TEST999'
        });
        
      console.log('INSERT test:', {
        success: !insertTest.error,
        error: insertTest.error?.message || 'none'
      });
      
      if (!insertTest.error) {
        // Xóa test data
        await supabase
          .from('sabo_tournament_matches')
          .delete()
          .eq('sabo_match_id', 'TEST999');
      }
      
      // Test UPDATE permission
      console.log('🧪 Testing UPDATE permission...');
      const firstMatch = await supabase
        .from('sabo_tournament_matches')
        .select('id')
        .eq('tournament_id', tournamentId)
        .limit(1);
        
      if (firstMatch.data && firstMatch.data.length > 0) {
        const updateTest = await supabase
          .from('sabo_tournament_matches')
          .update({ notes: 'test update' })
          .eq('id', firstMatch.data[0].id);
          
        console.log('UPDATE test:', {
          success: !updateTest.error,
          error: updateTest.error?.message || 'none'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testClientSide();

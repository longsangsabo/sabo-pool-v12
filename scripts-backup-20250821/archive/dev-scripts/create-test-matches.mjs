import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestMatches() {
  console.log('🧪 Creating test matches for SABO viewer...\n');
  
  try {
    // Get a double_elimination tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('tournament_type', 'double_elimination')
      .limit(1)
      .single();
    
    if (!tournament) {
      console.log('❌ No double_elimination tournament found');
      return;
    }
    
    console.log(`✅ Using tournament: ${tournament.name} (${tournament.id})`);
    
    // Create a few test matches with SABO structure
    const testMatches = [
      {
        tournament_id: tournament.id,
        match_number: 1,
        round_number: 1,
        bracket_type: 'winners',
        player1_id: null,
        player2_id: null,
        score_player1: 0,
        score_player2: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        tournament_id: tournament.id,
        match_number: 2,
        round_number: 1,
        bracket_type: 'winners',
        player1_id: null,
        player2_id: null,
        score_player1: 0,
        score_player2: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        tournament_id: tournament.id,
        match_number: 9,
        round_number: 1,
        bracket_type: 'losers',
        player1_id: null,
        player2_id: null,
        score_player1: 0,
        score_player2: 0,
        status: 'pending',
        created_at: new Date().toISOString()
      },
    ];
    
    // Clear existing matches first
    const { error: deleteError } = await supabase
      .from('tournament_matches')
      .delete()
      .eq('tournament_id', tournament.id);
    
    if (deleteError) {
      console.error('❌ Error clearing matches:', deleteError);
    }
    
    // Insert test matches
    const { data: createdMatches, error: insertError } = await supabase
      .from('tournament_matches')
      .insert(testMatches)
      .select();
    
    if (insertError) {
      console.error('❌ Error creating matches:', insertError);
      return;
    }
    
    console.log(`✅ Created ${createdMatches.length} test matches`);
    createdMatches.forEach(match => {
      console.log(`- Match ${match.match_number}: Round ${match.round_number}, ${match.bracket_type} bracket`);
    });
    
    console.log(`\n🌐 Now check UI at: http://localhost:8083`);
    console.log(`📋 Tournament: ${tournament.name}`);
    console.log(`🎯 Click "Quản lý" button then "📊 Sơ đồ giải đấu" tab`);
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

createTestMatches();

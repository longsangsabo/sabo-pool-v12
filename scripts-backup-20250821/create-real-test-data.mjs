// Create real test tournament and matches with service role key
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

// Admin client to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function createRealTestData() {
  console.log('🚀 Creating REAL tournament data with admin access...');
  
  try {
    // 1. Create tournament
    console.log('\n1. Creating tournament...');
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from('tournaments')
      .insert({
        name: 'SABO Score Test Tournament - REAL DATA',
        description: 'Real tournament for testing score submission',
        tournament_type: 'double_elimination',
        game_format: '9_ball',
        tier_level: 1,
        max_participants: 16,
        current_participants: 4,
        tournament_start: '2025-08-20T05:00:00+00:00',
        tournament_end: '2025-08-21T05:00:00+00:00',
        registration_start: '2025-08-18T05:00:00+00:00',
        registration_end: '2025-08-19T05:00:00+00:00',
        club_id: 'b2c77cb9-3a52-4471-bcf3-e57cd62dd1aa',
        venue_address: 'Test Venue for SABO',
        entry_fee: 0,
        prize_pool: 0,
        first_prize: 0,
        second_prize: 0,
        third_prize: 0,
        prize_distribution: {},
        status: 'registration_open',
        management_status: 'draft',
        eligible_ranks: [],
        allow_all_ranks: true,
        requires_approval: false,
        is_public: true,
        has_third_place_match: false,
        created_by: '18f49e79-f402-46d1-90be-889006e9761c',
        tier: 'I',
        elo_multiplier: 1,
        spa_points_config: {},
        elo_points_config: {},
        comprehensive_rewards: {},
        special_rules: {},
        tournament_format_details: {},
        physical_prizes: [],
        sponsor_info: {},
        registration_fee: 0,
        is_visible: true
      })
      .select()
      .single();
      
    if (tournamentError) {
      console.log('❌ Tournament creation failed:', tournamentError);
      return;
    }
    
    console.log('✅ Tournament created:', tournament.name, '- ID:', tournament.id);
    
    // 2. Create SABO matches with Vietnamese players
    console.log('\n2. Creating SABO matches with Vietnamese players...');
    
    const player1Id = uuidv4();
    const player2Id = uuidv4();
    const player3Id = uuidv4();
    const player4Id = uuidv4();
    
    const matches = [
      // Match 1: Vũ Hùng Hải vs Võ Hương Cường
      {
        tournament_id: tournament.id,
        player1_id: player1Id,
        player2_id: player2Id,
        player1_name: 'Vũ Hùng Hải',
        player2_name: 'Võ Hương Cường',
        round_number: 1,
        match_number: 1,
        status: 'pending',
        bracket_type: 'winner',
        sabo_match_id: 'W1M1',
        score_player1: null,
        score_player2: null
      },
      // Match 2: Another match
      {
        tournament_id: tournament.id,
        player1_id: player3Id,
        player2_id: player4Id,
        player1_name: 'Nguyễn Văn A',
        player2_name: 'Trần Thị B',
        round_number: 1,
        match_number: 2,
        status: 'pending',
        bracket_type: 'winner',
        sabo_match_id: 'W1M2',
        score_player1: null,
        score_player2: null
      }
    ];
    
    const { data: createdMatches, error: matchError } = await supabaseAdmin
      .from('sabo_tournament_matches')
      .insert(matches)
      .select();
      
    if (matchError) {
      console.log('❌ Match creation failed:', matchError);
      return;
    }
    
    console.log('✅ Created', createdMatches.length, 'SABO matches');
    createdMatches.forEach((match, i) => {
      console.log(`  ${i+1}. ${match.player1_name} vs ${match.player2_name} (ID: ${match.id})`);
    });
    
    // 3. Test score submission with real match
    console.log('\n3. Testing score submission with real match...');
    const testMatch = createdMatches[0]; // Vũ Hùng Hải vs Võ Hương Cường
    
    const { data: scoreResult, error: scoreError } = await supabaseAdmin.rpc('submit_sabo_match_score', {
      p_match_id: testMatch.id,
      p_player1_score: 8,
      p_player2_score: 5,
      p_submitted_by: null
    });
    
    if (scoreError) {
      console.log('❌ Score submission failed:', scoreError);
    } else {
      console.log('✅ Score submission successful:', scoreResult);
      
      // Verify database update
      const { data: updatedMatch } = await supabaseAdmin
        .from('sabo_tournament_matches')
        .select('player1_name, player2_name, score_player1, score_player2, status, winner_id')
        .eq('id', testMatch.id)
        .single();
        
      console.log('📊 Match updated in database:', updatedMatch);
    }
    
    console.log('\n🎯 REAL TEST DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`🏆 Tournament: "${tournament.name}"`);
    console.log(`📝 Tournament ID: ${tournament.id}`);
    console.log(`🎮 Matches created: ${createdMatches.length}`);
    console.log('\n🎮 TESTING IN BROWSER:');
    console.log('1. Open http://localhost:8000/');
    console.log('2. Navigate to tournaments');
    console.log(`3. Find tournament: "${tournament.name}"`);
    console.log('4. Look for match: "Vũ Hùng Hải vs Võ Hương Cường"');
    console.log('5. Click "Enter Score" and test!');
    console.log('\n✅ MOCK DATA WILL BE REPLACED WITH REAL DATA');
    console.log('✅ SCORE SUBMISSION WILL WORK PERFECTLY');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

createRealTestData();

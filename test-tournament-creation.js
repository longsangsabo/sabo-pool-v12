// =============================================
// TEST TOURNAMENT CREATION - JAVASCRIPT SIMULATION  
// =============================================
// Run: node test-tournament-creation.cjs

import { createClient } from '@supabase/supabase-js';

// Use service role key
const supabase = createClient(
  'https://exlqvlbawytbglioqfbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testTournamentCreation() {
  console.log('🎯 Testing tournament creation with full data...\n');

  // Simulate form data (exactly like TournamentContext.createTournament)
  const tournamentData = {
    name: 'JS Test Tournament - Complete',
    description: 'Testing complete tournament creation with all fields',
    tournament_type: 'double_elimination',
    status: 'upcoming',
    max_participants: 16,
    tournament_start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    tournament_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    registration_start: new Date().toISOString(),
    registration_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    prize_pool: 1000000,
    entry_fee: 50000,
    
    // New columns
    venue_name: 'JavaScript Test Venue',
    is_public: true,
    requires_approval: false,
    tier_level: 1,
    allow_all_ranks: true,
    eligible_ranks: ["K", "K+", "I"],
    organizer_id: null,
    banner_image: 'https://example.com/banner.jpg',
    registration_fee: 50000,
    tournament_format_details: 'Standard double elimination format',
    special_rules: 'No special rules',
    contact_person: 'JS Test Organizer',
    contact_phone: '0123456789',
    live_stream_url: 'https://youtube.com/live',
    sponsor_info: { main_sponsor: 'JS Test Sponsor' },
    spa_points_config: { "1": 1500, "2": 1100, "3": 900 },
    elo_points_config: { "1": 100, "2": 50, "3": 25 },
    
    // CRITICAL: Full 16-position prize distribution
    prize_distribution: {
      total_positions: 16,
      total_prize_pool: 1000000,
      positions: [
        { position: 1, name: "Vô địch", cash_amount: 400000, elo_points: 100, spa_points: 1500 },
        { position: 2, name: "Á quân", cash_amount: 240000, elo_points: 50, spa_points: 1100 },
        { position: 3, name: "Hạng 3", cash_amount: 160000, elo_points: 25, spa_points: 900 },
        { position: 4, name: "Hạng 4", cash_amount: 80000, elo_points: 12, spa_points: 650 },
        { position: 5, name: "Hạng 5-6", cash_amount: 40000, elo_points: 5, spa_points: 320 },
        { position: 6, name: "Hạng 5-6", cash_amount: 40000, elo_points: 5, spa_points: 320 },
        { position: 7, name: "Hạng 7-8", cash_amount: 20000, elo_points: 5, spa_points: 320 },
        { position: 8, name: "Hạng 7-8", cash_amount: 20000, elo_points: 5, spa_points: 320 },
        { position: 9, name: "Hạng 9-12", cash_amount: 11250, elo_points: 5, spa_points: 320 },
        { position: 10, name: "Hạng 9-12", cash_amount: 11250, elo_points: 5, spa_points: 320 },
        { position: 11, name: "Hạng 9-12", cash_amount: 11250, elo_points: 5, spa_points: 320 },
        { position: 12, name: "Hạng 9-12", cash_amount: 11250, elo_points: 5, spa_points: 320 },
        { position: 13, name: "Hạng 13-16", cash_amount: 5625, elo_points: 5, spa_points: 320 },
        { position: 14, name: "Hạng 13-16", cash_amount: 5625, elo_points: 5, spa_points: 320 },
        { position: 15, name: "Hạng 13-16", cash_amount: 5625, elo_points: 5, spa_points: 320 },
        { position: 16, name: "Hạng 13-16", cash_amount: 5625, elo_points: 5, spa_points: 320 }
      ],
      prize_summary: {
        position_1: 400000,
        position_2: 240000,
        position_3: 160000,
        position_4: 80000
      }
    }
  };

  console.log('📋 Tournament data prepared with', Object.keys(tournamentData).length, 'fields');
  console.log('🏆 Prize distribution has', tournamentData.prize_distribution.positions.length, 'positions');

  try {
    // Test INSERT
    console.log('\n🚀 Inserting tournament...');
    const { data: result, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single();

    if (error) {
      console.error('❌ INSERT Error:', error);
      return;
    }

    console.log('✅ Tournament created successfully!');
    console.log('📊 ID:', result.id);
    console.log('📋 Name:', result.name);
    console.log('🏢 Venue:', result.venue_name);
    console.log('🌍 Public:', result.is_public);
    console.log('✋ Requires Approval:', result.requires_approval);
    console.log('🎯 Allow All Ranks:', result.allow_all_ranks);
    console.log('🎖️ Tier Level:', result.tier_level);
    console.log('💰 Prize Pool:', result.prize_pool);
    console.log('🏆 Prize Distribution Positions:', result.prize_distribution?.positions?.length || 'NONE');

    // Verify prize distribution structure
    if (result.prize_distribution && result.prize_distribution.positions) {
      console.log('\n🎯 PRIZE DISTRIBUTION VERIFICATION:');
      console.log('Total Positions:', result.prize_distribution.total_positions);
      console.log('Total Prize Pool:', result.prize_distribution.total_prize_pool);
      console.log('Positions Array Length:', result.prize_distribution.positions.length);
      console.log('First Position:', JSON.stringify(result.prize_distribution.positions[0], null, 2));
      console.log('Prize Summary:', JSON.stringify(result.prize_distribution.prize_summary, null, 2));
    } else {
      console.log('❌ Prize distribution is empty or missing!');
    }

    // Data health check
    const totalFields = Object.keys(tournamentData).length;
    const filledFields = Object.keys(result).filter(key => 
      result[key] !== null && 
      result[key] !== undefined && 
      result[key] !== '' && 
      !(typeof result[key] === 'object' && Object.keys(result[key]).length === 0)
    ).length;
    
    const healthScore = Math.round((filledFields / totalFields) * 100);
    console.log('\n📊 DATA HEALTH SCORE:', healthScore + '%');
    console.log('📋 Fields sent:', totalFields);
    console.log('✅ Fields saved:', filledFields);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('tournaments').delete().eq('id', result.id);
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testTournamentCreation();

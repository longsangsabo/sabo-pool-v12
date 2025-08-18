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
    const basicTournamentData = {
    // ===== THÔNG TIN CƠ BẢN =====
    name: 'Test Tournament ' + new Date().toISOString(),
    description: 'Test tournament for debugging',
    tournament_type: 'single_elimination',
    
    // ===== THÔNG TIN THAM GIA =====
    max_participants: 16,
    current_participants: 0,
    
    // ===== THÔNG TIN TÀI CHÍNH =====
    entry_fee: 0,
    prize_pool: 1000000,
    
    // ===== THÔNG TIN THỜI GIAN =====
    registration_start: new Date().toISOString(),
    registration_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    tournament_start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tournament_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    
    // ===== THÔNG TIN ĐỊA ĐIỂM =====
    location: 'Test Location',
    rules: 'Test rules',
    
    // ===== THÔNG TIN TỔ CHỨC =====
    club_id: null,
    status: 'registration_open',
    is_visible: true,
    
    // ===== TIMESTAMPS =====
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('📋 Tournament data prepared with', Object.keys(basicTournamentData).length, 'fields');
  console.log('🏆 Basic tournament data ready');

  try {
    // Test INSERT
    console.log('\n🚀 Inserting tournament...');
  const { data: result, error } = await supabase
    .from('tournaments')
    .insert([basicTournamentData])
    .select('*')
    .single();    if (error) {
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

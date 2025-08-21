console.log('🔒 Testing RLS Policies and Tournament INSERT Debug...');

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODAwODgsImV4cCI6MjA2ODY1NjA4OH0.-WHrBx32yHJwhqXAYUOdW5fytPvpzc4AFttXBl3MykA';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data matching our debug script
const testTournamentData = {
  name: "RLS Test Tournament",
  description: "Testing RLS policies and data insertion",
  tournament_type: "double_elimination",
  tournament_start: new Date("2025-01-15 10:00:00").toISOString(),
  tournament_end: new Date("2025-01-15 18:00:00").toISOString(),
  max_participants: 16,
  prize_pool: 1000000,
  is_public: true,
  requires_approval: false,
  allow_all_ranks: false,
  eligible_ranks: ["H", "H+", "G", "G+"],
  venue_name: "Test Venue",
  status: "upcoming",
  prize_distribution: {
    total_positions: 16,
    total_prize_pool: 1000000,
    positions: [
      {
        position: 1,
        name: "Vô địch",
        cash_amount: 400000,
        elo_points: 100,
        spa_points: 1500,
        physical_items: [],
        color_theme: "gold",
        is_visible: true,
        is_guaranteed: true
      },
      {
        position: 2,
        name: "Á quân", 
        cash_amount: 240000,
        elo_points: 50,
        spa_points: 1100,
        physical_items: [],
        color_theme: "gold",
        is_visible: true,
        is_guaranteed: true
      }
    ],
    prize_summary: {
      position_1: 400000,
      position_2: 240000,
      total_distributed: 640000
    }
  }
};

async function testTournamentInsertion() {
  try {
    console.log('🎯 Starting tournament insertion test...');
    console.log('📊 Test data size:', JSON.stringify(testTournamentData).length, 'characters');
    
    // Step 1: Test simple insert
    console.log('📝 Step 1: Attempting tournament insert...');
    
    const { data, error } = await supabase
      .from('tournaments')
      .insert(testTournamentData)
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ INSERT Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      // Check if it's RLS related
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('RLS')) {
        console.log('🚨 RLS Policy Issue Detected!');
        return null;
      }
      
      // Check if it's column type related
      if (error.code === '22P02' || error.message.includes('invalid input syntax')) {
        console.log('🚨 Data Type Mismatch Issue Detected!');
        return null;
      }
      
      return null;
    }
    
    if (!data) {
      console.log('⚠️  Insert succeeded but no data returned');
      return null;
    }
    
    console.log('✅ Tournament inserted successfully!');
    console.log('📊 Returned data analysis:');
    
    // Analyze returned data
    const criticalFields = {
      id: data.id,
      name: data.name,
      tournament_type: data.tournament_type,
      max_participants: data.max_participants,
      prize_pool: data.prize_pool,
      is_public: data.is_public,
      requires_approval: data.requires_approval,
      allow_all_ranks: data.allow_all_ranks,
      eligible_ranks: data.eligible_ranks,
      prize_distribution: data.prize_distribution,
      venue_name: data.venue_name,
      status: data.status
    };
    
    console.log('🔍 Critical fields in returned data:');
    Object.keys(criticalFields).forEach(key => {
      const value = criticalFields[key];
      const type = typeof value;
      const isNull = value === null;
      const isEmpty = (type === 'object' && !isNull) ? 
        (Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0) : false;
      
      console.log(`- ${key}: ${type} | null: ${isNull} | empty: ${isEmpty} | value: ${JSON.stringify(value).substring(0, 50)}${JSON.stringify(value).length > 50 ? '...' : ''}`);
    });
    
    // Check prize_distribution specifically
    console.log('🏆 Prize Distribution Analysis:');
    if (data.prize_distribution) {
      const pd = data.prize_distribution;
      console.log('- Has prize_distribution:', !!pd);
      console.log('- Type:', typeof pd);
      console.log('- total_positions:', pd.total_positions);
      console.log('- positions count:', pd.positions ? pd.positions.length : 'N/A');
      console.log('- prize_summary exists:', !!pd.prize_summary);
    } else {
      console.log('- prize_distribution is null/undefined');
    }
    
    // Calculate data health score
    const nullFields = Object.values(criticalFields).filter(v => v === null).length;
    const emptyObjectFields = Object.values(criticalFields).filter(v => 
      typeof v === 'object' && v !== null && 
      (Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0)
    ).length;
    
    const totalFields = Object.keys(criticalFields).length;
    const healthyFields = totalFields - nullFields - emptyObjectFields;
    const healthScore = Math.round((healthyFields / totalFields) * 100);
    
    console.log('📈 Data Health Score:', healthScore + '%');
    console.log('- Total fields:', totalFields);
    console.log('- Healthy fields:', healthyFields);
    console.log('- Null fields:', nullFields);
    console.log('- Empty object fields:', emptyObjectFields);
    
    if (healthScore < 80) {
      console.log('⚠️  Data health is poor - many fields are null/empty');
    } else {
      console.log('✅ Data health is good - most fields populated correctly');
    }
    
    return data;
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return null;
  }
}

// Run the test
testTournamentInsertion()
  .then((result) => {
    if (result) {
      console.log('🎉 Test completed successfully');
    } else {
      console.log('❌ Test failed - check errors above');
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });

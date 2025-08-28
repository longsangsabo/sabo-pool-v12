// Simplified SABO-32 Database Setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function quickSetup() {
  console.log('🎯 Quick SABO-32 setup...');
  
  try {
    // 1. Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('tournament_matches')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // 2. Check table structure
    const { data: firstMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1);
    
    if (firstMatch && firstMatch.length > 0) {
      console.log('📋 Current tournament_matches columns:', Object.keys(firstMatch[0]));
      
      // Check if group_id exists
      if ('group_id' in firstMatch[0]) {
        console.log('✅ group_id column exists');
      } else {
        console.log('❌ group_id column missing - will need to add it');
      }
    }
    
    // 3. Test creating a demo tournament manually
    console.log('🧪 Testing manual tournament creation...');
    
    const demoTournamentId = crypto.randomUUID();
    const clubId = '18f49e79-f402-46d1-90be-889006e9761c';
    
    // Create a few test matches
    const testMatches = [
      {
        id: crypto.randomUUID(),
        tournament_id: demoTournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_winners',
        round_number: 1,
        match_number: 1,
        sabo_match_id: 'A-W1-1',
        status: 'pending',
        player1_name: 'Player A1',
        player2_name: 'Player A2'
      },
      {
        id: crypto.randomUUID(),
        tournament_id: demoTournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_winners',
        round_number: 1,
        match_number: 2,
        sabo_match_id: 'A-W1-2',
        status: 'pending',
        player1_name: 'Player A3',
        player2_name: 'Player A4'
      },
      {
        id: crypto.randomUUID(),
        tournament_id: demoTournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_winners',
        round_number: 1,
        match_number: 1,
        sabo_match_id: 'B-W1-1',
        status: 'pending',
        player1_name: 'Player B1',
        player2_name: 'Player B2'
      }
    ];
    
    const { error: insertError } = await supabase
      .from('tournament_matches')
      .insert(testMatches);
    
    if (insertError) {
      console.error('❌ Manual insert failed:', insertError);
      
      // Try without group_id if it doesn't exist
      const basicMatches = testMatches.map(match => {
        const { group_id, ...rest } = match;
        return rest;
      });
      
      console.log('🔄 Trying without group_id...');
      const { error: basicError } = await supabase
        .from('tournament_matches')
        .insert(basicMatches);
        
      if (basicError) {
        console.error('❌ Basic insert also failed:', basicError);
      } else {
        console.log('✅ Basic matches created successfully (without group_id)');
        console.log(`📋 Demo tournament ID: ${demoTournamentId}`);
      }
    } else {
      console.log('✅ Test matches created successfully with group_id');
      console.log(`📋 Demo tournament ID: ${demoTournamentId}`);
    }
    
    // 4. Verify matches were created
    const { data: createdMatches, error: verifyError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', demoTournamentId);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log(`✅ Verified: ${createdMatches.length} matches created`);
      if (createdMatches.length > 0) {
        console.log('Sample match:', JSON.stringify(createdMatches[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

quickSetup().then(() => {
  console.log('🎉 Quick setup completed!');
});

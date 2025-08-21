// Setup Club and Test SABO-32
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exlqvlbawytbglioqfbc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bHF2bGJhd3l0YmdsaW9xZmJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA4MDA4OCwiZXhwIjoyMDY4NjU2MDg4fQ.8oZlR-lyaDdGZ_mvvyH2wJsJbsD0P6MT9ZkiyASqLcQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupClubAndTest() {
  console.log('🎯 Setting up Club and testing SABO-32...');
  
  try {
    // 1. Check existing clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('club_profiles')
      .select('*')
      .limit(5);
    
    if (clubsError) {
      console.error('❌ Error checking clubs:', clubsError);
      return;
    }
    
    console.log(`📋 Found ${clubs.length} existing clubs`);
    
    let clubId;
    
    if (clubs.length > 0) {
      clubId = clubs[0].id;
      console.log(`✅ Using existing club: ${clubId} (${clubs[0].club_name || 'Unnamed'})`);
    } else {
      // Create a demo club
      const demoClubId = crypto.randomUUID();
      console.log('🏗️ Creating demo club...');
      
      const { data: newClub, error: createClubError } = await supabase
        .from('club_profiles')
        .insert({
          id: demoClubId,
          club_name: 'SABO Demo Club',
          description: 'Demo club for testing SABO-32 tournaments',
          location: 'Demo Location',
          contact_phone: '0123456789',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createClubError) {
        console.error('❌ Error creating club:', createClubError);
        return;
      }
      
      clubId = newClub.id;
      console.log(`✅ Created demo club: ${clubId}`);
    }
    
    // 2. Now test creating tournament matches
    console.log('🧪 Testing SABO-32 tournament creation...');
    
    const demoTournamentId = crypto.randomUUID();
    
    // Create first 8 matches for Group A Round 1
    const groupAMatches = [];
    for (let i = 1; i <= 8; i++) {
      groupAMatches.push({
        id: crypto.randomUUID(),
        tournament_id: demoTournamentId,
        club_id: clubId,
        group_id: 'A',
        bracket_type: 'group_a_winners',
        round_number: 1,
        match_number: i,
        sabo_match_id: `A-W1-${i}`,
        status: 'pending',
        player1_name: `Player A${i * 2 - 1}`,
        player2_name: `Player A${i * 2}`
      });
    }
    
    // Create first 8 matches for Group B Round 1
    const groupBMatches = [];
    for (let i = 1; i <= 8; i++) {
      groupBMatches.push({
        id: crypto.randomUUID(),
        tournament_id: demoTournamentId,
        club_id: clubId,
        group_id: 'B',
        bracket_type: 'group_b_winners',
        round_number: 1,
        match_number: i,
        sabo_match_id: `B-W1-${i}`,
        status: 'pending',
        player1_name: `Player B${i * 2 - 1}`,
        player2_name: `Player B${i * 2}`
      });
    }
    
    // Insert Group A matches
    const { error: insertAError } = await supabase
      .from('tournament_matches')
      .insert(groupAMatches);
    
    if (insertAError) {
      console.error('❌ Error inserting Group A matches:', insertAError);
      return;
    }
    
    console.log(`✅ Created ${groupAMatches.length} Group A matches`);
    
    // Insert Group B matches
    const { error: insertBError } = await supabase
      .from('tournament_matches')
      .insert(groupBMatches);
    
    if (insertBError) {
      console.error('❌ Error inserting Group B matches:', insertBError);
      return;
    }
    
    console.log(`✅ Created ${groupBMatches.length} Group B matches`);
    
    // 3. Verify tournament creation
    const { data: allMatches, error: verifyError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', demoTournamentId)
      .order('group_id, round_number, match_number');
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }
    
    console.log(`✅ Tournament created successfully!`);
    console.log(`📊 Total matches: ${allMatches.length}`);
    console.log(`📋 Demo Tournament ID: ${demoTournamentId}`);
    
    // Group breakdown
    const groupA = allMatches.filter(m => m.group_id === 'A');
    const groupB = allMatches.filter(m => m.group_id === 'B');
    
    console.log(`🔹 Group A: ${groupA.length} matches`);
    console.log(`🔹 Group B: ${groupB.length} matches`);
    
    // Show sample match
    if (allMatches.length > 0) {
      console.log('\n📋 Sample match:');
      console.log(JSON.stringify(allMatches[0], null, 2));
    }
    
    console.log('\n🎯 Next steps:');
    console.log(`1. Open browser: http://localhost:8000/demo-sabo32`);
    console.log(`2. Enter Tournament ID: ${demoTournamentId}`);
    console.log(`3. Click "Refresh" to load the tournament`);
    console.log(`4. Use the tabs to view Group A and Group B`);
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupClubAndTest().then(() => {
  console.log('🎉 Setup completed!');
});

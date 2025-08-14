import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWithExistingTournament() {
  console.log('🧪 Testing with existing double_elimination tournament...\n');
  
  try {
    // Find existing double_elimination tournament
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select('*')
      .eq('tournament_type', 'double_elimination')
      .limit(1);
    
    if (!tournaments || tournaments.length === 0) {
      console.log('❌ No double_elimination tournaments found');
      return;
    }
    
    const tournament = tournaments[0];
    console.log(`✅ Using tournament: ${tournament.name} (${tournament.id})`);
    
    // Check existing matches
    const { data: existingMatches } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournament.id);
    
    console.log(`📋 Existing matches: ${existingMatches?.length || 0}`);
    
    if (!existingMatches || existingMatches.length === 0) {
      console.log('🚀 No matches found, trying to generate bracket...');
      
      // Check participants
      const { data: participants } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournament.id)
        .eq('registration_status', 'confirmed');
        
      console.log(`👥 Confirmed participants: ${participants?.length || 0}`);
      
      if (!participants || participants.length === 0) {
        console.log('📝 Adding test participants...');
        
        // Add 16 test participants
        const testUsers = [];
        for (let i = 1; i <= 16; i++) {
          testUsers.push({
            tournament_id: tournament.id,
            user_id: `test-user-${i.toString().padStart(2, '0')}`,
            registration_status: 'confirmed',
            registration_date: new Date().toISOString()
          });
        }
        
        const { error: regError } = await supabase
          .from('tournament_registrations')
          .insert(testUsers);
          
        if (regError) {
          console.error('❌ Failed to add participants:', regError);
        } else {
          console.log('✅ Added 16 test participants');
        }
      }
      
      // Try to generate bracket
      const { data: result, error: bracketError } = await supabase.rpc(
        'generate_sabo_tournament_bracket',
        { 
          p_tournament_id: tournament.id,
          p_seeding_method: 'registration_order'
        }
      );
      
      if (bracketError) {
        console.error('❌ SABO RPC function failed:', bracketError);
      } else {
        console.log('✅ SABO RPC function succeeded:', result);
        
        // Check created matches
        const { data: newMatches } = await supabase
          .from('tournament_matches')
          .select('*')
          .eq('tournament_id', tournament.id);
          
        console.log(`📋 Matches after generation: ${newMatches?.length || 0}`);
      }
    } else {
      console.log('✅ Tournament already has matches - bracket should display');
      existingMatches.forEach((match, index) => {
        if (index < 5) { // Show first 5 matches
          console.log(`- Match ${match.match_number}: Round ${match.round_number}, ${match.bracket_type || 'N/A'}`);
        }
      });
      if (existingMatches.length > 5) {
        console.log(`... and ${existingMatches.length - 5} more matches`);
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testWithExistingTournament();

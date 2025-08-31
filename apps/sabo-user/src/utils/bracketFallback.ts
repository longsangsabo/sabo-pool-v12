// Emergency fallback bracket generation function
import { getTournamentRegistrations, getProfilesById, clearTournamentMatches, insertTournamentMatches, updateTournament } from '../services/tournamentService';
import { getDisplayName } from '@/types/unified-profile';

export async function generateBracketFallback(tournamentId, generationType = 'elo_based') {
  
  try {
    console.log('🛠️ Starting fallback bracket generation for tournament:', tournamentId);
    
    // 1. Get confirmed participants
    const { data: registrations, error: regError } = await getTournamentRegistrations(tournamentId);
    
    if (regError) {
      throw new Error(`Failed to get registrations: ${regError}`);
    }
    
    const confirmedRegistrations = registrations?.filter(r => r.registration_status === 'confirmed');
    
    if (!confirmedRegistrations || confirmedRegistrations.length < 2) {
      throw new Error('Need at least 2 confirmed participants');
    }
    
    console.log(`👥 Found ${confirmedRegistrations.length} confirmed participants`);
    
    // 2. Get profiles for seeding
    const userIds = confirmedRegistrations.map(r => r.user_id);
    const { data: profiles, error: profileError } = await getProfilesById(userIds);
    
    if (profileError) {
      console.warn('Could not load profiles, using basic seeding:', profileError);
    }
    
    // 3. Combine registration and profile data
    const participants = confirmedRegistrations.map(reg => {
      const profile = profiles?.find(p => p.user_id === reg.user_id);
      return {
        user_id: reg.user_id,
        elo: profile?.elo || 1000,
        full_name: profile ? getDisplayName(profile) : 'Unknown Player',
        created_at: reg.created_at
      };
    });
    
    // 4. Sort participants based on generation type
    let sortedParticipants;
    switch (generationType) {
      case 'elo_based':
        sortedParticipants = participants.sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
        console.log('🏆 Sorted by ELO rating');
        break;
      case 'registration_order':
        sortedParticipants = participants.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        console.log('📅 Sorted by registration order');
        break;
      default:
        sortedParticipants = participants.sort(() => Math.random() - 0.5);
        console.log('🎲 Random seeding');
    }
    
    console.log('🔢 Seeding order:', sortedParticipants.map(p => p.full_name));
    
    // 5. Clear existing matches first
    const { error: deleteError } = await clearTournamentMatches(tournamentId);
    
    if (deleteError) {
      console.warn('Could not clear existing matches:', deleteError);
    }
    
    // 6. Generate first round matches
    const matches = [];
    let matchNumber = 1;
    
    for (let i = 0; i < sortedParticipants.length; i += 2) {
      const player1 = sortedParticipants[i];
      const player2 = sortedParticipants[i + 1];
      
      const match = {
        tournament_id: tournamentId,
        round_number: 1,
        match_number: matchNumber,
        player1_id: player1.user_id,
        player2_id: player2?.user_id || null,
        status: player2 ? 'scheduled' : 'completed',
        winner_id: player2 ? null : player1.user_id, // Auto-win if no opponent (bye)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      matches.push(match);
      matchNumber++;
    }
    
    console.log(`⚡ Generated ${matches.length} first round matches`);
    
    // 7. Insert matches into database
    const { error: insertError } = await insertTournamentMatches(matches);
    
    if (insertError) {
      throw new Error(`Failed to insert matches: ${insertError}`);
    }
    
    // 8. Update tournament status
    const { error: updateError } = await updateTournament(tournamentId, { 
      status: 'in_progress',
      updated_at: new Date().toISOString()
    });
    
    if (updateError) {
      console.warn('Could not update tournament status:', updateError);
    }
    
    console.log('✅ Bracket generation completed successfully!');
    
    return {
      success: true,
      matches_created: matches.length,
      participants: sortedParticipants.length,
      message: `Successfully generated bracket with ${matches.length} matches for ${sortedParticipants.length} participants`
    };
    
  } catch (error) {
    console.error('❌ Fallback bracket generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

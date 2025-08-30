// Emergency fallback bracket generation function
import { supabase } from '@/integrations/supabase/client';
import { getDisplayName } from '@/types/unified-profile';

export async function generateBracketFallback(tournamentId, generationType = 'elo_based') {
  
  try {
    console.log('🛠️ Starting fallback bracket generation for tournament:', tournamentId);
    
    // 1. Get confirmed participants
    const { data: registrations, error: regError } = await supabase
      .from('tournament_registrations')
      .select('user_id, created_at')
      .eq('tournament_id', tournamentId)
      .eq('registration_status', 'confirmed');
    
    if (regError) {
      throw new Error(`Failed to get registrations: ${regError.message}`);
    }
    
    if (!registrations || registrations.length < 2) {
      throw new Error('Need at least 2 confirmed participants');
    }
    
    console.log(`👥 Found ${registrations.length} confirmed participants`);
    
    // 2. Get profiles for seeding
    const userIds = registrations.map(r => r.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, elo, full_name, display_name')
      .in('user_id', userIds);
    
    if (profileError) {
      console.warn('Could not load profiles, using basic seeding:', profileError.message);
    }
    
    // 3. Combine registration and profile data
    const participants = registrations.map(reg => {
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
    const { error: deleteError } = await supabase
      .from('tournament_matches')
      .delete()
      .eq('tournament_id', tournamentId);
    
    if (deleteError) {
      console.warn('Could not clear existing matches:', deleteError.message);
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
    const { error: insertError } = await supabase
      .from('tournament_matches')
      .insert(matches);
    
    if (insertError) {
      throw new Error(`Failed to insert matches: ${insertError.message}`);
    }
    
    // 8. Update tournament status
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId);
    
    if (updateError) {
      console.warn('Could not update tournament status:', updateError.message);
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

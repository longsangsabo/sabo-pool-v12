require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

class TournamentAdvancementSystem {
  constructor(tournamentId) {
    this.tournamentId = tournamentId;
  }

  async autoAdvanceAll() {
    console.log('🚀 Auto Tournament Advancement System\n');
    
    try {
      // Process both groups
      for (const groupId of ['A', 'B']) {
        console.log(`📋 Processing Group ${groupId}:`);
        await this.processGroup(groupId);
        console.log('');
      }
      
      console.log('✅ Auto advancement completed!');
    } catch (error) {
      console.error('❌ System error:', error);
    }
  }

  async processGroup(groupId) {
    // 1. Auto-advance Winners R2 losers to Losers B
    await this.advanceWinnersR2Losers(groupId);
    
    // 2. Auto-advance Losers Round 201 winners to Round 202
    await this.advanceLosersRound201(groupId);
    
    // 3. Auto-populate Group Finals
    await this.populateGroupFinals(groupId);
  }

  async advanceWinnersR2Losers(groupId) {
    console.log(`   🏆→💀 Winners R2 losers to Losers B...`);
    
    // Get completed Winners R2
    const { data: winnersR2 } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
      .eq('round_number', 2)
      .eq('status', 'completed')
      .not('winner_id', 'is', null);

    if (!winnersR2 || winnersR2.length === 0) {
      console.log(`     ⏳ No completed Winners R2 yet`);
      return;
    }

    // Get losers
    const losers = winnersR2.map(match => 
      match.player1_id === match.winner_id ? match.player2_id : match.player1_id
    );

    console.log(`     Found ${losers.length} losers to advance`);

    // Get Losers B Round 201 matches
    const { data: losersB201 } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
      .eq('round_number', 201)
      .order('match_number');

    // Distribute losers (2 per match)
    for (let i = 0; i < Math.min(losersB201.length, Math.ceil(losers.length / 2)); i++) {
      const match = losersB201[i];
      const loser1 = losers[i * 2];
      const loser2 = losers[i * 2 + 1];

      if (loser1 && loser2 && !match.player1_id && !match.player2_id) {
        await supabase
          .from('sabo32_matches')
          .update({ 
            player1_id: loser1,
            player2_id: loser2,
            status: 'pending'
          })
          .eq('id', match.id);

        console.log(`     ✅ ${match.sabo_match_id}: Advanced 2 losers`);
      }
    }
  }

  async advanceLosersRound201(groupId) {
    console.log(`   💀 Losers R201 winners to R202...`);
    
    // Get completed Round 201
    const { data: round201 } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
      .eq('round_number', 201)
      .eq('status', 'completed')
      .not('winner_id', 'is', null);

    if (!round201 || round201.length < 2) {
      console.log(`     ⏳ Round 201 not completed yet (${round201?.length || 0}/2)`);
      return;
    }

    const winners = round201.map(match => match.winner_id);
    console.log(`     Found ${winners.length} winners to advance`);

    // Get Round 202 match
    const { data: round202 } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
      .eq('round_number', 202)
      .limit(1);

    if (round202 && round202.length > 0 && !round202[0].player1_id) {
      await supabase
        .from('sabo32_matches')
        .update({ 
          player1_id: winners[0],
          player2_id: winners[1],
          status: 'pending'
        })
        .eq('id', round202[0].id);

      console.log(`     ✅ ${round202[0].sabo_match_id}: Advanced 2 winners`);
    }
  }

  async populateGroupFinals(groupId) {
    console.log(`   🏆 Group Finals population...`);
    
    // Check if all sources are ready
    const sources = await this.getGroupFinalSources(groupId);
    
    if (sources.length < 4) {
      console.log(`     ⏳ Not ready yet (${sources.length}/4 players)`);
      return;
    }

    console.log(`     Found 4 players ready for finals`);

    // Get/Create Group Final matches
    let { data: finalMatches } = await supabase
      .from('sabo32_matches')
      .select('*')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_final`)
      .order('match_number');

    // Create second match if needed
    if (finalMatches.length === 1) {
      await supabase
        .from('sabo32_matches')
        .insert({
          tournament_id: this.tournamentId,
          group_id: groupId,
          bracket_type: `group_${groupId.toLowerCase()}_final`,
          round_number: 250,
          match_number: 2,
          sabo_match_id: `${groupId}-FINAL2`,
          status: 'pending'
        });

      // Refresh
      const { data: refreshed } = await supabase
        .from('sabo32_matches')
        .select('*')
        .eq('tournament_id', this.tournamentId)
        .eq('group_id', groupId)
        .eq('bracket_type', `group_${groupId.toLowerCase()}_final`)
        .order('match_number');
      
      finalMatches = refreshed;
    }

    // Populate matches
    if (finalMatches.length >= 2) {
      // Match 1: Winner1 vs LoserA
      if (!finalMatches[0].player1_id) {
        await supabase
          .from('sabo32_matches')
          .update({
            player1_id: sources[0], // Winner1
            player2_id: sources[2], // LoserA
            status: 'pending'
          })
          .eq('id', finalMatches[0].id);
        console.log(`     ✅ ${finalMatches[0].sabo_match_id}: Winner1 vs LoserA`);
      }

      // Match 2: Winner2 vs LoserB
      if (!finalMatches[1].player1_id) {
        await supabase
          .from('sabo32_matches')
          .update({
            player1_id: sources[1], // Winner2
            player2_id: sources[3], // LoserB
            status: 'pending'
          })
          .eq('id', finalMatches[1].id);
        console.log(`     ✅ ${finalMatches[1].sabo_match_id}: Winner2 vs LoserB`);
      }
    }
  }

  async getGroupFinalSources(groupId) {
    const sources = [];

    // Winners R3 (2 players)
    const { data: winnersR3 } = await supabase
      .from('sabo32_matches')
      .select('winner_id')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_winners`)
      .eq('round_number', 3)
      .eq('status', 'completed')
      .not('winner_id', 'is', null)
      .order('match_number');

    sources.push(...(winnersR3?.map(m => m.winner_id) || []));

    // Losers A final (1 player)
    const { data: losersA } = await supabase
      .from('sabo32_matches')
      .select('winner_id')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_a`)
      .eq('round_number', 103)
      .eq('status', 'completed')
      .not('winner_id', 'is', null);

    sources.push(...(losersA?.map(m => m.winner_id) || []));

    // Losers B final (1 player)
    const { data: losersB } = await supabase
      .from('sabo32_matches')
      .select('winner_id')
      .eq('tournament_id', this.tournamentId)
      .eq('group_id', groupId)
      .eq('bracket_type', `group_${groupId.toLowerCase()}_losers_b`)
      .eq('round_number', 202)
      .eq('status', 'completed')
      .not('winner_id', 'is', null);

    sources.push(...(losersB?.map(m => m.winner_id) || []));

    return sources;
  }
}

// Create and run system
const system = new TournamentAdvancementSystem('7aba5a78-5c2b-4884-937d-99274220b019');
system.autoAdvanceAll();

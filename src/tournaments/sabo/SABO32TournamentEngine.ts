// =============================================
// SABO 32 TOURNAMENT ENGINE
// Manages Double Elimination tournament for 32 players
// =============================================

import { SABO_32_STRUCTURE, SABO_32_BRACKET_TYPES, SABO32Match, SABO32Seeding, SABO32CrossBracket } from './SABO32Structure';
import { SABOLogicCore } from './SABOLogicCore'; // Reuse existing 16-player logic

export class SABO32TournamentEngine {
  
  /**
   * Create full tournament structure for 32 players
   */
  static async createTournament(
    tournamentId: string,
    players: string[]
  ): Promise<SABO32Match[]> {
    
    if (players.length !== 32) {
      throw new Error('Exactly 32 players required for SABO-32 tournament');
    }
    
    console.log('🎯 Creating SABO-32 tournament with 2 groups');
    
    // Step 1: Random seeding into 2 groups
    const { groupA, groupB } = SABO32Seeding.randomSeed(players);
    
    console.log('📊 Groups created:', {
      groupA: groupA.length,
      groupB: groupB.length
    });
    
    // Step 2: Generate matches for both groups
    const groupAMatches = this.createGroupMatches(groupA, 'A', tournamentId);
    const groupBMatches = this.createGroupMatches(groupB, 'B', tournamentId);
    
    // Step 3: Create placeholder cross-bracket matches
    const crossBracketMatches = this.createPlaceholderCrossBracket(tournamentId);
    
    const allMatches = [
      ...groupAMatches,
      ...groupBMatches, 
      ...crossBracketMatches
    ];
    
    console.log('✅ SABO-32 tournament created:', {
      totalMatches: allMatches.length,
      groupA: groupAMatches.length,
      groupB: groupBMatches.length,
      crossBracket: crossBracketMatches.length
    });
    
    return allMatches;
  }
  
  /**
   * Create all matches for one group (16 players)
   * Reuses SABO-16 logic with group prefix
   */
  private static createGroupMatches(
    groupPlayers: string[],
    groupId: 'A' | 'B', 
    tournamentId: string
  ): SABO32Match[] {
    
    const matches: SABO32Match[] = [];
    let matchCounter = 1;
    
    // Winners Bracket (14 matches)
    const winnersMatches = this.createWinnersBracket(groupPlayers, groupId, tournamentId, matchCounter);
    matches.push(...winnersMatches);
    matchCounter += winnersMatches.length;
    
    // Losers Branch A (7 matches) 
    const losersAMatches = this.createLosersBranchA(groupId, tournamentId, matchCounter);
    matches.push(...losersAMatches);
    matchCounter += losersAMatches.length;
    
    // Losers Branch B (3 matches)
    const losersBMatches = this.createLosersBranchB(groupId, tournamentId, matchCounter);
    matches.push(...losersBMatches);
    matchCounter += losersBMatches.length;
    
    // Group Finals (2 matches) - determines 2 winners
    const groupFinals = this.createGroupFinals(groupId, tournamentId, matchCounter);
    matches.push(...groupFinals);
    
    return matches;
  }
  
  /**
   * Create Winners Bracket for one group
   */
  private static createWinnersBracket(
    players: string[],
    groupId: 'A' | 'B',
    tournamentId: string,
    startCounter: number
  ): SABO32Match[] {
    
    const bracketType = groupId === 'A' ? 
      SABO_32_BRACKET_TYPES.GROUP_A_WINNERS : 
      SABO_32_BRACKET_TYPES.GROUP_B_WINNERS;
    
    const matches: SABO32Match[] = [];
    let counter = startCounter;
    
    // Round 1: 8 matches (16 → 8)
    for (let i = 0; i < 8; i++) {
      matches.push({
        id: `${tournamentId}-${groupId}-W1-${i + 1}`,
        tournament_id: tournamentId,
        group_id: groupId,
        bracket_type: bracketType,
        round_number: 1,
        match_number: i + 1,
        sabo_match_id: `${groupId}-W1M${i + 1}`,
        player1_id: players[i * 2],
        player2_id: players[i * 2 + 1],
        status: 'ready'
      } as SABO32Match);
    }
    
    // Round 2: 4 matches (8 → 4)
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: `${tournamentId}-${groupId}-W2-${i + 1}`,
        tournament_id: tournamentId,
        group_id: groupId,
        bracket_type: bracketType,
        round_number: 2,
        match_number: i + 1,
        sabo_match_id: `${groupId}-W2M${i + 1}`,
        status: 'pending'
      } as SABO32Match);
    }
    
    // Round 3: 2 matches (4 → 2)
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: `${tournamentId}-${groupId}-W3-${i + 1}`,
        tournament_id: tournamentId,
        group_id: groupId,
        bracket_type: bracketType,
        round_number: 3,
        match_number: i + 1,
        sabo_match_id: `${groupId}-W3M${i + 1}`,
        status: 'pending'
      } as SABO32Match);
    }
    
    return matches;
  }
  
  /**
   * Create Losers Branch A for one group
   */
  private static createLosersBranchA(
    groupId: 'A' | 'B',
    tournamentId: string,
    startCounter: number
  ): SABO32Match[] {
    
    const bracketType = groupId === 'A' ? 
      SABO_32_BRACKET_TYPES.GROUP_A_LOSERS_A : 
      SABO_32_BRACKET_TYPES.GROUP_B_LOSERS_A;
    
    const matches: SABO32Match[] = [];
    
    // Similar to SABO-16 losers bracket logic
    // Round 101: 4 matches, Round 102: 2 matches, Round 103: 1 match
    
    for (let round = 101; round <= 103; round++) {
      const matchCount = round === 101 ? 4 : round === 102 ? 2 : 1;
      
      for (let i = 0; i < matchCount; i++) {
        matches.push({
          id: `${tournamentId}-${groupId}-LA${round}-${i + 1}`,
          tournament_id: tournamentId,
          group_id: groupId,
          bracket_type: bracketType,
          round_number: round,
          match_number: i + 1,
          sabo_match_id: `${groupId}-LA${round}M${i + 1}`,
          status: 'pending'
        } as SABO32Match);
      }
    }
    
    return matches;
  }
  
  /**
   * Create Losers Branch B for one group
   */
  private static createLosersBranchB(
    groupId: 'A' | 'B',
    tournamentId: string,
    startCounter: number
  ): SABO32Match[] {
    
    const bracketType = groupId === 'A' ? 
      SABO_32_BRACKET_TYPES.GROUP_A_LOSERS_B : 
      SABO_32_BRACKET_TYPES.GROUP_B_LOSERS_B;
    
    const matches: SABO32Match[] = [];
    
    // Round 201: 2 matches, Round 202: 1 match
    for (let round = 201; round <= 202; round++) {
      const matchCount = round === 201 ? 2 : 1;
      
      for (let i = 0; i < matchCount; i++) {
        matches.push({
          id: `${tournamentId}-${groupId}-LB${round}-${i + 1}`,
          tournament_id: tournamentId,
          group_id: groupId,
          bracket_type: bracketType,
          round_number: round,
          match_number: i + 1,
          sabo_match_id: `${groupId}-LB${round}M${i + 1}`,
          status: 'pending'
        } as SABO32Match);
      }
    }
    
    return matches;
  }
  
  /**
   * Create Group Finals matches (2 matches - determines 2 winners)
   */
  private static createGroupFinals(
    groupId: 'A' | 'B',
    tournamentId: string,
    counter: number
  ): SABO32Match[] {
    
    const bracketType = groupId === 'A' ? 
      SABO_32_BRACKET_TYPES.GROUP_A_FINAL : 
      SABO_32_BRACKET_TYPES.GROUP_B_FINAL;
    
    return [
      // Match 1: Winner Winners Bracket vs Winner Losers Branch A
      {
        id: `${tournamentId}-${groupId}-FINAL1`,
        tournament_id: tournamentId,
        group_id: groupId,
        bracket_type: bracketType,
        round_number: 250,
        match_number: 1,
        sabo_match_id: `${groupId}-FINAL1`,
        status: 'pending',
        qualifies_as: 'group_winner_1'
      },
      
      // Match 2: Winner Winners Bracket vs Winner Losers Branch B
      {
        id: `${tournamentId}-${groupId}-FINAL2`,
        tournament_id: tournamentId,
        group_id: groupId,
        bracket_type: bracketType,
        round_number: 251,
        match_number: 2,
        sabo_match_id: `${groupId}-FINAL2`,
        status: 'pending',
        qualifies_as: 'group_winner_2'
      }
    ] as SABO32Match[];
  }
  
  /**
   * Create placeholder cross-bracket matches
   */
  private static createPlaceholderCrossBracket(tournamentId: string): SABO32Match[] {
    return [
      // Semifinal 1: Winner1 A vs Winner1 B
      {
        id: `${tournamentId}-SF1`,
        tournament_id: tournamentId,
        group_id: null,
        bracket_type: SABO_32_BRACKET_TYPES.CROSS_SEMIFINALS,
        round_number: 350,
        match_number: 1,
        sabo_match_id: 'SF1',
        status: 'pending'
      },
      
      // Semifinal 2: Winner2 A vs Winner2 B
      {
        id: `${tournamentId}-SF2`,
        tournament_id: tournamentId,
        group_id: null,
        bracket_type: SABO_32_BRACKET_TYPES.CROSS_SEMIFINALS,
        round_number: 350,
        match_number: 2,
        sabo_match_id: 'SF2',
        status: 'pending'
      },
      
      // Final
      {
        id: `${tournamentId}-FINAL`,
        tournament_id: tournamentId,
        group_id: null,
        bracket_type: SABO_32_BRACKET_TYPES.CROSS_FINAL,
        round_number: 400,
        match_number: 1,
        sabo_match_id: 'FINAL',
        status: 'pending'
      }
    ] as SABO32Match[];
  }
  
  /**
   * Handle group completion and cross-bracket population
   */
  static handleGroupCompletion(
    groupId: 'A' | 'B',
    groupWinners: { winner1: string; winner2: string },
    tournamentId: string
  ): void {
    console.log(`🏆 Group ${groupId} completed:`, {
      winner1: groupWinners.winner1,
      winner2: groupWinners.winner2
    });
    
    // This will trigger cross-bracket population
    // Implementation will update the placeholder semifinal matches
  }
}

export default SABO32TournamentEngine;

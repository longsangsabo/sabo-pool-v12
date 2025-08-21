// =============================================
// SABO DOUBLE ELIMINATION 32 - TWO GROUP STRUCTURE
// Design for 32 players split into 2 groups of 16
// =============================================

export const SABO_32_STRUCTURE = {
  TOTAL_PLAYERS: 32,
  GROUPS: {
    A: {
      players: 16,
      winners_bracket: {
        rounds: [1, 2, 3], // 3 rounds
        matches: [8, 4, 2], // matches per round
        total: 14
      },
      losers_branch_a: {
        rounds: [101, 102, 103],
        matches: [4, 2, 1], 
        total: 7
      },
      losers_branch_b: {
        rounds: [201, 202],
        matches: [2, 1],
        total: 3
      },
      semifinals: {
        rounds: [250], // Group A Final
        matches: [1],
        total: 1,
        qualifiers: 2 // Top 2 to cross-bracket
      },
      total_matches: 25 // 14 + 7 + 3 + 1
    },
    B: {
      players: 16,
      winners_bracket: {
        rounds: [1, 2, 3],
        matches: [8, 4, 2],
        total: 14
      },
      losers_branch_a: {
        rounds: [101, 102, 103],
        matches: [4, 2, 1],
        total: 7
      },
      losers_branch_b: {
        rounds: [201, 202], 
        matches: [2, 1],
        total: 3
      },
      semifinals: {
        rounds: [250], // Group B Final
        matches: [1],
        total: 1,
        qualifiers: 2 // Top 2 to cross-bracket
      },
      total_matches: 25 // 14 + 7 + 3 + 1
    }
  },
  CROSS_BRACKET: {
    semifinals: {
      rounds: [350], // Cross-bracket semifinals
      matches: [2], // SF1, SF2
      total: 2,
      bracket_rules: {
        SF1: 'Winner A vs Loser B',
        SF2: 'Winner B vs Loser A'
      }
    },
    finals: {
      rounds: [400],
      matches: [1], // Final
      total: 1
    },
    total_matches: 3
  },
  TOTAL_MATCHES: 53 // 25 + 25 + 3
} as const;

export const SABO_32_BRACKET_TYPES = {
  // Group A
  GROUP_A_WINNERS: 'group_a_winners',
  GROUP_A_LOSERS_A: 'group_a_losers_a', 
  GROUP_A_LOSERS_B: 'group_a_losers_b',
  GROUP_A_FINAL: 'group_a_final',
  
  // Group B  
  GROUP_B_WINNERS: 'group_b_winners',
  GROUP_B_LOSERS_A: 'group_b_losers_a',
  GROUP_B_LOSERS_B: 'group_b_losers_b', 
  GROUP_B_FINAL: 'group_b_final',
  
  // Cross-bracket
  CROSS_SEMIFINALS: 'cross_semifinals',
  CROSS_FINAL: 'cross_final'
} as const;

export interface SABO32Match {
  id: string;
  tournament_id: string;
  group_id: 'A' | 'B' | null; // null for cross-bracket
  bracket_type: keyof typeof SABO_32_BRACKET_TYPES;
  round_number: number;
  match_number: number;
  sabo_match_id: string;
  
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  loser_id?: string;
  
  score_player1?: number;
  score_player2?: number;
  status: 'pending' | 'ready' | 'completed';
  
  // Advancement tracking
  advances_to_match_id?: string;
  feeds_loser_to_match_id?: string;
  
  // Qualification tracking for cross-bracket
  qualifies_as?: 'group_winner' | 'group_runner_up' | null;
}

// Seeding logic for random distribution
export class SABO32Seeding {
  static randomSeed(players: string[]): {
    groupA: string[];
    groupB: string[];
  } {
    if (players.length !== 32) {
      throw new Error('Exactly 32 players required');
    }
    
    // Shuffle players randomly
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    
    return {
      groupA: shuffled.slice(0, 16),
      groupB: shuffled.slice(16, 32)
    };
  }
  
  static generateGroupMatches(
    groupPlayers: string[], 
    groupId: 'A' | 'B',
    tournamentId: string
  ): SABO32Match[] {
    // Use existing SABO-16 logic but with group prefix
    // This will generate all 25 matches for one group
    return []; // Implementation will reuse SABO-16 logic
  }
}

// Cross-bracket advancement logic
export class SABO32CrossBracket {
  static createCrossBracketMatches(
    groupAQualifiers: { winner: string; runnerUp: string },
    groupBQualifiers: { winner: string; runnerUp: string },
    tournamentId: string
  ): SABO32Match[] {
    return [
      // Semifinal 1: Winner A vs Loser B
      {
        id: `sf1-${tournamentId}`,
        tournament_id: tournamentId,
        group_id: null,
        bracket_type: 'CROSS_SEMIFINALS',
        round_number: 350,
        match_number: 1,
        sabo_match_id: 'SF1',
        player1_id: groupAQualifiers.winner,
        player2_id: groupBQualifiers.runnerUp,
        status: 'ready',
        advances_to_match_id: `final-${tournamentId}`
      },
      
      // Semifinal 2: Winner B vs Loser A  
      {
        id: `sf2-${tournamentId}`,
        tournament_id: tournamentId,
        group_id: null,
        bracket_type: 'CROSS_SEMIFINALS', 
        round_number: 350,
        match_number: 2,
        sabo_match_id: 'SF2',
        player1_id: groupBQualifiers.winner,
        player2_id: groupAQualifiers.runnerUp,
        status: 'ready',
        advances_to_match_id: `final-${tournamentId}`
      },
      
      // Final
      {
        id: `final-${tournamentId}`,
        tournament_id: tournamentId,
        group_id: null,
        bracket_type: 'CROSS_FINAL',
        round_number: 400, 
        match_number: 1,
        sabo_match_id: 'FINAL',
        status: 'pending' // Will be populated after semifinals
      }
    ] as SABO32Match[];
  }
}

export default SABO_32_STRUCTURE;

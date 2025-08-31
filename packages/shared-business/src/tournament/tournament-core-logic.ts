/**
 * SABO Pool Arena - Tournament Core Logic Service
 * Phase 4: Priority 1 - Tournament Logic Consolidation
 * 
 * Consolidated tournament business logic extracted from:
 * - SABO tournament structure management (27 matches)
 * - Bracket progression and advancement logic
 * - Tournament validation and integrity checks
 * - Progress tracking and stage analysis
 * - Match positioning and advancement calculations
 * 
 * This service handles all core tournament operations:
 * - Tournament structure organization and validation
 * - Bracket progression and match advancement
 * - Tournament progress tracking and analytics
 * - Match positioning and round completion
 * - Semifinal and final bracket management
 */

export interface TournamentMatch {
  id: string;
  round_number: number;
  match_number: number;
  bracket_type: 'winners' | 'losers' | 'semifinals' | 'finals';
  branch_type?: 'A' | 'B';
  player1_id?: string;
  player2_id?: string;
  winner_id?: string;
  status: 'pending' | 'ready' | 'completed';
  tournament_id: string;
  score_player1?: number;
  score_player2?: number;
  // Legacy support for old field names
  player1_score?: number;
  player2_score?: number;
  player1?: {
    user_id: string;
    full_name: string;
    display_name: string;
    avatar_url: string | null;
    verified_rank: string | null;
  } | null;
  player2?: {
    user_id: string;
    full_name: string;
    display_name: string;
    avatar_url: string | null;
    verified_rank: string | null;
  } | null;
}

export interface OrganizedMatches {
  winners: TournamentMatch[];
  losers_branch_a: TournamentMatch[];
  losers_branch_b: TournamentMatch[];
  semifinals: TournamentMatch[];
  final: TournamentMatch[];
}

export interface AdvancementTarget {
  round: number | null;
  position?: 'player1' | 'player2';
  eliminated?: boolean;
}

export interface TournamentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TournamentProgress {
  totalMatches: number;
  completedMatches: number;
  progressPercentage: number;
  currentStage: string;
  nextActions: string[];
  stageBreakdown: {
    winners: { completed: number; total: number };
    losersA: { completed: number; total: number };
    losersB: { completed: number; total: number };
    semifinals: { completed: number; total: number };
    final: { completed: number; total: number };
  };
}

export interface SemifinalConfiguration {
  match1: string[];
  match2: string[];
  totalParticipants: number;
}

export interface TournamentStructure {
  WINNERS: {
    rounds: number[];
    matches: number[];
    total: number;
    stops_at: string;
  };
  LOSERS_BRANCH_A: {
    rounds: number[];
    matches: number[];
    total: number;
    input_source: string;
  };
  LOSERS_BRANCH_B: {
    rounds: number[];
    matches: number[];
    total: number;
    input_source: string;
  };
  FINALS: {
    rounds: number[];
    matches: number[];
    total: number;
    participants: string;
  };
}

/**
 * Tournament Core Logic Service
 * Handles all tournament structure management and progression logic
 */
export class TournamentCoreLogicService {
  /**
   * SABO Tournament Structure Configuration
   * Defines the standard SABO-16 tournament format (27 matches total)
   */
  public static readonly TOURNAMENT_STRUCTURE: TournamentStructure = {
    WINNERS: {
      rounds: [1, 2, 3], // NO Round 4 - stops at 2 finalists
      matches: [8, 4, 2], // matches per round
      total: 14,
      stops_at: 'two_finalists',
    },
    LOSERS_BRANCH_A: {
      rounds: [101, 102, 103],
      matches: [4, 2, 1],
      total: 7,
      input_source: 'winners_round_1_losers', // 8 losers from WB R1
    },
    LOSERS_BRANCH_B: {
      rounds: [201, 202],
      matches: [2, 1],
      total: 3,
      input_source: 'winners_round_2_losers', // 4 losers from WB R2
    },
    FINALS: {
      rounds: [250, 300], // Semifinal (4→2), Final (2→1)
      matches: [2, 1],
      total: 3,
      participants: '2_WB + 1_LA + 1_LB = 4_people',
    },
  };

  /**
   * Tournament round constants for easy reference
   */
  public static readonly TOURNAMENT_ROUNDS = {
    WINNERS: [1, 2, 3],
    LOSERS_A: [101, 102, 103],
    LOSERS_B: [201, 202],
    SEMIFINALS: 250,
    FINAL: 300,
  };

  /**
   * Total matches in a standard SABO-16 tournament
   */
  public static readonly TOTAL_MATCHES = 27;

  /**
   * Organize tournament matches according to SABO structure
   * 
   * @param matches - Array of tournament matches
   * @returns Organized matches by bracket type
   */
  static organizeMatches(matches: TournamentMatch[]): OrganizedMatches {
    return {
      winners: matches.filter(m => [1, 2, 3].includes(m.round_number)),
      losers_branch_a: matches.filter(m =>
        [101, 102, 103].includes(m.round_number)
      ),
      losers_branch_b: matches.filter(m => [201, 202].includes(m.round_number)),
      semifinals: matches.filter(m => m.round_number === 250),
      final: matches.filter(m => m.round_number === 300),
    };
  }

  /**
   * Get bracket type from round number
   * 
   * @param round - Round number
   * @returns Bracket type classification
   */
  static getBracketType(
    round: number
  ): 'winners' | 'losers_a' | 'losers_b' | 'semifinals' | 'final' {
    if ([1, 2, 3].includes(round)) return 'winners';
    if ([101, 102, 103].includes(round)) return 'losers_a';
    if ([201, 202].includes(round)) return 'losers_b';
    if (round === 250) return 'semifinals';
    if (round === 300) return 'final';
    throw new Error(`Invalid SABO round: ${round}`);
  }

  /**
   * Get advancement target for winners and losers
   * Core tournament progression logic
   * 
   * @param fromRound - Starting round number
   * @param isWinner - Whether player won or lost the match
   * @returns Target round and position for advancement
   */
  static getAdvancementTarget(
    fromRound: number,
    isWinner: boolean
  ): AdvancementTarget {
    // Winners Bracket advancement
    if (isWinner) {
      if (fromRound === 1) return { round: 2 }; // WB R1 → WB R2
      if (fromRound === 2) return { round: 3 }; // WB R2 → WB R3
      if (fromRound === 3) return { round: 250 }; // WB R3 → Semifinal

      // Losers Branch advancement
      if (fromRound === 101) return { round: 102 }; // LA R1 → LA R2
      if (fromRound === 102) return { round: 103 }; // LA R2 → LA R3
      if (fromRound === 103) return { round: 250 }; // LA R3 → Semifinal
      if (fromRound === 201) return { round: 202 }; // LB R1 → LB R2
      if (fromRound === 202) return { round: 250 }; // LB R2 → Semifinal
      if (fromRound === 250) return { round: 300 }; // Semifinal → Final
    }

    // Losers assignment from Winners Bracket
    if (!isWinner) {
      if (fromRound === 1) return { round: 101 }; // WB R1 losers → Branch A
      if (fromRound === 2) return { round: 201 }; // WB R2 losers → Branch B
      if (fromRound === 3) return { round: null, eliminated: true }; // WB R3 loser eliminated (semifinal loser)
    }

    return { round: null, eliminated: true }; // eliminated
  }

  /**
   * Calculate advancement position based on match number
   * Determines if winner goes to player1 or player2 slot in next match
   * 
   * @param fromMatchNumber - Source match number
   * @param fromRound - Source round number
   * @returns Position in next match
   */
  static calculateAdvancementPosition(
    fromMatchNumber: number,
    fromRound: number
  ): 'player1' | 'player2' {
    // For most brackets, odd matches go to player1, even to player2
    return fromMatchNumber % 2 === 1 ? 'player1' : 'player2';
  }

  /**
   * Validate if tournament follows SABO structure
   * Comprehensive tournament integrity checking
   * 
   * @param matches - Array of tournament matches
   * @returns Validation result with errors and warnings
   */
  static validateTournamentStructure(matches: TournamentMatch[]): TournamentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const organized = this.organizeMatches(matches);

    // Check total matches
    const totalMatches = matches.length;
    if (totalMatches !== this.TOTAL_MATCHES) {
      errors.push(`Expected ${this.TOTAL_MATCHES} matches, found ${totalMatches}`);
    }

    // Check Winners Bracket (14 matches, 3 rounds)
    if (organized.winners.length !== this.TOURNAMENT_STRUCTURE.WINNERS.total) {
      errors.push(
        `Winners bracket should have ${this.TOURNAMENT_STRUCTURE.WINNERS.total} matches, found ${organized.winners.length}`
      );
    }

    // Check Losers Branch A (7 matches, 3 rounds)
    if (organized.losers_branch_a.length !== this.TOURNAMENT_STRUCTURE.LOSERS_BRANCH_A.total) {
      errors.push(
        `Losers Branch A should have ${this.TOURNAMENT_STRUCTURE.LOSERS_BRANCH_A.total} matches, found ${organized.losers_branch_a.length}`
      );
    }

    // Check Losers Branch B (3 matches, 2 rounds)
    if (organized.losers_branch_b.length !== this.TOURNAMENT_STRUCTURE.LOSERS_BRANCH_B.total) {
      errors.push(
        `Losers Branch B should have ${this.TOURNAMENT_STRUCTURE.LOSERS_BRANCH_B.total} matches, found ${organized.losers_branch_b.length}`
      );
    }

    // Check Finals (3 matches total: 2 semifinal + 1 final)
    const finalsTotal = organized.semifinals.length + organized.final.length;
    if (finalsTotal !== this.TOURNAMENT_STRUCTURE.FINALS.total) {
      errors.push(
        `Finals should have ${this.TOURNAMENT_STRUCTURE.FINALS.total} matches (2 semifinal + 1 final), found ${finalsTotal}`
      );
    }

    // Advanced validation checks
    this.validateRoundStructure(organized, errors, warnings);
    this.validateMatchNumbering(matches, errors, warnings);
    this.validatePlayerAssignments(matches, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get tournament progress with detailed stage analysis
   * 
   * @param matches - Array of tournament matches
   * @returns Comprehensive progress report
   */
  static getTournamentProgress(matches: TournamentMatch[]): TournamentProgress {
    const totalMatches = this.TOTAL_MATCHES;
    const completedMatches = matches.filter(
      m => m.status === 'completed'
    ).length;
    const progressPercentage = Math.round(
      (completedMatches / totalMatches) * 100
    );

    const organized = this.organizeMatches(matches);
    let currentStage = 'Starting';
    const nextActions: string[] = [];

    // Calculate stage breakdown
    const stageBreakdown = {
      winners: {
        completed: organized.winners.filter(m => m.status === 'completed').length,
        total: organized.winners.length
      },
      losersA: {
        completed: organized.losers_branch_a.filter(m => m.status === 'completed').length,
        total: organized.losers_branch_a.length
      },
      losersB: {
        completed: organized.losers_branch_b.filter(m => m.status === 'completed').length,
        total: organized.losers_branch_b.length
      },
      semifinals: {
        completed: organized.semifinals.filter(m => m.status === 'completed').length,
        total: organized.semifinals.length
      },
      final: {
        completed: organized.final.filter(m => m.status === 'completed').length,
        total: organized.final.length
      }
    };

    // Enhanced stage determination
    if (stageBreakdown.final.completed === stageBreakdown.final.total) {
      currentStage = 'Tournament Complete';
    } else if (stageBreakdown.semifinals.completed === stageBreakdown.semifinals.total) {
      currentStage = 'Grand Final';
      nextActions.push('Complete the Grand Final');
    } else if (
      stageBreakdown.winners.completed === stageBreakdown.winners.total &&
      stageBreakdown.losersA.completed === stageBreakdown.losersA.total &&
      stageBreakdown.losersB.completed === stageBreakdown.losersB.total
    ) {
      currentStage = 'Semifinals Ready';
      nextActions.push('Start Semifinals (4 finalists)');
    } else if (stageBreakdown.winners.completed === stageBreakdown.winners.total) {
      currentStage = 'Losers Brackets Active';
      if (stageBreakdown.losersA.completed < stageBreakdown.losersA.total) {
        nextActions.push('Complete Losers Branch A');
      }
      if (stageBreakdown.losersB.completed < stageBreakdown.losersB.total) {
        nextActions.push('Complete Losers Branch B');
      }
    } else {
      currentStage = 'Winners Bracket Active';
      nextActions.push('Complete Winners Bracket matches');
    }

    return {
      totalMatches,
      completedMatches,
      progressPercentage,
      currentStage,
      nextActions,
      stageBreakdown,
    };
  }

  /**
   * Get semifinal setup configuration
   * Defines how 4 finalists are arranged into 2 semifinal matches
   * 
   * @returns Semifinal match configuration
   */
  static getSemifinalConfiguration(): SemifinalConfiguration {
    return {
      match1: ['WB_finalist_1', 'LB_A_finalist'], // Match 1: WB winner vs Losers A winner
      match2: ['WB_finalist_2', 'LB_B_finalist'], // Match 2: WB runner-up vs Losers B winner
      totalParticipants: 4,
    };
  }

  /**
   * Check if specific round is complete
   * 
   * @param matches - Array of tournament matches
   * @param round - Round number to check
   * @returns True if all matches in round are completed
   */
  static isRoundComplete(matches: TournamentMatch[], round: number): boolean {
    const roundMatches = matches.filter(m => m.round_number === round);
    return roundMatches.every(m => m.status === 'completed' && m.winner_id);
  }

  /**
   * Get next available matches that can be played
   * 
   * @param matches - Array of tournament matches
   * @returns Array of matches ready to be played
   */
  static getReadyMatches(matches: TournamentMatch[]): TournamentMatch[] {
    return matches.filter(m => 
      m.status === 'ready' && 
      m.player1_id && 
      m.player2_id
    );
  }

  /**
   * Get pending matches waiting for players
   * 
   * @param matches - Array of tournament matches
   * @returns Array of matches waiting for player assignments
   */
  static getPendingMatches(matches: TournamentMatch[]): TournamentMatch[] {
    return matches.filter(m => 
      m.status === 'pending' || 
      !m.player1_id || 
      !m.player2_id
    );
  }

  /**
   * Calculate tournament capacity and participant limits
   * 
   * @param tournamentType - Type of tournament (SABO-16, SABO-32, etc.)
   * @returns Tournament capacity information
   */
  static getTournamentCapacity(tournamentType: string = 'SABO-16'): {
    maxParticipants: number;
    totalMatches: number;
    rounds: number;
    structure: string;
  } {
    switch (tournamentType) {
      case 'SABO-16':
        return {
          maxParticipants: 16,
          totalMatches: 27,
          rounds: 8, // 3 WB + 3 LA + 2 LB + semifinals + final
          structure: 'Double Elimination with Convergence',
        };
      case 'SABO-32':
        return {
          maxParticipants: 32,
          totalMatches: 62, // Estimated for 32-player format
          rounds: 12,
          structure: 'Double Elimination with Group Stage',
        };
      default:
        return this.getTournamentCapacity('SABO-16');
    }
  }

  /**
   * Advanced validation: Check round structure consistency
   * 
   * @private
   */
  private static validateRoundStructure(
    organized: OrganizedMatches,
    errors: string[],
    warnings: string[]
  ): void {
    // Check round progression in Winners Bracket
    const winnersRounds = [...new Set(organized.winners.map(m => m.round_number))].sort();
    if (!this.arraysEqual(winnersRounds, [1, 2, 3])) {
      errors.push(`Winners bracket rounds should be [1, 2, 3], found [${winnersRounds.join(', ')}]`);
    }

    // Check Losers Branch A rounds
    const losersARounds = [...new Set(organized.losers_branch_a.map(m => m.round_number))].sort();
    if (!this.arraysEqual(losersARounds, [101, 102, 103])) {
      errors.push(`Losers Branch A rounds should be [101, 102, 103], found [${losersARounds.join(', ')}]`);
    }

    // Check Losers Branch B rounds  
    const losersBRounds = [...new Set(organized.losers_branch_b.map(m => m.round_number))].sort();
    if (!this.arraysEqual(losersBRounds, [201, 202])) {
      errors.push(`Losers Branch B rounds should be [201, 202], found [${losersBRounds.join(', ')}]`);
    }
  }

  /**
   * Advanced validation: Check match numbering consistency
   * 
   * @private
   */
  private static validateMatchNumbering(
    matches: TournamentMatch[],
    errors: string[],
    warnings: string[]
  ): void {
    // Group matches by round and check numbering
    const matchesByRound = matches.reduce((acc, match) => {
      if (!acc[match.round_number]) acc[match.round_number] = [];
      acc[match.round_number].push(match);
      return acc;
    }, {} as Record<number, TournamentMatch[]>);

    Object.entries(matchesByRound).forEach(([round, roundMatches]) => {
      const matchNumbers = roundMatches.map(m => m.match_number).sort((a, b) => a - b);
      const expectedNumbers = Array.from({ length: roundMatches.length }, (_, i) => i + 1);
      
      if (!this.arraysEqual(matchNumbers, expectedNumbers)) {
        warnings.push(`Round ${round} match numbering irregular: expected [${expectedNumbers.join(', ')}], found [${matchNumbers.join(', ')}]`);
      }
    });
  }

  /**
   * Advanced validation: Check player assignment consistency
   * 
   * @private
   */
  private static validatePlayerAssignments(
    matches: TournamentMatch[],
    warnings: string[]
  ): void {
    // Check for duplicate player assignments in same round
    const playersByRound = matches.reduce((acc, match) => {
      if (!acc[match.round_number]) acc[match.round_number] = new Set();
      if (match.player1_id) acc[match.round_number].add(match.player1_id);
      if (match.player2_id) acc[match.round_number].add(match.player2_id);
      return acc;
    }, {} as Record<number, Set<string>>);

    Object.entries(playersByRound).forEach(([round, players]) => {
      const totalPlayerSlots = matches.filter(m => m.round_number === parseInt(round)).length * 2;
      const uniquePlayers = players.size;
      
      if (uniquePlayers < totalPlayerSlots / 2) {
        warnings.push(`Round ${round} may have player assignment issues: ${uniquePlayers} unique players for ${totalPlayerSlots / 2} expected positions`);
      }
    });
  }

  /**
   * Utility: Check if two arrays are equal
   * 
   * @private
   */
  private static arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
}

// Export service instance and types
export const tournamentCoreLogicService = new TournamentCoreLogicService();

// Export constants for convenience
export const TOURNAMENT_STRUCTURE = TournamentCoreLogicService.TOURNAMENT_STRUCTURE;
export const TOURNAMENT_ROUNDS = TournamentCoreLogicService.TOURNAMENT_ROUNDS;
export const TOTAL_MATCHES = TournamentCoreLogicService.TOTAL_MATCHES;

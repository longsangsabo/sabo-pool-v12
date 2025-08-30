/**
 * Enhanced SABO Handicap Calculator
 * Automatically calculates handicap for matched challenges based on SABO system
 */

import { SaboRank, HandicapResult } from './saboHandicap';

export interface SaboHandicapConfig {
  bet_points: number;
  race_to: number;
  handicap_1_rank: number;
  handicap_05_rank: number;
}

// SABO Handicap Configuration Matrix (from reference document)
export const SABO_HANDICAP_CONFIGURATIONS: SaboHandicapConfig[] = [
  { bet_points: 100, race_to: 8, handicap_1_rank: 1.0, handicap_05_rank: 0.5 },
  { bet_points: 200, race_to: 12, handicap_1_rank: 1.5, handicap_05_rank: 1.0 },
  { bet_points: 300, race_to: 14, handicap_1_rank: 2.0, handicap_05_rank: 1.5 },
  { bet_points: 400, race_to: 16, handicap_1_rank: 2.5, handicap_05_rank: 1.5 },
  { bet_points: 500, race_to: 18, handicap_1_rank: 3.0, handicap_05_rank: 2.0 },
  { bet_points: 600, race_to: 22, handicap_1_rank: 3.5, handicap_05_rank: 2.5 },
];

const RANK_VALUES: Record<SaboRank, number> = {
  K: 1, 'K+': 2, I: 3, 'I+': 4, H: 5, 'H+': 6,
  G: 7, 'G+': 8, F: 9, 'F+': 10, E: 11, 'E+': 12,
};

/**
 * Calculate precise SABO handicap based on official system
 */
export function calculateSaboHandicapPrecise(
  challengerRank: SaboRank,
  opponentRank: SaboRank,
  betPoints: number
): HandicapResult {
  const challengerValue = RANK_VALUES[challengerRank];
  const opponentValue = RANK_VALUES[opponentRank];
  const rankDiff = opponentValue - challengerValue; // Positive = opponent stronger

  // Find closest configuration
  const config = SABO_HANDICAP_CONFIGURATIONS.find(c => c.bet_points === betPoints) 
    || SABO_HANDICAP_CONFIGURATIONS[0]; // fallback to 100 points

  let handicapChallenger = 0;
  let handicapOpponent = 0;
  let isValid = true;
  let errorMessage = '';

  // Validate rank difference (max ±2 main ranks = 4 sub-ranks)
  if (Math.abs(rankDiff) > 4) {
    isValid = false;
    errorMessage = 'Chênh lệch hạng quá lớn. Chỉ được thách đấu trong phạm vi ±2 hạng chính.';
  }

  if (isValid) {
    // Tính toán handicap dựa trên rank difference
    const absRankDiff = Math.abs(rankDiff);
    
    if (absRankDiff === 0) {
      // Cùng rank - không handicap
      handicapChallenger = 0;
      handicapOpponent = 0;
    } else if (absRankDiff === 1) {
      // Chênh lệch 1 sub-rank (có thể là sub-rank trong cùng main rank hoặc giữa 2 main rank)
      // VD: K vs K+, hoặc K+ vs I, hoặc H vs H+, hoặc H+ vs G
      const handicapAmount = config.handicap_05_rank;
      if (rankDiff > 0) {
        handicapChallenger = handicapAmount; // Challenger yếu hơn
      } else {
        handicapOpponent = handicapAmount; // Opponent yếu hơn  
      }
    } else if (absRankDiff === 2) {
      // Chênh lệch 1 main rank (VD: K vs I, H vs G)
      const handicapAmount = config.handicap_1_rank;
      if (rankDiff > 0) {
        handicapChallenger = handicapAmount; // Challenger yếu hơn
      } else {
        handicapOpponent = handicapAmount; // Opponent yếu hơn
      }
    } else if (absRankDiff === 3) {
      // Chênh lệch 1 main rank + 1 sub-rank (VD: K vs I+, H vs G+)
      const handicapAmount = config.handicap_1_rank + config.handicap_05_rank;
      if (rankDiff > 0) {
        handicapChallenger = handicapAmount; // Challenger yếu hơn
      } else {
        handicapOpponent = handicapAmount; // Opponent yếu hơn
      }
    } else if (absRankDiff === 4) {
      // Chênh lệch 2 main rank (VD: K vs H, G vs E)
      const handicapAmount = config.handicap_1_rank * 2;
      if (rankDiff > 0) {
        handicapChallenger = handicapAmount; // Challenger yếu hơn
      } else {
        handicapOpponent = handicapAmount; // Opponent yếu hơn
      }
    }
  }

  // Generate explanation
  let explanation = '';
  if (!isValid) {
    explanation = errorMessage;
  } else if (rankDiff === 0) {
    explanation = `Cùng hạng ${challengerRank} - Không có handicap`;
  } else {
    const absRankDiff = Math.abs(rankDiff);
    const strongerPlayer = rankDiff > 0 ? opponentRank : challengerRank;
    const weakerPlayer = rankDiff > 0 ? challengerRank : opponentRank;
    const handicap = Math.max(handicapChallenger, handicapOpponent);
    
    let diffDescription = '';
    if (absRankDiff === 1) {
      diffDescription = 'chênh 1 sub-rank';
    } else if (absRankDiff === 2) {
      diffDescription = 'chênh 1 main rank';
    } else if (absRankDiff === 3) {
      diffDescription = 'chênh 1 main rank + 1 sub-rank';
    } else if (absRankDiff === 4) {
      diffDescription = 'chênh 2 main rank';
    }
    
    explanation = `${weakerPlayer} được cộng ${handicap} bàn ban đầu (${strongerPlayer} vs ${weakerPlayer}, ${diffDescription})`;
  }

  return {
    isValid,
    errorMessage,
    rankDifference: Math.abs(rankDiff),
    handicapChallenger,
    handicapOpponent,
    challengerRank,
    opponentRank,
    stakeAmount: betPoints,
    explanation,
  };
}

/**
 * Get race-to value from bet points
 */
export function getRaceToFromBetPoints(betPoints: number): number {
  const config = SABO_HANDICAP_CONFIGURATIONS.find(c => c.bet_points === betPoints);
  return config?.race_to || 8;
}

/**
 * Apply handicap to challenge data for database storage
 */
export function applyHandicapToChallenge(
  challengerRank: SaboRank,
  opponentRank: SaboRank,
  betPoints: number
): {
  handicap_data: any;
  race_to: number;
  initial_challenger_score: number;
  initial_opponent_score: number;
} {
  const handicapResult = calculateSaboHandicapPrecise(challengerRank, opponentRank, betPoints);
  const raceToValue = getRaceToFromBetPoints(betPoints);

  return {
    handicap_data: {
      handicap_challenger: handicapResult.handicapChallenger,
      handicap_opponent: handicapResult.handicapOpponent,
      challenger_rank: challengerRank,
      opponent_rank: opponentRank,
      bet_points: betPoints,
      race_to: raceToValue,
      explanation: handicapResult.explanation,
      is_valid: handicapResult.isValid,
    },
    race_to: raceToValue,
    initial_challenger_score: handicapResult.handicapChallenger,
    initial_opponent_score: handicapResult.handicapOpponent,
  };
}

/**
 * Format handicap display for UI
 */
export function formatHandicapForDisplay(handicapData: any): {
  displayText: string;
  shortText: string;
  color: 'blue' | 'green' | 'gray';
  icon: string;
} {
  if (!handicapData) {
    return {
      displayText: 'Không có thông tin handicap',
      shortText: 'N/A',
      color: 'gray',
      icon: '⚖️'
    };
  }

  const { handicap_challenger, handicap_opponent, explanation } = handicapData;

  if (handicap_challenger > 0) {
    return {
      displayText: `Challenger được cộng ${handicap_challenger} bàn ban đầu`,
      shortText: `+${handicap_challenger}`,
      color: 'blue',
      icon: '🎯'
    };
  } else if (handicap_opponent > 0) {
    return {
      displayText: `Opponent được cộng ${handicap_opponent} bàn ban đầu`,
      shortText: `+${handicap_opponent}`,
      color: 'green',
      icon: '🎯'
    };
  } else {
    return {
      displayText: 'Trận đấu cân bằng - không chấp',
      shortText: 'Cân bằng',
      color: 'gray',
      icon: '⚖️'
    };
  }
}

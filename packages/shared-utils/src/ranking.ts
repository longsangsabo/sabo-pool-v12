/**
 * Ranking System Utilities
 * Consolidated from SABO Arena ranking system
 */

import {
  Crown,
  Shield,
  Star,
  Award,
  Gem,
  Sword,
  Target,
  Trophy,
  Medal,
  Zap,
  Flame,
  Diamond,
} from 'lucide-react';

// ELO thresholds for each rank
export const RANK_ELO = {
  K: 1000,
  'K+': 1100,
  I: 1200,
  'I+': 1300,
  H: 1400,
  'H+': 1500,
  G: 1600,
  'G+': 1700,
  F: 1800,
  'F+': 1900,
  E: 2000,
  'E+': 2100,
} as const;

// Tournament ELO rewards
export const TOURNAMENT_ELO_REWARDS = {
  CHAMPION: 100,
  RUNNER_UP: 50,
  THIRD_PLACE: 25,
  FOURTH_PLACE: 12,
  TOP_8: 6,
  TOP_16: 3,
  PARTICIPATION: 1,
} as const;

// Rank order from lowest to highest
export const RANK_ORDER: RankCode[] = [
  'K',
  'K+',
  'I',
  'I+',
  'H',
  'H+',
  'G',
  'G+',
  'F',
  'F+',
  'E',
  'E+',
];

// Rank colors and styling
export const rankColors = {
  // Hạng K (Đen)
  K: {
    color: '#878787',
    name: 'Hạng K',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #878787 0%, #5a5a5a 50%, #878787 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(135, 135, 135, 0.3)',
  },
  'K+': {
    color: '#72788F',
    name: 'Hạng K+',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #72788F 0%, #4a5061 50%, #72788F 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    borderColor: 'rgba(114, 120, 143, 0.3)',
  },
  // Hạng I (Xanh dương)
  I: {
    color: '#3A6FD8',
    name: 'Hạng I',
    icon: Gem,
    gradient: 'linear-gradient(135deg, #3A6FD8 0%, #2451a3 50%, #3A6FD8 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(58, 111, 216, 0.3)',
  },
  'I+': {
    color: '#2A59C5',
    name: 'Hạng I+',
    icon: Sword,
    gradient: 'linear-gradient(135deg, #2A59C5 0%, #1e4193 50%, #2A59C5 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(42, 89, 197, 0.3)',
  },
  // Hạng H (Xanh lá)
  H: {
    color: '#20C997',
    name: 'Hạng H',
    icon: Target,
    gradient: 'linear-gradient(135deg, #20C997 0%, #17a085 50%, #20C997 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(32, 201, 151, 0.3)',
  },
  'H+': {
    color: '#17A77F',
    name: 'Hạng H+',
    icon: Trophy,
    gradient: 'linear-gradient(135deg, #17A77F 0%, #128a67 50%, #17A77F 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(23, 167, 127, 0.3)',
  },
  // Hạng G (Xanh lá đậm)
  G: {
    color: '#28A745',
    name: 'Hạng G',
    icon: Medal,
    gradient: 'linear-gradient(135deg, #28A745 0%, #1e7e34 50%, #28A745 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  'G+': {
    color: '#1E8535',
    name: 'Hạng G+',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #1E8535 0%, #155724 50%, #1E8535 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(30, 133, 53, 0.3)',
  },
  // Hạng F (Vàng)
  F: {
    color: '#FFC107',
    name: 'Hạng F',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #FFC107 0%, #e0a800 50%, #FFC107 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  'F+': {
    color: '#FDA800',
    name: 'Hạng F+',
    icon: Diamond,
    gradient: 'linear-gradient(135deg, #FDA800 0%, #dc8f00 50%, #FDA800 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(253, 168, 0, 0.3)',
  },
  // Hạng E (Cam)
  E: {
    color: '#FD7E14',
    name: 'Hạng E',
    icon: Crown,
    gradient: 'linear-gradient(135deg, #FD7E14 0%, #e8680f 50%, #FD7E14 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(253, 126, 20, 0.3)',
  },
  'E+': {
    color: '#DC6502',
    name: 'Hạng E+',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #DC6502 0%, #bd5502 50%, #DC6502 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(220, 101, 2, 0.3)',
  },
};

// Type definitions
export type RankCode = keyof typeof RANK_ELO;
export type TournamentPosition = keyof typeof TOURNAMENT_ELO_REWARDS;

/**
 * Get default rank for new players
 */
export const getDefaultRank = (): RankCode => 'K';

/**
 * Get next rank in progression
 */
export function getNextRank(currentRank: RankCode): RankCode | null {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex === RANK_ORDER.length - 1) {
    return null; // Already at highest rank
  }
  return RANK_ORDER[currentIndex + 1];
}

/**
 * Get previous rank in progression
 */
export function getPreviousRank(currentRank: RankCode): RankCode | null {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  if (currentIndex <= 0) {
    return null; // Already at lowest rank
  }
  return RANK_ORDER[currentIndex - 1];
}

/**
 * Get rank based on ELO rating
 */
export function getRankByElo(elo: number): RankCode {
  // Find highest rank that player qualifies for
  for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
    const rank = RANK_ORDER[i];
    if (elo >= RANK_ELO[rank]) {
      return rank;
    }
  }
  return 'K'; // Default to lowest rank
}

/**
 * Calculate ELO needed for next rank
 */
export function getEloNeededForNextRank(currentRank: RankCode, currentElo: number): number {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 0; // Already at highest rank
  
  const targetElo = RANK_ELO[nextRank];
  return Math.max(0, targetElo - currentElo);
}

/**
 * Get rank styling information
 */
export const getRankInfo = (rank: string) => {
  const normalizedRank = rank.toUpperCase();
  return (
    rankColors[normalizedRank as keyof typeof rankColors] || rankColors['K']
  );
};

/**
 * Get rank display with icon and styling
 */
export const getRankDisplay = (rank: string) => {
  const rankInfo = getRankInfo(rank);
  return {
    ...rankInfo,
    displayText: rank.toUpperCase(),
  };
};

/**
 * Format rank display text
 */
export function formatRankDisplay(rank: RankCode): string {
  const rankInfo = getRankInfo(rank);
  return rankInfo.name;
}

/**
 * Check if rank is promotion eligible
 */
export function isPromotionEligible(currentRank: RankCode, currentElo: number): boolean {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return false;
  
  return currentElo >= RANK_ELO[nextRank];
}

/**
 * Check if rank is demotion risk
 */
export function isDemotionRisk(currentRank: RankCode, currentElo: number): boolean {
  const currentRankElo = RANK_ELO[currentRank];
  // Risk of demotion if ELO is 50 points below rank threshold
  return currentElo < (currentRankElo - 50);
}

/**
 * Calculate rank progression percentage
 */
export function getRankProgress(currentRank: RankCode, currentElo: number): number {
  const currentRankElo = RANK_ELO[currentRank];
  const nextRank = getNextRank(currentRank);
  
  if (!nextRank) return 100; // At max rank
  
  const nextRankElo = RANK_ELO[nextRank];
  const progress = (currentElo - currentRankElo) / (nextRankElo - currentRankElo);
  
  return Math.max(0, Math.min(100, progress * 100));
}

/**
 * Get rank by ELO score
 */
// export function getRankByElo(elo: number): RankCode {
//   // Find highest rank that player qualifies for
//   for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
//     const rank = RANK_ORDER[i];
//     if (elo >= RANK_ELO[rank]) {
//       return rank;
//     }
//   }
//   return 'K'; // Default
// }

/**
 * Check if eligible for promotion - simplified: just need ELO
 */
export function isEligibleForPromotion(
  currentElo: number,
  currentRank: RankCode
): boolean {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) {
    return false; // Already at highest rank
  }

  return currentElo >= RANK_ELO[nextRank];
}

/**
 * Calculate detailed rank progress information
 */
export function calculateRankProgress(
  currentElo: number,
  currentRank: RankCode
): {
  currentRankElo: number;
  nextRankElo: number | null;
  progress: number;
  pointsNeeded: number;
} {
  const currentRankElo = RANK_ELO[currentRank];
  const nextRank = getNextRank(currentRank);

  if (!nextRank) {
    return {
      currentRankElo,
      nextRankElo: null,
      progress: 100,
      pointsNeeded: 0,
    };
  }

  const nextRankElo = RANK_ELO[nextRank];
  const totalPointsNeeded = nextRankElo - currentRankElo;
  const pointsEarned = Math.max(0, currentElo - currentRankElo);
  const progress = Math.min(100, (pointsEarned / totalPointsNeeded) * 100);
  const pointsNeeded = Math.max(0, nextRankElo - currentElo);

  return {
    currentRankElo,
    nextRankElo,
    progress,
    pointsNeeded,
  };
}

/**
 * Get rank color CSS class
 */
export function getRankColor(rank: RankCode): string {
  const colors = {
    K: 'text-slate-600',
    'K+': 'text-slate-500',
    I: 'text-amber-600',
    'I+': 'text-amber-500',
    H: 'text-green-600',
    'H+': 'text-green-500',
    G: 'text-blue-600',
    'G+': 'text-blue-500',
    F: 'text-purple-600',
    'F+': 'text-purple-500',
    E: 'text-red-600',
    'E+': 'text-red-500',
  };

  return colors[rank] || 'text-slate-600';
}

// SABO Arena rank system
export const SABO_RANKS = [
  { value: 1, code: 'K', name: 'Hạng K (Mới bắt đầu)', level: 1 },
  { value: 2, code: 'K+', name: 'Hạng K+ (Khá)', level: 2 },
  { value: 3, code: 'I', name: 'Hạng I (Trung bình)', level: 3 },
  { value: 4, code: 'I+', name: 'Hạng I+ (Trung bình khá)', level: 4 },
  { value: 5, code: 'H', name: 'Hạng H (Giỏi)', level: 5 },
  { value: 6, code: 'H+', name: 'Hạng H+ (Giỏi hơn)', level: 6 },
  { value: 7, code: 'G', name: 'Hạng G (Rất giỏi)', level: 7 },
  { value: 8, code: 'G+', name: 'Hạng G+ (Xuất sắc)', level: 8 },
  { value: 9, code: 'F', name: 'Hạng F (Chuyên nghiệp)', level: 9 },
  { value: 10, code: 'F+', name: 'Hạng F+ (Chuyên nghiệp cao)', level: 10 },
  { value: 11, code: 'E', name: 'Hạng E (Bậc thầy)', level: 11 },
  { value: 12, code: 'E+', name: 'Hạng E+ (Đại sư)', level: 12 },
] as const;

// Convert integer (1-12) to SABO rank code (K, K+, I, I+, etc.)
export const integerToSaboRank = (rankInt: number): string => {
  const rank = SABO_RANKS.find(r => r.value === rankInt);
  return rank ? rank.code : 'K'; // Default to K if invalid
};

// Convert SABO rank code to integer
export const saboRankToInteger = (rankCode: string): number => {
  const rank = SABO_RANKS.find(r => r.code === rankCode);
  return rank ? rank.value : 1; // Default to 1 if invalid
};

// Get full rank information
export const getSaboRankInfo = (rankInt: number) => {
  return SABO_RANKS.find(r => r.value === rankInt) || SABO_RANKS[0];
};

// Get rank info by code
export const getSaboRankInfoByCode = (rankCode: string) => {
  return SABO_RANKS.find(r => r.code === rankCode) || SABO_RANKS[0];
};

// Compare ranks (returns negative if rank1 < rank2, positive if rank1 > rank2)
export const compareRanks = (rank1: string, rank2: string): number => {
  const level1 = getSaboRankInfoByCode(rank1).level;
  const level2 = getSaboRankInfoByCode(rank2).level;
  return level1 - level2;
};

// Check if rank1 is higher than rank2
export const isHigherRank = (rank1: string, rank2: string): boolean => {
  return compareRanks(rank1, rank2) > 0;
};

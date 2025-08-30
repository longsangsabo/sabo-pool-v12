/**
 * Trust Score Utilities
 * Functions for calculating and displaying user trust scores
 */

export interface TrustScoreInfo {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  badgeClass: string;
}

/**
 * Get trust score color and styling based on score value
 * 🟢 Uy tín cao (≥80%) - Dark green
 * 🔵 Khá tốt (60-79%) - Blue
 * 🟡 Trung bình (40-59%) - Yellow
 * 🔴 Cần cải thiện (<40%) - Red
 */
export const getTrustScoreInfo = (score: number): TrustScoreInfo => {
  if (score >= 80) {
    return {
      score,
      label: 'Uy tín cao',
      color: 'green',
      bgColor: 'bg-green-700',
      textColor: 'text-white',
      badgeClass: 'bg-green-700 text-white',
    };
  }

  if (score >= 60) {
    return {
      score,
      label: 'Khá tốt',
      color: 'blue',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      badgeClass: 'bg-blue-600 text-white',
    };
  }

  if (score >= 40) {
    return {
      score,
      label: 'Trung bình',
      color: 'yellow',
      bgColor: 'bg-yellow-600',
      textColor: 'text-white',
      badgeClass: 'bg-yellow-600 text-white',
    };
  }

  return {
    score,
    label: 'Cần cải thiện',
    color: 'red',
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    badgeClass: 'bg-red-600 text-white',
  };
};

/**
 * Get trust score description based on rating
 */
export const getTrustScoreDescription = (score: number): string => {
  if (score >= 95)
    return 'Người chơi có uy tín xuất sắc, đáng tin cậy tuyệt đối';
  if (score >= 80) return 'Người chơi có uy tín cao, rất đáng tin cậy';
  if (score >= 60) return 'Người chơi có uy tín khá tốt, đáng tin cậy';
  if (score >= 40) return 'Người chơi có uy tín trung bình, cần thận trọng';
  return 'Người chơi có uy tín thấp, cần cải thiện';
};

/**
 * Format trust score for display
 */
export const formatTrustScore = (score: number): string => {
  return `${Math.round(score)}%`;
};

/**
 * Get star rating from trust score (approximate reverse calculation)
 */
export const getApproximateStarRating = (trustScore: number): number => {
  if (trustScore >= 95) return 5.0;
  if (trustScore >= 90) return 4.8;
  if (trustScore >= 80) return 4.5;
  if (trustScore >= 60) return 4.0;
  if (trustScore >= 40) return 3.5;
  return 3.0;
};

/**
 * Check if trust score is considered safe for transactions
 */
export const isTrustScoreSafe = (score: number): boolean => {
  return score >= 60;
};

/**
 * Get trust score level (1-5 scale)
 */
export const getTrustScoreLevel = (score: number): number => {
  if (score >= 95) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

/**
 * Calculate trust score change percentage
 */
export const calculateTrustScoreChange = (oldScore: number, newScore: number): {
  change: number;
  percentage: number;
  isIncrease: boolean;
} => {
  const change = newScore - oldScore;
  const percentage = oldScore > 0 ? (change / oldScore) * 100 : 0;
  
  return {
    change: Math.round(change * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    isIncrease: change > 0,
  };
};

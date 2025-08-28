/**
 * SABO Arena Specific Utility Functions
 * Tournament and gaming specific helpers
 */

/**
 * Calculate player ranking based on ELO and wins
 */
export const calculateRank = (elo: number, wins: number): string => {
  if (elo >= 2400) return 'Grandmaster';
  if (elo >= 2200) return 'Master';
  if (elo >= 2000) return 'Expert';
  if (elo >= 1800) return 'Advanced';
  if (elo >= 1600) return 'Intermediate';
  if (elo >= 1400) return 'Beginner';
  return 'Novice';
};

/**
 * Calculate ELO rating change
 */
export const calculateEloChange = (
  playerElo: number,
  opponentElo: number,
  playerWon: boolean,
  kFactor: number = 32
): number => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = playerWon ? 1 : 0;
  return Math.round(kFactor * (actualScore - expectedScore));
};

/**
 * Format tournament status for display
 */
export const formatTournamentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'registration_open': 'Đang mở đăng ký',
    'registration_closed': 'Đã đóng đăng ký', 
    'ongoing': 'Đang diễn ra',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'postponed': 'Hoãn lại'
  };
  return statusMap[status] || status;
};

/**
 * Calculate tournament progress percentage
 */
export const calculateTournamentProgress = (
  currentRound: number,
  totalRounds: number,
  participantCount: number
): number => {
  if (totalRounds === 0) return 0;
  const progressPercentage = (currentRound / totalRounds) * 100;
  return Math.min(Math.max(progressPercentage, 0), 100);
};

/**
 * Generate tournament bracket seeding
 */
export const generateBracketSeeding = (participants: any[]): any[] => {
  // Sort by ELO rating descending
  const sorted = [...participants].sort((a, b) => (b.elo || 0) - (a.elo || 0));
  
  // Apply tournament seeding algorithm (1 vs lowest, 2 vs second lowest, etc.)
  const seeded: any[] = [];
  const half = Math.ceil(sorted.length / 2);
  
  for (let i = 0; i < half; i++) {
    seeded.push(sorted[i]);
    if (sorted[sorted.length - 1 - i]) {
      seeded.push(sorted[sorted.length - 1 - i]);
    }
  }
  
  return seeded;
};

/**
 * Calculate pool table rental cost
 */
export const calculateRentalCost = (
  hourlyRate: number,
  startTime: Date,
  endTime: Date,
  discountPercentage: number = 0
): number => {
  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const baseCost = hourlyRate * Math.ceil(hours); // Round up to nearest hour
  const discount = baseCost * (discountPercentage / 100);
  return Math.max(baseCost - discount, 0);
};

/**
 * Check if time slot is available
 */
export const isTimeSlotAvailable = (
  requestedStart: Date,
  requestedEnd: Date,
  existingBookings: Array<{ start_time: string; end_time: string }>
): boolean => {
  return !existingBookings.some(booking => {
    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);
    
    // Check for overlap
    return requestedStart < bookingEnd && requestedEnd > bookingStart;
  });
};

/**
 * Generate match schedule for round-robin tournament
 */
export const generateRoundRobinSchedule = (participants: any[]): any[][] => {
  const rounds: any[][] = [];
  const players = [...participants];
  
  // Add dummy player if odd number of participants
  if (players.length % 2 === 1) {
    players.push({ id: 'bye', name: 'BYE' });
  }
  
  const numRounds = players.length - 1;
  const numMatches = players.length / 2;
  
  for (let round = 0; round < numRounds; round++) {
    const roundMatches: any[] = [];
    
    for (let match = 0; match < numMatches; match++) {
      const player1 = players[match];
      const player2 = players[players.length - 1 - match];
      
      if (player1.id !== 'bye' && player2.id !== 'bye') {
        roundMatches.push({
          player1,
          player2,
          round: round + 1
        });
      }
    }
    
    rounds.push(roundMatches);
    
    // Rotate players (keep first player fixed)
    const last = players.pop();
    players.splice(1, 0, last);
  }
  
  return rounds;
};

/**
 * Validate Vietnamese phone number
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
  // Vietnamese phone number patterns
  const patterns = [
    /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-46-9])[0-9]{7}$/,
    /^(\+84|84|0)(1[2689]|2[0-9])[0-9]{8}$/
  ];
  
  return patterns.some(pattern => pattern.test(phone.replace(/\s/g, '')));
};

/**
 * Format match result for display
 */
export const formatMatchResult = (
  player1Score: number,
  player2Score: number,
  maxScore: number = 9
): string => {
  const winner = player1Score > player2Score ? 'Player 1' : 'Player 2';
  const loserScore = Math.min(player1Score, player2Score);
  const winnerScore = Math.max(player1Score, player2Score);
  
  if (winnerScore === maxScore) {
    return `${winnerScore}-${loserScore}`;
  }
  
  return `${player1Score}-${player2Score}`;
};

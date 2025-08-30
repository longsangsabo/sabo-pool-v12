/**
 * Hook for SPA point calculation with winner/loser logic
 */

import { useMemo } from 'react';

export interface SAPPointTransfer {
  winnerId: string;
  winnerName: string;
  winnerGain: number;
  loserId: string;
  loserName: string;
  loserLoss: number;
  betAmount: number;
  transferDescription: string;
}

export interface SPACalculationParams {
  challengerId: string;
  challengerName: string;
  challengerScore: number;
  opponentId: string;
  opponentName: string;
  opponentScore: number;
  betPoints: number;
  raceToScore?: number;
}

export const useSPAPointCalculation = ({
  challengerId,
  challengerName,
  challengerScore,
  opponentId,
  opponentName,
  opponentScore,
  betPoints,
  raceToScore = 9
}: SPACalculationParams): SAPPointTransfer | null => {
  
  return useMemo(() => {
    // Only calculate if both scores are valid
    if (challengerScore < 0 || opponentScore < 0) {
      return null;
    }

    // Determine winner and loser
    let winnerId: string;
    let winnerName: string;
    let winnerScore: number;
    let loserId: string;
    let loserName: string;
    let loserScore: number;

    if (challengerScore > opponentScore) {
      // Challenger wins
      winnerId = challengerId;
      winnerName = challengerName;
      winnerScore = challengerScore;
      loserId = opponentId;
      loserName = opponentName;
      loserScore = opponentScore;
    } else if (opponentScore > challengerScore) {
      // Opponent wins
      winnerId = opponentId;
      winnerName = opponentName;
      winnerScore = opponentScore;
      loserId = challengerId;
      loserName = challengerName;
      loserScore = challengerScore;
    } else {
      // Tie - no point transfer
      return {
        winnerId: '',
        winnerName: 'Hòa',
        winnerGain: 0,
        loserId: '',
        loserName: 'Hòa',
        loserLoss: 0,
        betAmount: betPoints,
        transferDescription: `Trận hòa ${challengerScore}-${opponentScore}. Không chuyển điểm SPA.`
      };
    }

    // Calculate point transfer
    // Winner gets the bet amount, loser loses the bet amount
    const winnerGain = betPoints;
    const loserLoss = betPoints;

    const transferDescription = `${winnerName} thắng ${winnerScore}-${loserScore}. ` +
      `+${winnerGain} SPA cho ${winnerName}, -${loserLoss} SPA cho ${loserName}.`;

    return {
      winnerId,
      winnerName,
      winnerGain,
      loserId,
      loserName,
      loserLoss,
      betAmount: betPoints,
      transferDescription
    };
  }, [
    challengerId, 
    challengerName, 
    challengerScore, 
    opponentId, 
    opponentName, 
    opponentScore, 
    betPoints, 
    raceToScore
  ]);
};

/**
 * Hook for formatting SPA point changes for display
 */
export const useSPAChangeDisplay = (transfer: SAPPointTransfer | null) => {
  return useMemo(() => {
    if (!transfer) {
      return {
        hasTransfer: false,
        winnerDisplay: '',
        loserDisplay: '',
        summaryText: ''
      };
    }

    if (transfer.winnerId === '') {
      // Tie case
      return {
        hasTransfer: false,
        winnerDisplay: transfer.transferDescription,
        loserDisplay: '',
        summaryText: transfer.transferDescription
      };
    }

    return {
      hasTransfer: true,
      winnerDisplay: `${transfer.winnerName}: +${transfer.winnerGain} SPA`,
      loserDisplay: `${transfer.loserName}: -${transfer.loserLoss} SPA`,
      summaryText: transfer.transferDescription
    };
  }, [transfer]);
};

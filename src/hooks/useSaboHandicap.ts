/**
 * React Hook for SABO Handicap Management
 * Automatically handles handicap calculation and application for challenges
 */

import { useState, useEffect } from 'react';
import { SaboRank } from '@/utils/saboHandicap';
import { 
  calculateSaboHandicapPrecise, 
  applyHandicapToChallenge,
  formatHandicapForDisplay
} from '@/utils/saboHandicapCalculator';
import { supabase } from '@/integrations/supabase/client';
// import { toast } from 'react-hot-toast';

// Temporary mock toast for this file
const toast = {
  error: (msg: string) => console.warn('Toast Error:', msg),
  success: (msg: string) => console.log('Toast Success:', msg)
};

export interface UseHandicapOptions {
  challengerRank?: SaboRank;
  opponentRank?: SaboRank;
  betPoints?: number;
  autoUpdate?: boolean;
}

export interface HandicapState {
  handicapData: any;
  raceToValue: number;
  initialScores: {
    challenger: number;
    opponent: number;
  };
  displayInfo: {
    displayText: string;
    shortText: string;
    color: 'blue' | 'green' | 'gray';
    icon: string;
  };
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage SABO handicap calculation and application
 */
export function useSaboHandicap(options: UseHandicapOptions): HandicapState & {
  calculateHandicap: () => void;
  applyToChallenge: (challengeId: string) => Promise<boolean>;
  resetHandicap: () => void;
} {
  const [state, setState] = useState<HandicapState>({
    handicapData: null,
    raceToValue: 8,
    initialScores: { challenger: 0, opponent: 0 },
    displayInfo: {
      displayText: 'Chưa tính handicap',
      shortText: 'N/A',
      color: 'gray',
      icon: '⚖️'
    },
    isLoading: false,
    error: null,
  });

  // Calculate handicap when options change
  const calculateHandicap = () => {
    const { challengerRank, opponentRank, betPoints } = options;

    if (!challengerRank || !opponentRank || !betPoints) {
      setState(prev => ({
        ...prev,
        error: 'Thiếu thông tin để tính handicap',
        handicapData: null,
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = applyHandicapToChallenge(challengerRank, opponentRank, betPoints);
      const displayInfo = formatHandicapForDisplay(result.handicap_data);

      setState(prev => ({
        ...prev,
        handicapData: result.handicap_data,
        raceToValue: result.race_to,
        initialScores: {
          challenger: result.initial_challenger_score,
          opponent: result.initial_opponent_score,
        },
        displayInfo,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error calculating handicap:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Lỗi khi tính handicap',
      }));
    }
  };

  // Apply handicap to existing challenge
  const applyToChallenge = async (challengeId: string): Promise<boolean> => {
    if (!state.handicapData) {
      toast.error('Chưa có dữ liệu handicap để áp dụng');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase
        .from('challenges')
        .update({
          handicap_data: state.handicapData,
          race_to: state.raceToValue,
          challenger_initial_score: state.initialScores.challenger,
          opponent_initial_score: state.initialScores.opponent,
        })
        .eq('id', challengeId);

      if (error) {
        throw error;
      }

      toast.success('Đã áp dụng handicap thành công!');
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Error applying handicap:', error);
      toast.error('Lỗi khi áp dụng handicap');
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Reset handicap state
  const resetHandicap = () => {
    setState({
      handicapData: null,
      raceToValue: 8,
      initialScores: { challenger: 0, opponent: 0 },
      displayInfo: {
        displayText: 'Chưa tính handicap',
        shortText: 'N/A',
        color: 'gray',
        icon: '⚖️'
      },
      isLoading: false,
      error: null,
    });
  };

  // Auto-calculate when options change
  useEffect(() => {
    if (options.autoUpdate !== false) {
      calculateHandicap();
    }
  }, [options.challengerRank, options.opponentRank, options.betPoints]);

  return {
    ...state,
    calculateHandicap,
    applyToChallenge,
    resetHandicap,
  };
}

/**
 * Hook for bulk handicap operations (for admin use)
 */
export function useBulkHandicap() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const applyHandicapToPendingChallenges = async () => {
    setIsProcessing(true);
    setProgress({ current: 0, total: 0 });

    try {
      // Get all pending challenges without handicap
      const { data: challenges, error: fetchError } = await supabase
        .from('challenges')
        .select(`
          id, bet_amount, race_to,
          challenger_profile:profiles!challenges_challenger_id_fkey(current_rank),
          opponent_profile:profiles!challenges_opponent_id_fkey(current_rank)
        `)
        .in('status', ['pending', 'accepted'])
        .is('handicap_data', null);

      if (fetchError) throw fetchError;

      if (!challenges?.length) {
        toast.success('Không có trận đấu nào cần áp dụng handicap');
        return;
      }

      setProgress({ current: 0, total: challenges.length });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < challenges.length; i++) {
        const challenge = challenges[i];
        setProgress({ current: i + 1, total: challenges.length });

        try {
          const challengerRank = challenge.challenger_profile?.current_rank as SaboRank;
          const opponentRank = challenge.opponent_profile?.current_rank as SaboRank;
          const betPoints = challenge.bet_amount || 100;

          if (challengerRank && opponentRank) {
            const result = applyHandicapToChallenge(challengerRank, opponentRank, betPoints);

            await supabase
              .from('challenges')
              .update({
                handicap_data: result.handicap_data,
                race_to: result.race_to,
              })
              .eq('id', challenge.id);

            successCount++;
          } else {
            console.warn(`Missing rank data for challenge ${challenge.id}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error processing challenge ${challenge.id}:`, error);
          errorCount++;
        }
      }

      toast.success(`Đã xử lý ${successCount} trận đấu thành công, ${errorCount} lỗi`);
    } catch (error) {
      console.error('Error in bulk handicap operation:', error);
      toast.error('Lỗi khi xử lý hàng loạt');
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    applyHandicapToPendingChallenges,
    isProcessing,
    progress,
  };
}

/**
 * React hooks for score submission system
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScoreSubmissionData {
  challengeId: string;
  scoreChallenger: number;
  scoreOpponent: number;
  note?: string;
}

export interface ScoreConfirmationData {
  challengeId: string;
  confirm: boolean;
}

export interface ClubApprovalData {
  challengeId: string;
  approve: boolean;
  adminNote?: string;
}

// Hook for submitting match score
export const useSubmitScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ challengeId, scoreChallenger, scoreOpponent, note }: ScoreSubmissionData) => {
      // Call the PostgreSQL function directly
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error || !data) {
        throw new Error('Challenge not found');
      }

      // For now, use a simple update - we'll enhance this after migration
      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          challenger_score: scoreChallenger,
          opponent_score: scoreOpponent,
          response_message: `Score submitted: ${scoreChallenger}-${scoreOpponent}${note ? ` (${note})` : ''}`
        })
        .eq('id', challengeId);

      if (updateError) {
        console.error('Score submission error:', updateError);
        throw new Error(updateError.message || 'Failed to submit score');
      }

      return { success: true, message: 'Score submitted successfully' };
    },
    onSuccess: (data, variables) => {
      toast.success('Tỷ số đã được gửi thành công!');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
    },
    onError: (error: any) => {
      console.error('Submit score error:', error);
      toast.error(error.message || 'Không thể gửi tỷ số');
    }
  });
};

// Hook for confirming submitted score
export const useConfirmScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ challengeId, confirm }: ScoreConfirmationData) => {
      // Simple implementation for now
      const { error } = await supabase
        .from('challenges')
        .update({
          response_message: confirm ? 'Score confirmed by opponent' : 'Score rejected by opponent'
        })
        .eq('id', challengeId);

      if (error) {
        throw new Error(error.message || 'Failed to confirm score');
      }

      return { success: true, message: confirm ? 'Score confirmed' : 'Score rejected' };
    },
    onSuccess: (data, variables) => {
      if (variables.confirm) {
        toast.success('Tỷ số đã được xác nhận!');
      } else {
        toast.info('Tỷ số đã bị từ chối, trận đấu tiếp tục');
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
    },
    onError: (error: any) => {
      console.error('Confirm score error:', error);
      toast.error(error.message || 'Không thể xác nhận tỷ số');
    }
  });
};

// Hook for club approval
export const useClubApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ challengeId, approve, adminNote }: ClubApprovalData) => {
      // Simple implementation for now
      const { error } = await supabase
        .from('challenges')
        .update({
          status: approve ? 'completed' : 'disputed',
          response_message: `Club ${approve ? 'approved' : 'disputed'} result${adminNote ? `: ${adminNote}` : ''}`
        })
        .eq('id', challengeId);

      if (error) {
        throw new Error(error.message || 'Failed to process approval');
      }

      return { success: true, message: approve ? 'Result approved' : 'Result disputed' };
    },
    onSuccess: (data, variables) => {
      if (variables.approve) {
        toast.success('Kết quả trận đấu đã được phê duyệt và SPA đã được chuyển!');
      } else {
        toast.warning('Kết quả trận đấu bị tranh chấp');
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['club-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] });
    },
    onError: (error: any) => {
      console.error('Club approval error:', error);
      toast.error(error.message || 'Không thể xử lý phê duyệt');
    }
  });
};

// Hook for managing score submission UI state
export const useScoreSubmissionState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [scoreChallenger, setScoreChallenger] = useState<number>(0);
  const [scoreOpponent, setScoreOpponent] = useState<number>(0);
  const [note, setNote] = useState<string>('');

  const resetForm = () => {
    setScoreChallenger(0);
    setScoreOpponent(0);
    setNote('');
    setShowScoreInput(false);
  };

  return {
    isSubmitting,
    setIsSubmitting,
    showScoreInput,
    setShowScoreInput,
    scoreChallenger,
    setScoreChallenger,
    scoreOpponent,
    setScoreOpponent,
    note,
    setNote,
    resetForm
  };
};

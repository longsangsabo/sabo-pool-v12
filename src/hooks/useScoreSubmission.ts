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
      if (confirm) {
        // When both players confirm scores, change status to pending_approval
        const { error } = await supabase
          .from('challenges')
          .update({
            status: 'pending_approval',  // Move to pending club approval
            response_message: 'Score confirmed by both players - awaiting club approval',
            club_confirmed: false  // Reset club confirmation
          })
          .eq('id', challengeId)
          .eq('status', 'accepted');  // Only if currently accepted

        if (error) {
          throw new Error(error.message || 'Failed to confirm score');
        }
      } else {
        // If rejected, keep in accepted status for re-submission
        const { error } = await supabase
          .from('challenges')
          .update({
            response_message: 'Score rejected by opponent - please re-enter scores'
          })
          .eq('id', challengeId);

        if (error) {
          throw new Error(error.message || 'Failed to reject score');
        }
      }

      return { success: true, message: confirm ? 'Score confirmed' : 'Score rejected' };
    },
    onSuccess: (data, variables) => {
      if (variables.confirm) {
        toast.success('Tỷ số đã được xác nhận và chuyển cho club phê duyệt!');
      } else {
        toast.info('Tỷ số đã bị từ chối, vui lòng nhập lại');
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['club-challenges'] });
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
      // Direct update until PostgreSQL function is deployed
      const { data, error } = await supabase
        .from('challenges')
        .update({
          club_confirmed: approve,
          club_confirmed_at: new Date().toISOString(),
          club_note: adminNote || null,
          status: approve ? 'completed' : 'rejected',
          completed_at: approve ? new Date().toISOString() : null
        })
        .eq('id', challengeId)
        .eq('status', 'pending_approval')  // Only update if in pending_approval status
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to process approval');
      }

      if (!data) {
        throw new Error('Challenge not found or not in pending_approval status');
      }

      return { success: true, message: approve ? 'Result approved' : 'Result rejected' };
    },
    onSuccess: (data, variables) => {
      if (variables.approve) {
        toast.success('Kết quả trận đấu đã được phê duyệt và chuyển thành hoàn thành!');
      } else {
        toast.warning('Kết quả trận đấu bị từ chối');
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

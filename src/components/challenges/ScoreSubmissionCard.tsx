/**
 * Score Submission Component
 * Allows players to submit and confirm match scores
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Check, 
  X, 
  AlertCircle, 
  Clock,
  Users,
  Gamepad2,
  Calculator,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  useSubmitScore, 
  useConfirmScore, 
  useScoreSubmissionState 
} from '@/hooks/useScoreSubmission';

interface ScoreSubmissionProps {
  challenge: {
    id: string;
    challenger_id: string;
    opponent_id: string;
    challenger_score?: number | null;
    opponent_score?: number | null;
    status: string;
    response_message?: string | null;
    bet_points?: number | null;
    race_to?: number | null;
    handicap_data?: any;
  };
  challengerProfile: {
    id: string;
    display_name: string;
    spa_rank?: string;
    spa_points?: number;
  };
  opponentProfile: {
    id: string;
    display_name: string;
    spa_rank?: string;
    spa_points?: number;
  };
  onScoreSubmitted?: () => void;
}

export const ScoreSubmissionCard: React.FC<ScoreSubmissionProps> = ({
  challenge,
  challengerProfile,
  opponentProfile,
  onScoreSubmitted
}) => {
  const { user } = useAuth();
  const submitScore = useSubmitScore();
  const confirmScore = useConfirmScore();
  
  const {
    showScoreInput,
    setShowScoreInput,
    scoreChallenger,
    setScoreChallenger,
    scoreOpponent,
    setScoreOpponent,
    note,
    setNote,
    resetForm
  } = useScoreSubmissionState();

  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check user's role in the challenge
  const isChallenger = user?.id === challenge.challenger_id;
  const isOpponent = user?.id === challenge.opponent_id;
  const isParticipant = isChallenger || isOpponent;
  const canSubmitScore = isParticipant && (challenge.status === 'accepted' || challenge.status === 'ongoing');
  const hasSubmittedScore = challenge.challenger_score !== null && challenge.opponent_score !== null;
  const needsConfirmation = hasSubmittedScore && challenge.status !== 'completed';

  if (!isParticipant) {
    return null; // Don't show to non-participants
  }

  const handleSubmitScore = async () => {
    if (scoreChallenger < 0 || scoreOpponent < 0) {
      return;
    }

    try {
      await submitScore.mutateAsync({
        challengeId: challenge.id,
        scoreChallenger,
        scoreOpponent,
        note: note.trim() || undefined
      });
      
      resetForm();
      onScoreSubmitted?.();
    } catch (error) {
      console.error('Submit score error:', error);
    }
  };

  const handleConfirmScore = async (confirm: boolean) => {
    try {
      await confirmScore.mutateAsync({
        challengeId: challenge.id,
        confirm
      });
      
      setShowConfirmation(false);
      onScoreSubmitted?.();
    } catch (error) {
      console.error('Confirm score error:', error);
    }
  };

  const renderScoreStatus = () => {
    if (!hasSubmittedScore) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Chờ nhập tỷ số</span>
        </div>
      );
    }

    if (needsConfirmation) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Chờ xác nhận tỷ số</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-green-600">
        <Check className="w-4 h-4" />
        <span className="text-sm">Tỷ số đã xác nhận</span>
      </div>
    );
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Nhập Tỷ Số Trận Đấu
          </CardTitle>
          {renderScoreStatus()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Match Info */}
        <div className="grid grid-cols-3 items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <div className="font-semibold">{challengerProfile.display_name}</div>
            <Badge variant="outline" className="text-xs">
              {challengerProfile.spa_rank || 'N/A'}
            </Badge>
            {hasSubmittedScore && (
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {challenge.challenger_score}
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Race to {challenge.race_to || 'N/A'}</div>
            <div className="text-2xl font-bold">vs</div>
            <div className="text-xs text-gray-500 mt-1">
              {challenge.bet_points} SPA
            </div>
          </div>

          <div className="text-center">
            <div className="font-semibold">{opponentProfile.display_name}</div>
            <Badge variant="outline" className="text-xs">
              {opponentProfile.spa_rank || 'N/A'}
            </Badge>
            {hasSubmittedScore && (
              <div className="text-2xl font-bold text-green-600 mt-1">
                {challenge.opponent_score}
              </div>
            )}
          </div>
        </div>

        {/* Score Input Form */}
        {canSubmitScore && !hasSubmittedScore && (
          <div className="space-y-3">
            {!showScoreInput ? (
              <Button 
                onClick={() => setShowScoreInput(true)}
                className="w-full"
                variant="outline"
              >
                <Target className="w-4 h-4 mr-2" />
                Nhập Tỷ Số
              </Button>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {challengerProfile.display_name}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={scoreChallenger}
                      onChange={(e) => setScoreChallenger(Number(e.target.value))}
                      placeholder="0"
                      className="text-center text-lg"
                    />
                  </div>

                  <div className="text-center">
                    <Calculator className="w-6 h-6 mx-auto text-gray-400" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {opponentProfile.display_name}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={scoreOpponent}
                      onChange={(e) => setScoreOpponent(Number(e.target.value))}
                      placeholder="0"
                      className="text-center text-lg"
                    />
                  </div>
                </div>

                <Textarea
                  placeholder="Ghi chú về trận đấu (tùy chọn)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="resize-none"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitScore}
                    disabled={submitScore.isPending || scoreChallenger < 0 || scoreOpponent < 0}
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitScore.isPending ? 'Đang gửi...' : 'Gửi Tỷ Số'}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Score Confirmation */}
        {hasSubmittedScore && needsConfirmation && (
          <div className="space-y-3 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Xác nhận tỷ số</span>
            </div>
            
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tỷ số đã được gửi: <strong>{challenge.challenger_score} - {challenge.opponent_score}</strong>
            </p>
            
            {challenge.response_message && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {challenge.response_message}
              </p>
            )}

            {!showConfirmation ? (
              <Button 
                onClick={() => setShowConfirmation(true)}
                size="sm"
                variant="outline"
                className="w-full"
              >
                Xác nhận tỷ số
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleConfirmScore(true)}
                  disabled={confirmScore.isPending}
                  size="sm"
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Xác nhận
                </Button>
                <Button
                  onClick={() => handleConfirmScore(false)}
                  disabled={confirmScore.isPending}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Completed Status */}
        {challenge.status === 'completed' && (
          <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">Trận đấu đã hoàn thành</span>
            </div>
            
            <div className="text-sm text-green-700 dark:text-green-300">
              Kết quả cuối: <strong>{challenge.challenger_score} - {challenge.opponent_score}</strong>
            </div>
            
            {challenge.response_message && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {challenge.response_message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoreSubmissionCard;

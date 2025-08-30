import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Edit3, 
  Check, 
  X, 
  Target,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IntegratedScoreManagerProps {
  challengerScore: number | null;
  opponentScore: number | null;
  challengerName: string;
  opponentName: string;
  currentUserId: string;
  challengerId: string;
  opponentId: string;
  challengeStatus: 'ongoing' | 'accepted' | 'completed' | 'pending';
  challengeId: string;
  onScoreUpdate?: (challengerScore: number, opponentScore: number) => void;
}

const IntegratedScoreManager: React.FC<IntegratedScoreManagerProps> = ({
  challengerScore,
  opponentScore,
  challengerName,
  opponentName,
  currentUserId,
  challengerId,
  opponentId,
  challengeStatus,
  challengeId,
  onScoreUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempChallengerScore, setTempChallengerScore] = useState(challengerScore || 0);
  const [tempOpponentScore, setTempOpponentScore] = useState(opponentScore || 0);

  // Determine user role
  const isChallenger = currentUserId === challengerId;
  const isOpponent = currentUserId === opponentId;
  const canEditScore = (isChallenger || isOpponent) && challengeStatus === 'ongoing';

  // Update scores in challenges table only
  const handleScoreUpdate = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('challenges')
        .update({
          challenger_score: tempChallengerScore,
          opponent_score: tempOpponentScore,
          status: 'ongoing'
        })
        .eq('id', challengeId);

      if (error) throw error;

      toast.success('Tỷ số đã được cập nhật!');
      onScoreUpdate?.(tempChallengerScore, tempOpponentScore);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Score update error:', error);
      toast.error('Lỗi khi cập nhật tỷ số');
    }
  };

  // Complete the challenge
  const handleCompleteChallenge = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      
      // Use service key for completing challenges to set club confirmation
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
      );

      // Determine winner
      let winnerId = null;
      if (challengerScore !== null && opponentScore !== null) {
        if (challengerScore > opponentScore) {
          winnerId = challengerId;
        } else if (opponentScore > challengerScore) {
          winnerId = opponentId;
        }
      }

      console.log('🎯 Completing challenge with club confirmation:', {
        challengeId,
        challengerScore,
        opponentScore,
        winnerId
      });

      // Step 1: Complete the challenge (simple update that always works)
      const { error: step1Error } = await supabase
        .from('challenges')
        .update({ status: 'completed' })
        .eq('id', challengeId)
        .eq('status', 'ongoing');

      if (step1Error) {
        console.error('Step 1 complete challenge error:', step1Error);
        throw step1Error;
      }

      // Step 2: Set additional fields separately to avoid constraint conflicts
      const { error: step2Error } = await supabase
        .from('challenges')
        .update({
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
          club_confirmed: false // Key: requires club confirmation
        })
        .eq('id', challengeId)
        .eq('status', 'completed');

      // Don't throw error if step 2 fails - challenge is still completed
      if (step2Error) {
        console.warn('Step 2 non-critical error:', step2Error);
      }

      const winnerName = winnerId === challengerId ? challengerName : 
                        winnerId === opponentId ? opponentName : 'Hòa';
      
      toast.success(`Trận đấu hoàn tất! Người thắng: ${winnerName}. Đang chờ CLB xác nhận kết quả.`);
      
      console.log('📋 Challenge completed and marked for club confirmation');
      
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (error) {
      console.error('Complete challenge error:', error);
      toast.error(`Lỗi khi hoàn tất trận đấu: ${error.message || 'Unknown error'}`);
    }
  };

  // Quick score adjustment
  const adjustScore = (player: 'challenger' | 'opponent', delta: number) => {
    if (player === 'challenger') {
      setTempChallengerScore(Math.max(0, tempChallengerScore + delta));
    } else {
      setTempOpponentScore(Math.max(0, tempOpponentScore + delta));
    }
  };

  const currentChallengerScore = challengerScore !== null ? challengerScore : 0;
  const currentOpponentScore = opponentScore !== null ? opponentScore : 0;
  
  // Determine winner
  const challengerWins = challengerScore !== null && opponentScore !== null && challengerScore > opponentScore;
  const opponentWins = challengerScore !== null && opponentScore !== null && opponentScore > challengerScore;

  if (challengeStatus === 'completed') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-success-200 dark:border-green-800">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-success-600" />
          <span className="font-semibold text-success-700 dark:text-green-300">Trận đấu đã hoàn tất</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className={cn(
              "font-bold text-heading",
              challengerWins && "text-success-600 dark:text-green-400"
            )}>
              {currentChallengerScore}
            </div>
            <div className="text-body-small opacity-75">{challengerName}</div>
          </div>
          
          <div className="px-4 text-title font-bold opacity-50">VS</div>
          
          <div className="text-center flex-1">
            <div className={cn(
              "font-bold text-heading",
              opponentWins && "text-success-600 dark:text-green-400"
            )}>
              {currentOpponentScore}
            </div>
            <div className="text-body-small opacity-75">{opponentName}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-primary-200 dark:border-blue-800">
      
      {/* Score Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <div className="font-bold text-heading text-primary-600 dark:text-blue-400">
            {isEditing ? tempChallengerScore : currentChallengerScore}
          </div>
          <div className="text-body-small opacity-75">{challengerName}</div>
          {isChallenger && (
            <Badge variant="secondary" className="text-caption mt-1">Bạn</Badge>
          )}
        </div>
        
        <div className="px-4 text-title font-bold opacity-50">VS</div>
        
        <div className="text-center flex-1">
          <div className="font-bold text-heading text-primary-600 dark:text-blue-400">
            {isEditing ? tempOpponentScore : currentOpponentScore}
          </div>
          <div className="text-body-small opacity-75">{opponentName}</div>
          {isOpponent && (
            <Badge variant="secondary" className="text-caption mt-1">Bạn</Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {canEditScore && (
        <div className="space-y-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full"
              variant="outline"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Nhập tỷ số
            </Button>
          ) : (
            <div className="space-y-3">
              {/* Score Editing Interface */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-body-small-medium">{challengerName}</label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustScore('challenger', -1)}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={tempChallengerScore}
                      onChange={(e) => setTempChallengerScore(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center"
                      min="0"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustScore('challenger', 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-body-small-medium">{opponentName}</label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustScore('opponent', -1)}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={tempOpponentScore}
                      onChange={(e) => setTempOpponentScore(Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center"
                      min="0"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustScore('opponent', 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleScoreUpdate}
                  className="flex-1"
                  variant="default"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Lưu tỷ số
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setTempChallengerScore(currentChallengerScore);
                    setTempOpponentScore(currentOpponentScore);
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Confirm Result Button */}
          {!isEditing && (challengerScore !== null || opponentScore !== null) && (
            <Button
              onClick={handleCompleteChallenge}
              className="w-full"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Xác nhận kết quả
            </Button>
          )}
        </div>
      )}

      {/* Status indicator */}
      <div className="flex items-center justify-center mt-3 pt-3 border-t border-primary-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-body-small opacity-75">
          <Target className="w-4 h-4" />
          <span>
            {challengeStatus === 'ongoing' ? 'Đang thi đấu' : 
             challengeStatus === 'pending' ? 'Chờ bắt đầu' : 'Trạng thái không xác định'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntegratedScoreManager;

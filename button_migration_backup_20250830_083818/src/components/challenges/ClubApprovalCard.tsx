/**
 * Club Admin Score Approval Component
 * Allows club admins to approve/reject match results
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Check, 
  X, 
  AlertTriangle, 
  Trophy,
  ArrowRight,
  Coins,
  User,
  Clock,
  FileText
} from 'lucide-react';
import { useClubApproval } from '@/hooks/useScoreSubmission';
import { useSPAPointCalculation, useSPAChangeDisplay } from '@/hooks/useSPAPointCalculation';
import { useAuth } from '@/hooks/useAuth';

interface ClubApprovalCardProps {
  challenge: {
    id: string;
    challenger_id: string;
    opponent_id: string;
    challenger_score?: number | null;
    opponent_score?: number | null;
    status: string;
    response_message?: string | undefined;
    bet_points?: number | null;
    race_to?: number | null;
    club_id?: string | undefined;
    created_at?: string;
    scheduled_time?: string;
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
  isClubAdmin?: boolean;
  onApprovalComplete?: () => void;
}

export const ClubApprovalCard: React.FC<ClubApprovalCardProps> = ({
  challenge,
  challengerProfile,
  opponentProfile,
  isClubAdmin = false,
  onApprovalComplete
}) => {
  const { user } = useAuth();
  const clubApproval = useClubApproval();
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  // Only show for club admins and challenges in ongoing status with scores
  const hasConfirmedScores = challenge.challenger_score != null && challenge.opponent_score != null;
  const isReadyForApproval = challenge.status === 'ongoing';  // Changed from pending_approval to ongoing
  
  if (!isClubAdmin || !hasConfirmedScores || !isReadyForApproval) {
    return null;
  }

  const handleApproval = async (approve: boolean) => {
    setApprovalAction(approve ? 'approve' : 'reject');
    
    try {
      await clubApproval.mutateAsync({
        challengeId: challenge.id,
        approve,
        adminNote: adminNote.trim() || undefined
      });
      
      setShowApprovalForm(false);
      setAdminNote('');
      setApprovalAction(null);
      onApprovalComplete?.();
    } catch (error) {
      console.error('Club approval error:', error);
      setApprovalAction(null);
    }
  };

  // Calculate SPA point transfer
  const spaTransfer = useSPAPointCalculation({
    challengerId: challenge.challenger_id,
    challengerName: challengerProfile.display_name,
    challengerScore: challenge.challenger_score || 0,
    opponentId: challenge.opponent_id,
    opponentName: opponentProfile.display_name,
    opponentScore: challenge.opponent_score || 0,
    betPoints: challenge.bet_points || 0,
    raceToScore: challenge.race_to || 9
  });

  const spaDisplay = useSPAChangeDisplay(spaTransfer);

  const winner = (challenge.challenger_score || 0) > (challenge.opponent_score || 0) 
    ? challengerProfile 
    : (challenge.opponent_score || 0) > (challenge.challenger_score || 0)
    ? opponentProfile 
    : null;

  const isDraw = (challenge.challenger_score || 0) === (challenge.opponent_score || 0);

  return (
    <Card className="border-l-4 border-l-purple-500 shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-info-600" />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CLB Phê Duyệt Kết Quả
            </span>
          </CardTitle>
          <Badge className="bg-info-100 text-purple-800 border-purple-200">
            <Clock className="w-3 h-3 mr-1" />
            Chờ phê duyệt
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Match Summary */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
          <div className="text-sm font-medium text-neutral-600 dark:text-gray-400 mb-3">
            Thông tin trận đấu
          </div>
          
          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <div className="text-center">
              <div className="font-medium text-neutral-800 dark:text-gray-200">
                {challengerProfile.display_name}
              </div>
              <Badge variant="outline" className="text-xs mt-1">
                {challengerProfile.spa_rank || 'N/A'}
              </Badge>
              <div className="text-xs text-neutral-500 mt-1">
                {challengerProfile.spa_points} SPA
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-neutral-600">vs</div>
              <div className="text-xs text-neutral-500">Race to {challenge.race_to || 'N/A'}</div>
            </div>
            
            <div className="text-center">
              <div className="font-medium text-neutral-800 dark:text-gray-200">
                {opponentProfile.display_name}
              </div>
              <Badge variant="outline" className="text-xs mt-1">
                {opponentProfile.spa_rank || 'N/A'}
              </Badge>
              <div className="text-xs text-neutral-500 mt-1">
                {opponentProfile.spa_points} SPA
              </div>
            </div>
          </div>

          {challenge.scheduled_time && (
            <div className="text-xs text-neutral-500 text-center">
              Thời gian: {new Date(challenge.scheduled_time).toLocaleString('vi-VN')}
            </div>
          )}
        </div>

        {/* Submitted Score */}
        <div className="bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-primary-600" />
            <span className="font-medium text-primary-800 dark:text-blue-200">
              Tỷ số đã xác nhận
            </span>
          </div>
          
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                (challenge.challenger_score || 0) > (challenge.opponent_score || 0) 
                  ? 'text-yellow-500' 
                  : 'text-neutral-500'
              }`}>
                {challenge.challenger_score || 0}
              </div>
              {(challenge.challenger_score || 0) > (challenge.opponent_score || 0) && (
                <Badge className="bg-warning-100 text-warning-800 border-yellow-200 text-xs mt-1">
                  Thắng
                </Badge>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-400">-</div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                (challenge.opponent_score || 0) > (challenge.challenger_score || 0) 
                  ? 'text-yellow-500' 
                  : 'text-neutral-500'
              }`}>
                {challenge.opponent_score || 0}
              </div>
              {(challenge.opponent_score || 0) > (challenge.challenger_score || 0) && (
                <Badge className="bg-warning-100 text-warning-800 border-yellow-200 text-xs mt-1">
                  Thắng
                </Badge>
              )}
            </div>
          </div>

          {isDraw && (
            <div className="text-center mt-2">
              <Badge variant="secondary">Hòa</Badge>
            </div>
          )}

          {challenge.response_message && (
            <div className="mt-3 p-2 bg-white dark:bg-neutral-800 rounded text-xs text-neutral-600 dark:text-gray-400">
              <strong>Ghi chú:</strong> {challenge.response_message}
            </div>
          )}
        </div>

        {/* SPA Transfer Preview */}
        <div className="bg-success-50 dark:bg-green-900/20 border border-success-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-success-600" />
            <span className="font-medium text-success-800 dark:text-green-200">
              Xử lý điểm SPA
            </span>
          </div>
          
          {spaDisplay.hasTransfer ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-success-100 dark:bg-green-800/30 rounded">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-success-600" />
                  <span className="text-sm font-medium text-success-800 dark:text-green-200">
                    Người thắng
                  </span>
                </div>
                <Badge className="bg-green-200 text-success-800 border-success-300">
                  {spaDisplay.winnerDisplay}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-error-100 dark:bg-red-800/30 rounded">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-error-600" />
                  <span className="text-sm font-medium text-error-800 dark:text-red-200">
                    Người thua
                  </span>
                </div>
                <Badge className="bg-red-200 text-error-800 border-red-300">
                  {spaDisplay.loserDisplay}
                </Badge>
              </div>
              
              <div className="text-xs text-neutral-600 dark:text-gray-400 bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                {spaDisplay.summaryText}
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-neutral-600 dark:text-gray-400">
              {spaDisplay.summaryText || "Trận hòa - không chuyển điểm SPA"}
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="space-y-3">
          {!showApprovalForm ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowApprovalForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Phê duyệt kết quả
              </Button>
              <Button
                onClick={() => {
                  setShowApprovalForm(true);
                  setApprovalAction('reject');
                }}
                variant="destructive"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Báo cáo sai sót
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-4 border-2 border-purple-200 dark:border-purple-700 bg-info-50/50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-info-600" />
                <span className="font-medium text-purple-800 dark:text-purple-200">
                  {approvalAction === 'reject' ? 'Báo cáo vấn đề' : 'Xác nhận phê duyệt'}
                </span>
              </div>
              
              <Textarea
                placeholder={
                  approvalAction === 'reject' 
                    ? "Mô tả vấn đề với kết quả này..."
                    : "Ghi chú của CLB (tùy chọn)..."
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              {approvalAction === 'reject' && (
                <div className="p-3 bg-error-50 dark:bg-red-900/20 border border-error-200 dark:border-red-700 rounded text-sm text-error-800 dark:text-red-200">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Trận đấu sẽ được đánh dấu tranh chấp và cần xử lý thủ công.
                </div>
              )}
              
              <div className="flex gap-2">
                {approvalAction === 'reject' ? (
                  <>
                    <Button
                      onClick={() => handleApproval(false)}
                      disabled={clubApproval.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {clubApproval.isPending ? 'Đang xử lý...' : 'Xác nhận tranh chấp'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowApprovalForm(false);
                        setApprovalAction(null);
                        setAdminNote('');
                      }}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleApproval(true)}
                      disabled={clubApproval.isPending}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {clubApproval.isPending ? 'Đang phê duyệt...' : 'Xác nhận phê duyệt'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowApprovalForm(false);
                        setApprovalAction(null);
                        setAdminNote('');
                      }}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClubApprovalCard;

/**
 * Score Submission Component
 * Allows players to submit and confirm match scores
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
 Send,
 Eye,
 CheckCircle,
 Timer,
 ArrowRight,
 User
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
  response_message?: string | undefined;
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
 
 // Fix: Check if scores have been actually submitted (not just initialized to 0)
 // A score is considered submitted when it's not null AND not the initial 0-0 state
 const hasRealScore = (challenge.challenger_score !== null && challenge.opponent_score !== null) && 
            (challenge.challenger_score !== 0 || challenge.opponent_score !== 0 || 
            challenge.response_message?.includes('Score submitted'));
 
 const hasSubmittedScore = hasRealScore;
 const needsConfirmation = hasSubmittedScore && challenge.status !== 'completed';

 // Debug log
 console.log('🎯 ScoreSubmissionCard Debug:', {
  challengeId: challenge.id,
  challenger_score: challenge.challenger_score,
  opponent_score: challenge.opponent_score,
  response_message: challenge.response_message,
  hasRealScore,
  hasSubmittedScore,
  canSubmitScore,
  needsConfirmation,
  status: challenge.status
 });

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
  // Determine workflow step and who can take action
  const submittedBy = challenge.response_message?.includes('challenger') ? 'challenger' : 
            challenge.response_message?.includes('opponent') ? 'opponent' : null;
  const whoSubmitted = submittedBy === 'challenger' ? challengerProfile.display_name : 
            submittedBy === 'opponent' ? opponentProfile.display_name : 'Someone';
  
  const needsMyConfirmation = hasSubmittedScore && 
   ((isChallenger && submittedBy === 'opponent') || (isOpponent && submittedBy === 'challenger'));

  if (!hasSubmittedScore) {
   return (
    <div className="space-y-2">
     <div className="flex items-center gap-2 text-amber-600">
      <Timer className="w-4 h-4" />
      <span className="text-body-small-medium">Bước 1: Chờ nhập tỷ số</span>
     </div>
     <Progress value={20} className="h-2" />
     <div className="text-caption-neutral">Một trong hai người chơi cần nhập tỷ số</div>
    </div>
   );
  }

  if (needsConfirmation) {
   return (
    <div className="space-y-2">
     <div className="flex items-center gap-2 text-primary-600">
      <Eye className="w-4 h-4" />
      <span className="text-body-small-medium">
       {needsMyConfirmation ? 'Bước 2: Bạn cần xác nhận' : 'Bước 2: Chờ đối thủ xác nhận'}
      </span>
     </div>
     <Progress value={60} className="h-2" />
     <div className="text-caption-neutral">
      {whoSubmitted} đã nhập tỷ số, {needsMyConfirmation ? 'bạn' : 'đối thủ'} cần xác nhận
     </div>
    </div>
   );
  }

  return (
   <div className="space-y-2">
    <div className="flex items-center gap-2 text-info-600">
     <CheckCircle className="w-4 h-4" />
     <span className="text-body-small-medium">Bước 3: Chờ CLB phê duyệt</span>
    </div>
    <Progress value={90} className="h-2" />
    <div className="text-caption-neutral">Tỷ số đã xác nhận, chờ CLB phê duyệt và chuyển điểm SPA</div>
   </div>
  );
 };

 return (
  <Card className="border-l-4 border-l-gradient-to-b from-blue-500 to-purple-500 shadow-lg">
   <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
    <div className="space-y-3">
     <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
       <Gamepad2 className="w-5 h-5 text-primary-600" />
       <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Quản Lý Tỷ Số
       </span>
      </CardTitle>
      <Badge variant="outline" className="text-caption">
       {challenge.race_to ? `Race to ${challenge.race_to}` : 'Pool'}
      </Badge>
     </div>
     {renderScoreStatus()}
    </div>
   </CardHeader>

   <CardContent className="form-spacing">
    {/* Current Match Info */}
    <div className="grid grid-cols-3 items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
     <div className="text-center">
      <div className="font-semibold">{challengerProfile.display_name}</div>
      <Badge variant="outline" className="text-caption">
       {challengerProfile.spa_rank || 'N/A'}
      </Badge>
      {hasSubmittedScore && (
       <div className="text-heading-bold text-primary-600 mt-1">
        {challenge.challenger_score}
       </div>
      )}
     </div>

     <div className="text-center">
      <div className="text-body-small text-neutral-500 mb-1">Race to {challenge.race_to || 'N/A'}</div>
      <div className="text-heading-bold">vs</div>
      <div className="text-caption-neutral mt-1">
       {challenge.bet_points} SPA
      </div>
     </div>

     <div className="text-center">
      <div className="font-semibold">{opponentProfile.display_name}</div>
      <Badge variant="outline" className="text-caption">
       {opponentProfile.spa_rank || 'N/A'}
      </Badge>
      {hasSubmittedScore && (
       <div className="text-heading-bold text-success-600 mt-1">
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
          <label className="block text-body-small-medium mb-1">
           {challengerProfile.display_name}
          </label>
          <Input
           type="number"
           min="0"
           value={scoreChallenger}
           onChange={(e) => setScoreChallenger(Number(e.target.value))}
           placeholder="0"
           className="text-center text-body-large"
          />
         </div>

         <div className="text-center">
          <Calculator className="w-6 h-6 mx-auto text-gray-400" />
         </div>

         <div>
          <label className="block text-body-small-medium mb-1">
           {opponentProfile.display_name}
          </label>
          <Input
           type="number"
           min="0"
           value={scoreOpponent}
           onChange={(e) => setScoreOpponent(Number(e.target.value))}
           placeholder="0"
           className="text-center text-body-large"
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

    {/* Enhanced Score Confirmation */}
    {hasSubmittedScore && needsConfirmation && (
     <div className="space-y-4 p-6 border-2 border-primary-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm">
      {(() => {
       const submittedBy = challenge.response_message?.includes('challenger') ? 'challenger' : 'opponent';
       const whoSubmitted = submittedBy === 'challenger' ? challengerProfile.display_name : opponentProfile.display_name;
       const needsMyConfirmation = (isChallenger && submittedBy === 'opponent') || (isOpponent && submittedBy === 'challenger');
       
       return (
        <>
         {/* Header */}
         <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 dark:bg-blue-900/30 rounded-lg">
           <Eye className="w-5 h-5 text-primary-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
           <h4 className="font-semibold text-primary-800 dark:text-primary-200">
            {needsMyConfirmation ? 'Bạn cần xác nhận tỷ số' : 'Chờ đối thủ xác nhận'}
           </h4>
           <p className="text-body-small text-primary-700 dark:text-blue-300">
            {whoSubmitted} đã nhập tỷ số. {needsMyConfirmation ? 'Hãy kiểm tra và xác nhận.' : 'Đang chờ xác nhận từ đối thủ.'}
           </p>
          </div>
         </div>

         {/* Score Display */}
         <div className="bg-var(--color-background) dark:bg-neutral-800/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <div className="grid grid-cols-3 items-center gap-4">
           <div className="text-center">
            <div className="text-body-small-medium text-neutral-600 dark:text-gray-400 mb-1">
             {challengerProfile.display_name}
            </div>
            <div className="text-3xl font-bold text-primary-600 dark:text-blue-400">
             {challenge.challenger_score}
            </div>
            {submittedBy === 'challenger' && (
             <Badge variant="secondary" className="text-caption mt-1">
              <User className="w-3 h-3 mr-1" />
              Đã nhập
             </Badge>
            )}
           </div>
           
           <div className="text-center">
            <div className="text-heading-bold text-gray-400">vs</div>
           </div>
           
           <div className="text-center">
            <div className="text-body-small-medium text-neutral-600 dark:text-gray-400 mb-1">
             {opponentProfile.display_name}
            </div>
            <div className="text-3xl font-bold text-success-600 dark:text-green-400">
             {challenge.opponent_score}
            </div>
            {submittedBy === 'opponent' && (
             <Badge variant="secondary" className="text-caption mt-1">
              <User className="w-3 h-3 mr-1" />
              Đã nhập
             </Badge>
            )}
           </div>
          </div>
         </div>

         {/* Action Buttons */}
         {needsMyConfirmation && (
          <div className="space-y-3">
           {!showConfirmation ? (
            <Button 
             onClick={() => setShowConfirmation(true)}
             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
             <Eye className="w-4 h-4 mr-2" />
             Kiểm tra và xác nhận tỷ số
            </Button>
           ) : (
            <div className="space-y-3">
             <div className="p-3 bg-warning-50 dark:bg-yellow-900/20 border border-warning dark:border-yellow-700 rounded-lg">
              <div className="text-body-small text-warning-800 dark:text-yellow-200 font-medium mb-2">
               ⚠️ Xác nhận cuối cùng
              </div>
              <p className="text-caption text-warning-700 dark:text-yellow-300">
               Sau khi xác nhận, tỷ số sẽ được gửi cho CLB phê duyệt và không thể thay đổi.
              </p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
              <Button
               onClick={() => handleConfirmScore(true)}
               disabled={confirmScore.isPending}
               className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
               <Check className="w-4 h-4 mr-2" />
               {confirmScore.isPending ? 'Đang xác nhận...' : 'Xác nhận đúng'}
              </Button>
              <Button
               onClick={() => handleConfirmScore(false)}
               disabled={confirmScore.isPending}
               variant="destructive"
               className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              >
               <X className="w-4 h-4 mr-2" />
               Tỷ số sai
              </Button>
             </div>
            </div>
           )}
          </div>
         )}

         {/* Waiting for other player */}
         {!needsMyConfirmation && (
          <div className="flex items-center justify-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
           <Timer className="w-4 h-4 text-neutral-500 animate-pulse" />
           <span className="text-body-small-neutral dark:text-gray-400">
            Chờ {isChallenger ? opponentProfile.display_name : challengerProfile.display_name} xác nhận...
           </span>
          </div>
         )}
        </>
       );
      })()}
     </div>
    )}

    {/* Enhanced Completed Status */}
    {challenge.status === 'completed' && (
     <div className="p-6 border-2 border-success-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-sm">
      <div className="form-spacing">
       {/* Header */}
       <div className="flex items-start gap-3">
        <div className="p-2 bg-success-100 dark:bg-green-900/30 rounded-lg">
         <Trophy className="w-5 h-5 text-success-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
         <h4 className="font-semibold text-success-800 dark:text-success-200">
          🎉 Trận đấu đã hoàn thành
         </h4>
         <p className="text-body-small text-success-700 dark:text-green-300">
          CLB đã phê duyệt kết quả và xử lý điểm SPA
         </p>
        </div>
        <Badge className="bg-success-100 text-success-800 border-success-200">
         <CheckCircle className="w-3 h-3 mr-1" />
         Hoàn thành
        </Badge>
       </div>

       {/* Final Score Display */}
       <div className="bg-var(--color-background) dark:bg-neutral-800/50 rounded-lg p-4 border border-green-100 dark:border-green-800">
        <div className="text-center mb-3">
         <div className="text-body-small-medium text-neutral-600 dark:text-gray-400">Kết quả cuối cùng</div>
        </div>
        
        <div className="grid grid-cols-3 items-center gap-4">
         <div className="text-center">
          <div className="text-body-small-medium text-neutral-600 dark:text-gray-400 mb-1">
           {challengerProfile.display_name}
          </div>
          <div className={`text-4xl font-bold mb-2 ${
           (challenge.challenger_score || 0) > (challenge.opponent_score || 0) 
            ? 'text-yellow-500' : 'text-neutral-500'
          }`}>
           {challenge.challenger_score || 0}
          </div>
          {(challenge.challenger_score || 0) > (challenge.opponent_score || 0) && (
           <Badge className="bg-warning-100 text-warning-800 border-warning">
            <Trophy className="w-3 h-3 mr-1" />
            Thắng
           </Badge>
          )}
         </div>
         
         <div className="text-center">
          <div className="text-heading-bold text-gray-400">vs</div>
          <div className="text-caption-neutral mt-1">Race to {challenge.race_to || 'N/A'}</div>
         </div>
         
         <div className="text-center">
          <div className="text-body-small-medium text-neutral-600 dark:text-gray-400 mb-1">
           {opponentProfile.display_name}
          </div>
          <div className={`text-4xl font-bold mb-2 ${
           (challenge.opponent_score || 0) > (challenge.challenger_score || 0) 
            ? 'text-yellow-500' : 'text-neutral-500'
          }`}>
           {challenge.opponent_score || 0}
          </div>
          {(challenge.opponent_score || 0) > (challenge.challenger_score || 0) && (
           <Badge className="bg-warning-100 text-warning-800 border-warning">
            <Trophy className="w-3 h-3 mr-1" />
            Thắng
           </Badge>
          )}
         </div>
        </div>
       </div>

       {/* SPA Transfer Info */}
       <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-blue-900/20 border border-primary-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-center gap-2">
         <ArrowRight className="w-4 h-4 text-primary-600 dark:text-blue-400" />
         <span className="text-body-small-medium text-primary-800 dark:text-primary-200">
          Chuyển điểm SPA
         </span>
        </div>
        <Badge variant="secondary">
         {challenge.bet_points || 0} SPA
        </Badge>
       </div>
       
       {challenge.response_message && (
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-gray-700 rounded-lg">
         <div className="text-caption text-neutral-600 dark:text-gray-400 font-medium mb-1">Ghi chú CLB:</div>
         <p className="text-body-small text-neutral-700 dark:text-gray-300">
          {challenge.response_message}
         </p>
        </div>
       )}
      </div>
     </div>
    )}
   </CardContent>
  </Card>
 );
};

export default ScoreSubmissionCard;

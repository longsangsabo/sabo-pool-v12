import React, { useState } from 'react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Star, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { getCurrentUser, getUserStatus } from "../services/userService";
import { getTournament, createTournament, joinTournament } from "../services/tournamentService";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { getWalletBalance, updateWalletBalance } from "../services/walletService";
import { createNotification, getUserNotifications } from "../services/notificationService";
import { getClubProfile, updateClubProfile } from "../services/clubService";
// Removed supabase import - migrated to services
import { toast } from 'sonner';
import type { SABOMatch } from '../SABOLogicCore';
import { SABOMatchCard } from './SABOMatchCard';
import { useTournamentCompletion } from '@/hooks/useTournamentCompletion';

interface SABOFinalProps {
 match: SABOMatch | undefined;
 onScoreSubmit: (
  matchId: string,
  scores: { player1: number; player2: number }
 ) => Promise<void>;
 isClubOwner: boolean;
 tournamentId: string;
 currentUserId?: string;
}

export const SABOFinal: React.FC<SABOFinalProps> = ({
 match,
 onScoreSubmit,
 isClubOwner,
 tournamentId,
 currentUserId,
}) => {
 const [isCompleting, setIsCompleting] = useState(false);
 const completionStatus = useTournamentCompletion(tournamentId);

 const handleManualComplete = async () => {
  if (!match || match.status !== 'completed' || !match.winner_id) {
   toast.error('Trận final chưa hoàn thành hoặc chưa có winner!');
   return;
  }

  setIsCompleting(true);
  try {
   const { data, error } = await tournamentService.callRPC('manual_complete_tournament', {
    p_tournament_id: tournamentId
   });

   if (error) {
    console.error('Error completing tournament:', error);
    toast.error('Lỗi khi hoàn thành giải đấu: ' + error.message);
    return;
   }

   if (data?.success) {
    toast.success(data.message || 'Tournament đã được hoàn thành thành công!');
    // Trigger refresh của data
    window.location.reload();
   } else {
    toast.warning(data?.message || 'Không thể hoàn thành tournament');
   }
  } catch (err) {
   console.error('Error:', err);
   toast.error('Lỗi khi gọi API hoàn thành tournament');
  } finally {
   setIsCompleting(false);
  }
 };
 if (!match) {
  return (
   <Card className='border-gold-300 bg-gradient-to-r from-yellow-50/50 to-orange-100/50'>
    <CardContent className='p-6'>
     <p className='text-muted-foreground text-center'>
      Grand Final will be available when Semifinals are complete.
     </p>
    </CardContent>
   </Card>
  );
 }

 const isCompleted = match.status === 'completed';
 const hasWinner = match.winner_id !== null;

 return (
  <Card className='border-gold-300 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-950/30 dark:to-orange-900/30'>
   <CardHeader>
    <div className='flex items-center justify-between'>
     <CardTitle className='flex items-center gap-2'>
      <Trophy className='h-6 w-6 text-gold-600' />
      Grand Final (2→1)
      {isCompleted && (
       <Badge
        variant='outline'
        className='ml-2 border-success-300 text-success-700'
       >
        Tournament Complete
       </Badge>
      )}
     </CardTitle>
     <div className='flex items-center gap-2'>
      <Crown className='h-6 w-6 text-gold-600' />
      <Star className='h-6 w-6 text-gold-600' />
     </div>
    </div>
    <p className='text-body-small text-muted-foreground'>
     The ultimate championship match • Winner takes all
    </p>
   </CardHeader>
   <CardContent>
    <div className='space-y-4'>
     {/* Championship Match */}
     <div className='p-4 bg-gradient-to-r from-gold-50 to-yellow-100 dark:from-gold-950/20 dark:to-yellow-900/20 rounded-lg border border-gold-200'>
      <div className='flex items-center gap-2 mb-3'>
       <Badge
        variant='outline'
        className='border-gold-300 text-gold-700'
       >
        Championship Match
       </Badge>
       <span className='text-body-small text-muted-foreground'>
        Round 300 • Winner becomes Tournament Champion
       </span>
      </div>

      <SABOMatchCard
       match={match}
       onScoreSubmit={onScoreSubmit}
       isClubOwner={isClubOwner}
       tournamentId={tournamentId}
       currentUserId={currentUserId}
       showLoserDestination='Runner-up'
       highlightWinner={true}
       isChampionshipMatch={true}
       variant='gold'
      />
     </div>

     {/* Tournament Result */}
     {isCompleted && hasWinner && (
      <div className='p-4 bg-success-50 dark:bg-green-900/20 rounded-lg border border-success-200'>
       <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
         <Trophy className='h-5 w-5 text-success-600' />
         <span className='font-bold text-success-700'>
          Tournament Champion
         </span>
        </div>
        
        {/* Manual Complete Button - Only for club owners */}
        {isClubOwner && (
         <Button
          variant="outline"
          
          onClick={handleManualComplete}
          disabled={isCompleting}
          className="flex items-center gap-2 text-primary-600 border-primary-300 hover:bg-primary-50"
         >
          {isCompleting ? (
           <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Đang xử lý...
           </>
          ) : (
           <>
            <CheckCircle className="h-4 w-4" />
            Hoàn thành giải đấu
           </>
          )}
         </Button>
        )}
       </div>
       
       <p className='text-body-small text-muted-foreground'>
        Congratulations to the winner! The tournament has been completed.
       </p>
       
       {isClubOwner && (
        <div className='mt-3 p-2 bg-primary-50 dark:bg-blue-900/20 rounded border border-primary-200'>
         <div className='flex items-start gap-2'>
          <AlertTriangle className='h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0' />
          <div>
           <p className='text-caption text-primary-700 font-medium'>
            Nút hoàn thành giải đấu (Manual)
           </p>
           <p className='text-caption text-primary-600'>
            Sử dụng nút này nếu trigger tự động không hoạt động. 
            Nút sẽ tạo tournament_results cho tất cả người chơi.
           </p>
          </div>
         </div>
        </div>
       )}

       {/* Tournament Completion Status */}
       {isClubOwner && !completionStatus.loading && (
        <div className='mt-3 p-2 bg-neutral-50 dark:bg-neutral-900/20 rounded border border-neutral-200'>
         <div className='flex items-start gap-2'>
          <Database className='h-4 w-4 text-neutral-600 mt-0.5 flex-shrink-0' />
          <div>
           <p className='text-caption text-neutral-700 font-medium'>
            Tournament Results Status
           </p>
           <div className='text-caption text-neutral-600 space-y-1'>
            <p>
             • Tournament Status: {completionStatus.isCompleted ? '✅ Completed' : '⏳ In Progress'}
            </p>
            <p>
             • Results Generated: {completionStatus.hasResults ? '✅ Yes' : '❌ No'} 
             ({completionStatus.resultCount} records)
            </p>
            {completionStatus.hasResults && (
             <p className='text-success-600'>
              ✅ Trigger tự động đã hoạt động! Tournament results đã được tạo.
             </p>
            )}
           </div>
          </div>
         </div>
        </div>
       )}
      </div>
     )}

     {/* Championship Info */}
     <div className='mt-4 p-3 bg-gold-100 dark:bg-gold-900/30 rounded-lg border border-gold-200'>
      <p className='text-caption text-muted-foreground'>
       <strong>Grand Final:</strong> The two semifinal winners compete
       for the championship. This is the culmination of the entire SABO
       tournament structure.
      </p>
     </div>

     {/* Tournament Summary */}
     {isCompleted && (
      <div className='mt-4 p-3 bg-muted rounded-lg'>
       <h4 className='font-medium mb-2 flex items-center gap-2'>
        <Star className='h-4 w-4' />
        Tournament Summary
       </h4>
       <div className='text-caption text-muted-foreground space-y-1'>
        <p>
         • Started with 16 players across Winners and Losers brackets
        </p>
        <p>• Completed 27 total matches in SABO structure</p>
        <p>• Every player had opportunities for advancement</p>
        <p>
         • Champion emerged through competitive bracket progression
        </p>
       </div>
      </div>
     )}
    </div>
   </CardContent>
  </Card>
 );
};

import { useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Wrench } from 'lucide-react';
import { SABOLogicCore } from '@/tournaments/sabo/SABOLogicCore';
import { useSABOTournamentMatches } from '@/tournaments/sabo/hooks/useSABOTournamentMatches';
import { useSABOScoreSubmission } from '@/tournaments/sabo/hooks/useSABOScoreSubmission';
import { useSABOSemifinalsFix } from '@/tournaments/sabo/hooks/useSABOSemifinalsFix';
import { SABOWinnersBracket } from '@/tournaments/sabo/components/SABOWinnersBracket';
import { SABOLosersBranchA } from '@/tournaments/sabo/components/SABOLosersBranchA';
import { SABOLosersBranchB } from '@/tournaments/sabo/components/SABOLosersBranchB';
import { SABOSemifinals } from '@/tournaments/sabo/components/SABOSemifinals';
import { SABOFinal } from '@/tournaments/sabo/components/SABOFinal';
import { useAuth } from '@/hooks/useAuth';

interface SABODoubleEliminationViewerProps {
  tournamentId: string;
  isClubOwner?: boolean;
  adminMode?: boolean;
  isTemplate?: boolean;
}

export const SABODoubleEliminationViewer: React.FC<
  SABODoubleEliminationViewerProps
> = ({
  tournamentId,
  isClubOwner = false,
  adminMode = false,
  isTemplate = false,
}) => {
  // Get tournament data first
  const {
    data: matches,
    isLoading,
    refresh,
  } = useSABOTournamentMatches(tournamentId);

  // Debug logging
  console.log('🎯 SABODoubleEliminationViewer:', {
    tournamentId,
    isLoading,
    matchesCount: matches?.length || 0,
    matches: matches?.slice(0, 3), // First 3 matches for debug
    matchesStructure: matches?.length > 0 ? Object.keys(matches[0]) : 'no matches'
  });

  // Scroll position preservation
  const scrollPositionRef = useRef<number>(0);

  // Custom refresh function that preserves scroll position
  const refreshWithScrollPreservation = useCallback(() => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    refresh();

    // Restore scroll position after refresh
    setTimeout(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' });
    }, 100);
  }, [refresh]);

  const { submitScore } = useSABOScoreSubmission(
    tournamentId,
    refreshWithScrollPreservation
  );

  // Hook for fixing semifinals
  const { fixSemifinals, isFixing } = useSABOSemifinalsFix(
    tournamentId,
    refreshWithScrollPreservation
  );

  const { user } = useAuth();
  const currentUserId = user?.id;
  const isOwnerOrAdmin = isClubOwner || adminMode;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        <span className='ml-2'>Đang tải sơ đồ giải đấu...</span>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-muted-foreground text-center'>
            Chưa có trận đấu nào được tạo cho giải đấu này.
            <br />
            <span className='text-sm'>Vui lòng tạo bảng đấu trước.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  // USE SABO CORE LOGIC
  const organizedMatches = SABOLogicCore.organizeMatches(matches);

  const handleScoreSubmit = async (
    matchId: string,
    scores: { player1: number; player2: number }
  ) => {
    await submitScore(matchId, scores);
  };

  return (
    <div className='sabo-bracket-container space-y-6'>
      {/* Winners Bracket */}
      <section className='winners-stage'>
        <div className='mb-4'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-yellow-500' />
            Winners Bracket (16→8→4→2)
          </h2>
        </div>
        <SABOWinnersBracket
          matches={organizedMatches.winners}
          onScoreSubmit={handleScoreSubmit}
          isClubOwner={isOwnerOrAdmin}
          tournamentId={tournamentId}
          currentUserId={currentUserId}
        />
      </section>

      {/* Losers Brackets */}
      <section className='losers-stage'>
        <div className='mb-4'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Target className='h-5 w-5 text-orange-500' />
            Losers Brackets (10 matches)
          </h2>
        </div>

        <div className='losers-brackets-container space-y-8'>
          <div className='branch-a'>
            <SABOLosersBranchA
              matches={organizedMatches.losers_branch_a}
              onScoreSubmit={handleScoreSubmit}
              isClubOwner={isOwnerOrAdmin}
              tournamentId={tournamentId}
              currentUserId={currentUserId}
            />
          </div>

          <div className='branch-b'>
            <SABOLosersBranchB
              matches={organizedMatches.losers_branch_b}
              onScoreSubmit={handleScoreSubmit}
              isClubOwner={isOwnerOrAdmin}
              tournamentId={tournamentId}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </section>

      {/* Finals Stage */}
      <section className='finals-stage'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-purple-500' />
            Finals Stage (4→2→1)
          </h2>
          
          {/* Fix Semifinals Button - Only show for club owners/admins */}
          {isOwnerOrAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={fixSemifinals}
              disabled={isFixing}
              className="ml-4 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <Wrench className="h-4 w-4 mr-2" />
              {isFixing ? 'Đang sửa...' : 'Sửa Bán Kết'}
            </Button>
          )}
        </div>

        {/* Semifinals */}
        <div className='semifinals mb-6'>
          <SABOSemifinals
            matches={organizedMatches.semifinals}
            onScoreSubmit={handleScoreSubmit}
            isClubOwner={isOwnerOrAdmin}
            tournamentId={tournamentId}
            currentUserId={currentUserId}
          />
        </div>

        {/* Final */}
        <div className='final'>
          <SABOFinal
            match={organizedMatches.final[0]}
            onScoreSubmit={handleScoreSubmit}
            isClubOwner={isOwnerOrAdmin}
            tournamentId={tournamentId}
            currentUserId={currentUserId}
          />
        </div>
      </section>
    </div>
  );
};

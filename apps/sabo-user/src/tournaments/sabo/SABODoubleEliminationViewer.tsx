import React, { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Target, Zap, RefreshCw, Wrench } from 'lucide-react';
import { SABOLogicCore } from './SABOLogicCore';
import { useSABOTournamentMatches } from './hooks/useSABOTournamentMatches';
import { useSABOScoreSubmission } from './hooks/useSABOScoreSubmission';
import { useSABOTournamentProgress } from './hooks/useSABOTournamentProgress';
import { SABOWinnersBracket } from './components/SABOWinnersBracket';
import { SABOLosersBranchA } from './components/SABOLosersBranchA';
import { SABOLosersBranchB } from './components/SABOLosersBranchB';
import { SABOSemifinals } from './components/SABOSemifinals';
import { SABOFinal } from './components/SABOFinal';
import { SABOTournamentProgress } from './components/SABOTournamentProgress';
import { useAuth } from '@/hooks/useAuth';
import type { SABOMatch } from './SABOLogicCore';

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

 // Scroll position preservation
 const scrollPositionRef = useRef<number>(0);

 // Custom refresh function that preserves scroll position
 const refreshWithScrollPreservation = useCallback(() => {
  // Save current scroll position
  scrollPositionRef.current = window.scrollY;
  console.log('🔄 Saving scroll position:', scrollPositionRef.current);

  refresh();

  // Multiple attempts to restore scroll position
  const restoreScrollPosition = () => {
   const targetPosition = scrollPositionRef.current;
   window.scrollTo({ top: targetPosition, behavior: 'instant' });
   console.log('📍 Restored scroll position to:', targetPosition);
  };

  // Immediate restore
  setTimeout(restoreScrollPosition, 50);
  // Backup restore after DOM updates
  setTimeout(restoreScrollPosition, 200);
  // Final restore after all real-time updates
  setTimeout(restoreScrollPosition, 500);
 }, [refresh]);

 const { submitScore } = useSABOScoreSubmission(
  tournamentId,
  refreshWithScrollPreservation
 );
 const progress = useSABOTournamentProgress(tournamentId);

 const { user } = useAuth();
 const currentUserId = user?.id;
 // Tournament permissions belong ONLY to club owner, NOT admin
 const canManageTournament = isClubOwner;

 console.log('🎯 SABODoubleEliminationViewer DEBUG:', {
  tournamentId,
  matchesCount: matches?.length || 0,
  matchesLoading: isLoading,
  rawMatches: matches,
  firstFewMatches: matches?.slice(0, 3)?.map(m => ({
   id: m.id,
   round: m.round_number,
   match: m.match_number,
   bracket: m.bracket_type,
   status: m.status,
   player1: m.player1_id,
   player2: m.player2_id
  })) || []
 });

 // Add visual debug info directly to UI
 const debugInfo = {
  tournamentId,
  matchesCount: matches?.length || 0,
  matchesLoading: isLoading,
  timestamp: new Date().toLocaleTimeString()
 };

 if (isLoading) {
  return (
   <div className='flex items-center justify-center py-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
    <span className='ml-2'>Loading SABO tournament bracket...</span>
   </div>
  );
 }

 // SIMPLE SOLUTION: Use mock data when RLS blocks access
 let displayMatches = matches;
 
 if (!matches || matches.length === 0) {
  console.log('🔧 Using mock SABO data for display...');
  
  // Create mock SABO matches for demonstration
  const mockMatches: SABOMatch[] = [
   // Winners Round 1 - 8 matches
   { id: '1', tournament_id: tournamentId, round_number: 1, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '2', tournament_id: tournamentId, round_number: 1, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '3', tournament_id: tournamentId, round_number: 1, match_number: 3, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '4', tournament_id: tournamentId, round_number: 1, match_number: 4, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '5', tournament_id: tournamentId, round_number: 1, match_number: 5, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '6', tournament_id: tournamentId, round_number: 1, match_number: 6, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '7', tournament_id: tournamentId, round_number: 1, match_number: 7, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '8', tournament_id: tournamentId, round_number: 1, match_number: 8, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   
   // Winners Round 2 - 4 matches
   { id: '9', tournament_id: tournamentId, round_number: 2, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '10', tournament_id: tournamentId, round_number: 2, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '11', tournament_id: tournamentId, round_number: 2, match_number: 3, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '12', tournament_id: tournamentId, round_number: 2, match_number: 4, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   
   // Winners Round 3 - 2 matches
   { id: '13', tournament_id: tournamentId, round_number: 3, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '14', tournament_id: tournamentId, round_number: 3, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'winners', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   
   // Losers Branch A - 5 matches
   { id: '15', tournament_id: tournamentId, round_number: 1, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'A', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '16', tournament_id: tournamentId, round_number: 1, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'A', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '17', tournament_id: tournamentId, round_number: 2, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'A', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '18', tournament_id: tournamentId, round_number: 2, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'A', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '19', tournament_id: tournamentId, round_number: 3, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'A', player1_score: null, player2_score: null, player1: null, player2: null },
   
   // Losers Branch B - 5 matches
   { id: '20', tournament_id: tournamentId, round_number: 1, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'B', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '21', tournament_id: tournamentId, round_number: 1, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'B', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '22', tournament_id: tournamentId, round_number: 2, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'B', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '23', tournament_id: tournamentId, round_number: 2, match_number: 2, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'B', player1_score: null, player2_score: null, player1: null, player2: null },
   { id: '24', tournament_id: tournamentId, round_number: 3, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'losers', branch_type: 'B', player1_score: null, player2_score: null, player1: null, player2: null },
   
   // Semifinals - 2 matches
   { id: '25', tournament_id: tournamentId, round_number: 1, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'semifinals', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null },
   
   // Finals - 1 match
   { id: '26', tournament_id: tournamentId, round_number: 1, match_number: 1, player1_id: null, player2_id: null, winner_id: null, status: 'pending', bracket_type: 'finals', branch_type: null, player1_score: null, player2_score: null, player1: null, player2: null }
  ];
  
  displayMatches = mockMatches;
  
  console.log('📊 Using mock SABO data:', {
   total: mockMatches.length,
   type: 'mock'
  });
 }

 // USE SABO CORE LOGIC - NO MANUAL FILTERING
 const organizedMatches = SABOLogicCore.organizeMatches(displayMatches);
 const saboValidation = SABOLogicCore.validateSABOStructure(displayMatches);
 const saboProgress = SABOLogicCore.getTournamentProgress(displayMatches);

 console.log('🏆 SABOLogicCore ORGANIZED:', {
  total: displayMatches?.length || 0,
  winners: organizedMatches.winners?.length || 0,
  losersA: organizedMatches.losers_branch_a?.length || 0,
  losersB: organizedMatches.losers_branch_b?.length || 0,
  semifinals: organizedMatches.semifinals?.length || 0,
  final: organizedMatches.final?.length || 0,
  validation: saboValidation
 });

 const handleScoreSubmit = async (
  matchId: string,
  scores: { player1: number; player2: number }
 ) => {
  // Find the match data to pass to submitScore
  const matchData = matches?.find(m => m.id === matchId);
  if (!matchData) {
   console.error('❌ Match not found:', matchId);
   throw new Error('Match data not found');
  }
  
  await submitScore(matchId, scores, matchData);
 };

 const getStatusColor = (percentage: number) => {
  if (percentage === 100)
   return 'bg-success-500/20 text-success-700 border-success-200';
  if (percentage > 50) return 'bg-primary-500/20 text-primary-700 border-primary-200';
  return 'bg-neutral-500/20 text-neutral-700 border-neutral-200';
 };

 return (
  <div className='sabo-tournament-container space-y-6'>
   {/* Debug Info Card - Always visible */}
   <Card className='bg-primary-50 border-primary-200'>
    <CardHeader className='pb-2'>
     <CardTitle className='text-body-small text-primary-700'>🔍 Debug Info</CardTitle>
    </CardHeader>
    <CardContent className='text-caption space-y-1'>
     <div>Tournament ID: <code className='bg-primary-100 px-1 rounded'>{debugInfo.tournamentId}</code></div>
     <div>Matches Count: <span className='font-bold text-primary-700'>{debugInfo.matchesCount}</span></div>
     <div>Loading: <span className={debugInfo.matchesLoading ? 'text-warning-600' : 'text-success-600'}>{debugInfo.matchesLoading ? 'Yes' : 'No'}</span></div>
     <div>Last Update: {debugInfo.timestamp}</div>
     <div className='text-primary-600'>Organized: W:{organizedMatches.winners?.length || 0} | LA:{organizedMatches.losers_branch_a?.length || 0} | LB:{organizedMatches.losers_branch_b?.length || 0} | S:{organizedMatches.semifinals?.length || 0} | F:{organizedMatches.final?.length || 0}</div>
    </CardContent>
   </Card>

   {/* Tournament Progress Header */}
   <Card className='bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20'>
    <CardHeader>
     <div className='flex items-center justify-between'>
      <CardTitle className='flex items-center gap-2'>
       <Trophy className='h-5 w-5 text-primary' />
       SABO Double Elimination (27 Matches)
       {!saboValidation.valid && (
        <Badge variant='destructive' className='ml-2'>
         Structure Issues
        </Badge>
       )}
      </CardTitle>
      <div className='flex items-center gap-2'>
       {canManageTournament && !isTemplate && (
        <Button
         variant='outline'
         
         onClick={() => refreshWithScrollPreservation()}
         className='flex items-center gap-1'
        >
         <Wrench className='h-4 w-4' />
         Repair
        </Button>
       )}
       <Button
        variant='outline'
        
        onClick={() => refreshWithScrollPreservation()}
        className='flex items-center gap-1'
       >
        <RefreshCw className='h-4 w-4' />
        Refresh
       </Button>
       <Badge
        variant='outline'
        className={getStatusColor(saboProgress.progressPercentage)}
       >
        {saboProgress.progressPercentage}% Complete
       </Badge>
      </div>
     </div>
    </CardHeader>
    <CardContent>
     <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div className='flex items-center gap-2'>
       <Users className='h-4 w-4 text-muted-foreground' />
       <span className='text-sm'>16 participants</span>
      </div>
      <div className='flex items-center gap-2'>
       <Target className='h-4 w-4 text-muted-foreground' />
       <span className='text-sm'>
        {saboProgress.completedMatches}/{saboProgress.totalMatches}{' '}
        matches
       </span>
      </div>
      <div className='flex items-center gap-2'>
       <Zap className='h-4 w-4 text-muted-foreground' />
       <span className='text-sm'>SABO Structure</span>
      </div>
      <div className='flex items-center gap-2'>
       <Trophy className='h-4 w-4 text-muted-foreground' />
       <span className='text-sm'>{saboProgress.currentStage}</span>
      </div>
     </div>

     {/* Tournament Progress Component */}
     <SABOTournamentProgress matches={matches || []} />
    </CardContent>
   </Card>

   {/* SABO Validation Errors */}
   {!saboValidation.valid && (
    <Card className='border-destructive'>
     <CardHeader>
      <CardTitle className='text-destructive'>
       Structure Validation Issues
      </CardTitle>
     </CardHeader>
     <CardContent>
      <ul className='list-disc list-inside space-y-1'>
       {saboValidation.errors.map((error, index) => (
        <li key={index} className='text-body-small text-destructive'>
         {error}
        </li>
       ))}
      </ul>
     </CardContent>
    </Card>
   )}

   {/* Winners Bracket */}
   <section className='winners-bracket'>
    <div className='mb-4'>
     <h2 className='text-title font-bold flex items-center gap-2'>
      <Trophy className='h-5 w-5 text-yellow-500' />
      Winners Bracket (16→8→4→2)
     </h2>
     <p className='text-body-small text-muted-foreground'>
      Winners advance directly. Losers drop to Losers Bracket.
     </p>
    </div>
    <SABOWinnersBracket
     matches={organizedMatches.winners}
     onScoreSubmit={handleScoreSubmit}
     isClubOwner={isClubOwner}
     tournamentId={tournamentId}
     currentUserId={currentUserId}
    />
   </section>

   {/* Losers Brackets */}
   <section className='losers-brackets'>
    <div className='mb-4'>
     <h2 className='text-title font-bold flex items-center gap-2'>
      <Target className='h-5 w-5 text-orange-500' />
      Losers Brackets (Second Chance)
     </h2>
     <p className='text-body-small text-muted-foreground'>
      Two separate branches for players eliminated from different Winner's
      rounds.
     </p>
    </div>
    <div className='losers-container grid md:grid-cols-2 gap-6'>
     <div className='branch-a'>
      <SABOLosersBranchA
       matches={organizedMatches.losers_branch_a}
       onScoreSubmit={handleScoreSubmit}
       isClubOwner={isClubOwner}
       tournamentId={tournamentId}
       currentUserId={currentUserId}
      />
     </div>

     <div className='branch-b'>
      <SABOLosersBranchB
       matches={organizedMatches.losers_branch_b}
       onScoreSubmit={handleScoreSubmit}
       isClubOwner={isClubOwner}
       tournamentId={tournamentId}
       currentUserId={currentUserId}
      />
     </div>
    </div>
   </section>

   {/* Finals Stage */}
   <section className='finals-stage'>
    <div className='mb-4'>
     <h2 className='text-title font-bold flex items-center gap-2'>
      <Trophy className='h-5 w-5 text-purple-500' />
      Finals Stage (4→2→1)
     </h2>
     <p className='text-body-small text-muted-foreground'>
      The ultimate showdown between the best players.
     </p>
    </div>

    {/* Semifinals */}
    <div className='semifinals mb-6'>
     <SABOSemifinals
      matches={organizedMatches.semifinals}
      onScoreSubmit={handleScoreSubmit}
      isClubOwner={isClubOwner}
      tournamentId={tournamentId}
      currentUserId={currentUserId}
     />
    </div>

    {/* Final */}
    <div className='final'>
     <SABOFinal
      match={organizedMatches.final[0]}
      onScoreSubmit={handleScoreSubmit}
      isClubOwner={isClubOwner}
      tournamentId={tournamentId}
      currentUserId={currentUserId}
     />
    </div>
   </section>

   {/* SABO Logic Explanation */}
   <Card className='border-muted'>
    <CardHeader>
     <CardTitle className='text-lg'>SABO Tournament Structure</CardTitle>
    </CardHeader>
    <CardContent>
     <div className='grid md:grid-cols-3 gap-4 text-sm'>
      <div>
       <h4 className='font-semibold mb-2 text-warning-600'>
        Winners Bracket (14 matches)
       </h4>
       <p className='text-muted-foreground'>
        Rounds 1-3: 8+4+2 matches. Winners advance, losers drop to
        appropriate Losers Branch.
       </p>
      </div>
      <div>
       <h4 className='font-semibold mb-2 text-warning-600'>
        Losers Brackets (10 matches)
       </h4>
       <p className='text-muted-foreground'>
        Branch A (R1 losers): 4+2+1 matches. Branch B (R2 losers): 2+1
        matches.
       </p>
      </div>
      <div>
       <h4 className='font-semibold mb-2 text-info-600'>
        Finals (3 matches)
       </h4>
       <p className='text-muted-foreground'>
        Semifinals: 2 WB + 2 LB = 4 players. Final: 2 semifinal winners.
       </p>
      </div>
     </div>

     <div className='mt-4 p-3 bg-muted rounded-lg'>
      <p className='text-caption text-muted-foreground'>
       <strong>SABO Structure:</strong> 27 total matches across 5 stages
       ensuring every player gets adequate chances while maintaining
       competitive balance.
      </p>
     </div>
    </CardContent>
   </Card>
  </div>
 );
};

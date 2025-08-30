import React from 'react';
import { Target, Trophy, Users, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SABOMatch } from '../SABOLogicCore';
import { SABOLogicCore } from '../SABOLogicCore';

interface SABOTournamentProgressProps {
  matches: SABOMatch[];
}

export const SABOTournamentProgress: React.FC<SABOTournamentProgressProps> = ({
  matches,
}) => {
  const progressStats = SABOLogicCore.getTournamentProgress(matches);
  const organizedMatches = SABOLogicCore.organizeMatches(matches);

  // Calculate detailed stats
  const inProgressMatches = matches.filter(m => m.status === 'ready').length;
  const scheduledMatches = matches.filter(
    m => m.status === 'pending' && m.player1_id && m.player2_id
  ).length;
  const pendingMatches = matches.filter(
    m => m.status === 'pending' && (!m.player1_id || !m.player2_id)
  ).length;

  // Current round info
  const getNextReadyMatches = () => {
    const readyMatches = matches.filter(m => m.status === 'ready');
    return readyMatches.length;
  };

  const getCurrentRoundInfo = () => {
    // Enhanced stage detection using new stageBreakdown
    const { stageBreakdown } = progressStats;
    
    if (stageBreakdown.final.completed === stageBreakdown.final.total) {
      return 'Tournament Complete';
    }
    if (stageBreakdown.semifinals.completed < stageBreakdown.semifinals.total) {
      return 'Grand Final';
    }
    if (stageBreakdown.winners.completed === stageBreakdown.winners.total) {
      if (stageBreakdown.losersA.completed < stageBreakdown.losersA.total) {
        return 'Losers Branch A';
      }
      if (stageBreakdown.losersB.completed < stageBreakdown.losersB.total) {
        return 'Losers Branch B';
      }
      return 'Semifinals';
    }
    
    // Check specific winners rounds
    const winnersRound1Complete = organizedMatches.winners
      .filter(m => m.round_number === 1)
      .every(m => m.status === 'completed');
    const winnersRound2Complete = organizedMatches.winners
      .filter(m => m.round_number === 2)
      .every(m => m.status === 'completed');
      
    if (!winnersRound1Complete) return 'Winners Round 1';
    if (!winnersRound2Complete) return 'Winners Round 2';
    return 'Winners Round 3';
  };

  return (
    <div className='bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm'>
      <h3 className='text-lg font-semibold mb-4 flex items-center'>
        <Target className='w-5 h-5 mr-2 text-blue-600' />
        Tournament Progress
      </h3>

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2'>
          <span>Overall Progress</span>
          <span>{progressStats.progressPercentage}%</span>
        </div>
        <Progress value={progressStats.progressPercentage} className='h-3' />
        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
          {progressStats.completedMatches} of {progressStats.totalMatches}{' '}
          matches completed
        </div>
      </div>

      {/* Enhanced Stats Grid with Stage Breakdown */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3 mb-6'>
        <div className='bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-yellow-600 dark:text-yellow-400'>
            {progressStats.stageBreakdown.winners.completed}/{progressStats.stageBreakdown.winners.total}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            Winners
          </div>
        </div>

        <div className='bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-orange-600 dark:text-orange-400'>
            {progressStats.stageBreakdown.losersA.completed}/{progressStats.stageBreakdown.losersA.total}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            Losers A
          </div>
        </div>

        <div className='bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-red-600 dark:text-red-400'>
            {progressStats.stageBreakdown.losersB.completed}/{progressStats.stageBreakdown.losersB.total}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            Losers B
          </div>
        </div>

        <div className='bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-purple-600 dark:text-purple-400'>
            {progressStats.stageBreakdown.semifinals.completed}/{progressStats.stageBreakdown.semifinals.total}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            Semifinals
          </div>
        </div>

        <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center'>
          <div className='text-lg font-bold text-green-600 dark:text-green-400'>
            {progressStats.stageBreakdown.final.completed}/{progressStats.stageBreakdown.final.total}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>
            Final
          </div>
        </div>
      </div>

      {/* Current Stage Info */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <div className='flex items-center gap-2'>
            <Crown className='w-4 h-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-700 dark:text-blue-400'>
              Current Stage: {getCurrentRoundInfo()}
            </span>
          </div>
          <Badge
            variant='outline'
            className='border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400'
          >
            {progressStats.currentStage}
          </Badge>
        </div>

        {getNextReadyMatches() > 0 && (
          <div className='flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Users className='w-4 h-4 text-yellow-600' />
              <span className='text-sm font-medium text-yellow-700 dark:text-yellow-400'>
                Ready to Play
              </span>
            </div>
            <Badge
              variant='outline'
              className='border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400'
            >
              {getNextReadyMatches()} matches
            </Badge>
          </div>
        )}

        {progressStats.nextActions.length > 0 && (
          <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Trophy className='w-4 h-4 text-purple-600' />
              <span className='text-sm font-medium text-purple-700 dark:text-purple-400'>
                Next Actions:
              </span>
            </div>
            <ul className='text-xs text-purple-600 dark:text-purple-400 space-y-1'>
              {progressStats.nextActions.map((action, index) => (
                <li key={index}>• {action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
